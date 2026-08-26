import { dateRange, parseDateKey } from '../core/dates.js'
import type { DateMode, OutputFormat, Theme, YearOptions } from '../types.js'

export type ParsedCommand =
  | { command: 'help' }
  | { command: 'version' }
  | { command: 'completion'; shell: 'bash' | 'zsh' }
  | { command: 'year'; options: YearOptions }

const usageError = (message: string): Error => {
  const error = new Error(message)
  error.name = 'UsageError'
  return error
}

export const isUsageError = (error: unknown): error is Error => error instanceof Error && error.name === 'UsageError'

const nextValue = (args: string[], index: number, option: string): string => {
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw usageError(`${option} requires a value`)
  return value
}

const parseChoice = <T extends string>(value: string, choices: readonly T[], option: string): T => {
  if (!choices.includes(value as T)) {
    throw usageError(`${option} must be one of: ${choices.join(', ')}`)
  }
  return value as T
}

const parseYear = (args: string[], cwd: string): YearOptions => {
  const options: YearOptions = {
    repository: cwd,
    author: null,
    paths: [],
    ref: 'HEAD',
    since: null,
    until: null,
    date: 'author',
    includeMerges: false,
    format: 'terminal',
    output: null,
    theme: 'light',
    noColor: false
  }
  let positionalRepository: string | null = null

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index] as string
    if (argument === '--include-merges') {
      options.includeMerges = true
      continue
    }
    if (argument === '--no-color') {
      options.noColor = true
      continue
    }
    const valueOptions = [
      '--author',
      '--path',
      '--ref',
      '--since',
      '--until',
      '--date',
      '--format',
      '--output',
      '--theme'
    ]
    if (valueOptions.includes(argument)) {
      const value = nextValue(args, index, argument)
      index += 1
      if (argument === '--author') options.author = value
      if (argument === '--path') options.paths.push(value)
      if (argument === '--ref') options.ref = value
      if (argument === '--since') options.since = value
      if (argument === '--until') options.until = value
      if (argument === '--date') options.date = parseChoice<DateMode>(value, ['author', 'committer'], argument)
      if (argument === '--format') {
        options.format = parseChoice<OutputFormat>(value, ['terminal', 'html', 'svg', 'json'], argument)
      }
      if (argument === '--output') options.output = value
      if (argument === '--theme') options.theme = parseChoice<Theme>(value, ['light', 'dark'], argument)
      continue
    }

    if (argument.startsWith('-')) throw usageError(`unknown option '${argument}'`)
    if (positionalRepository) throw usageError('year accepts at most one repository argument')
    positionalRepository = argument
  }

  if (positionalRepository) options.repository = positionalRepository
  try {
    if (options.since) parseDateKey(options.since)
    if (options.until) parseDateKey(options.until)
    if (options.since && options.until) dateRange(options.since, options.until)
  } catch (error) {
    throw usageError((error as Error).message)
  }
  return options
}

export const parseArgs = (args: string[], cwd: string): ParsedCommand => {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h' || args[0] === 'help') {
    return { command: 'help' }
  }
  if (args[0] === '--version' || args[0] === '-V') {
    if (args.length > 1) throw usageError('--version accepts no arguments')
    return { command: 'version' }
  }
  if (args[0] === 'completion') {
    const shell = args[1]
    if (args.length !== 2 || (shell !== 'bash' && shell !== 'zsh')) {
      throw usageError('completion requires exactly one supported shell: bash or zsh')
    }
    return { command: 'completion', shell }
  }
  if (args[0] === 'year') {
    if (args.includes('--help') || args.includes('-h')) return { command: 'help' }
    return { command: 'year', options: parseYear(args.slice(1), cwd) }
  }
  throw usageError(`unknown command '${args[0]}'`)
}
