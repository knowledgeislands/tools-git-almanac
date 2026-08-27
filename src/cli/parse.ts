import { dateRange, parseDateKey } from '../core/dates.js'
import type {
  ConfigurableOption,
  DateMode,
  HistoryOptions,
  HistoryRequest,
  Metric,
  OutputFormat,
  ReportSection,
  Theme
} from '../types.js'

export type ParsedCommand =
  | { command: 'help'; topic?: string }
  | { command: 'version' }
  | { command: 'completion'; shell: 'bash' | 'zsh' }
  | { command: 'calendar' | 'authors' | 'contributors'; request: HistoryRequest }
  | { command: 'report'; section: ReportSection | 'all'; request: HistoryRequest }
  | { command: 'config'; action: 'init' | 'show' | 'check'; repository: string }
  | { command: 'ignore'; repository: string }
  | { command: 'init'; repository: string }

export const usageError = (message: string): Error => {
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
  if (!choices.includes(value as T)) throw usageError(`${option} must be one of: ${choices.join(', ')}`)
  return value as T
}

const validateDates = (options: HistoryOptions): void => {
  try {
    if (options.since) parseDateKey(options.since)
    if (options.until) parseDateKey(options.until)
    if (options.since && options.until) dateRange(options.since, options.until)
  } catch (error) {
    throw usageError((error as Error).message)
  }
}

const parseHistory = (args: string[], cwd: string, command: string): HistoryRequest => {
  const options: HistoryOptions = {
    repository: cwd,
    author: null,
    paths: [],
    ref: 'HEAD',
    since: null,
    until: null,
    date: 'author',
    includeMerges: false,
    metric: 'commits',
    format: 'terminal',
    formatExplicit: false,
    output: null,
    outputDir: null,
    theme: 'light',
    noColor: false
  }
  const supplied = new Set<ConfigurableOption>()
  let positionalRepository: string | null = null

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index] as string
    if (argument === '--include-merges') {
      options.includeMerges = true
      supplied.add('includeMerges')
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
      '--metric',
      '--format',
      '--output',
      '--output-dir',
      '--theme'
    ]
    if (valueOptions.includes(argument)) {
      const value = nextValue(args, index, argument)
      index += 1
      if (argument === '--author') {
        options.author = value
        supplied.add('author')
      }
      if (argument === '--path') {
        options.paths.push(value)
        supplied.add('paths')
      }
      if (argument === '--ref') {
        options.ref = value
        supplied.add('ref')
      }
      if (argument === '--since') {
        options.since = value
        supplied.add('since')
      }
      if (argument === '--until') {
        options.until = value
        supplied.add('until')
      }
      if (argument === '--date') {
        options.date = parseChoice<DateMode>(value, ['author', 'committer'], argument)
        supplied.add('date')
      }
      if (argument === '--metric') {
        options.metric = parseChoice<Metric>(value, ['commits'], argument)
        supplied.add('metric')
      }
      if (argument === '--format') {
        options.format = parseChoice<OutputFormat>(value, ['terminal', 'html', 'svg', 'json'], argument)
        options.formatExplicit = true
      }
      if (argument === '--output') options.output = value
      if (argument === '--output-dir') options.outputDir = value
      if (argument === '--theme') {
        options.theme = parseChoice<Theme>(value, ['light', 'dark'], argument)
        supplied.add('theme')
      }
      continue
    }

    if (argument.startsWith('-')) throw usageError(`unknown option '${argument}'`)
    if (positionalRepository) throw usageError(`${command} accepts at most one repository argument`)
    positionalRepository = argument
  }

  if (options.output && options.outputDir) throw usageError('--output and --output-dir cannot be combined')
  if (positionalRepository) options.repository = positionalRepository
  validateDates(options)
  return { options, supplied }
}

const parseRepositoryOnly = (args: string[], cwd: string, command: string): string => {
  if (args.length > 1) throw usageError(`${command} accepts at most one repository argument`)
  const repository = args[0] ?? cwd
  if (repository.startsWith('-')) throw usageError(`unknown option '${repository}'`)
  return repository
}

export const parseArgs = (args: string[], cwd: string): ParsedCommand => {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h' || args[0] === 'help') {
    return { command: 'help', ...(args[0] === 'help' && args[1] ? { topic: args[1] } : {}) }
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
  if (['calendar', 'authors', 'contributors'].includes(args[0] as string)) {
    if (args.includes('--help') || args.includes('-h')) return { command: 'help', topic: args[0] }
    const command = args[0] as 'calendar' | 'authors' | 'contributors'
    return { command, request: parseHistory(args.slice(1), cwd, command) }
  }
  if (args[0] === 'report') {
    if (args.includes('--help') || args.includes('-h')) return { command: 'help', topic: 'report' }
    const candidate = args[1]
    const sections: readonly ReportSection[] = ['calendar', 'authors', 'contributors']
    const section = sections.includes(candidate as ReportSection) ? (candidate as ReportSection) : 'all'
    const rest = section === 'all' ? args.slice(1) : args.slice(2)
    const request = parseHistory(rest, cwd, 'report')
    if (request.options.output || request.options.outputDir || request.options.formatExplicit) {
      throw usageError('report owns its workspace; --format, --output, and --output-dir are not supported')
    }
    return { command: 'report', section, request }
  }
  if (args[0] === 'config') {
    if (args.includes('--help') || args.includes('-h')) return { command: 'help', topic: 'config' }
    const action = args[1]
    if (action !== 'init' && action !== 'show' && action !== 'check') {
      throw usageError('config requires one action: init, show, or check')
    }
    return { command: 'config', action, repository: parseRepositoryOnly(args.slice(2), cwd, `config ${action}`) }
  }
  if (args[0] === 'ignore' || args[0] === 'init') {
    if (args.includes('--help') || args.includes('-h')) return { command: 'help', topic: args[0] }
    return { command: args[0], repository: parseRepositoryOnly(args.slice(1), cwd, args[0]) }
  }
  throw usageError(`unknown command '${args[0]}'`)
}
