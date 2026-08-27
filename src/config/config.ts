import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { dateRange, parseDateKey } from '../core/dates.js'
import type { AlmanacConfig, ConfigurableOption, HistoryOptions, HistoryRequest } from '../types.js'

export const CONFIG_NAME = '.git-almanac.toml'

export const CONFIG_TEMPLATE = `schema = 1

# Repository-local defaults. CLI options always win.
ref = "HEAD"
date = "author"
include_merges = false
metric = "commits"
theme = "light"
paths = []
`

const configError = (path: string, message: string): Error => new Error(`invalid ${path}: ${message}`)

const stripComment = (line: string): string => {
  let quoted = false
  let escaped = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (character === '\\' && quoted) {
      escaped = true
      continue
    }
    if (character === '"') quoted = !quoted
    if (character === '#' && !quoted) return line.slice(0, index).trim()
  }
  return line.trim()
}

const parseString = (value: string, path: string, key: string): string => {
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'string') throw new Error('not a string')
    return parsed
  } catch {
    throw configError(path, `${key} must be a double-quoted string`)
  }
}

const parseStringArray = (value: string, path: string, key: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== 'string')) throw new Error('not strings')
    return parsed as string[]
  } catch {
    throw configError(path, `${key} must be an array of double-quoted strings`)
  }
}

const requireChoice = <T extends string>(value: string, choices: readonly T[], path: string, key: string): T => {
  if (!choices.includes(value as T)) throw configError(path, `${key} must be one of: ${choices.join(', ')}`)
  return value as T
}

export const parseConfig = (source: string, path = CONFIG_NAME): AlmanacConfig => {
  const values = new Map<string, string>()
  for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const line = stripComment(rawLine)
    if (!line) continue
    if (line.startsWith('[')) throw configError(path, `line ${index + 1}: tables are not supported`)
    const match = /^([a-z_]+)\s*=\s*(.+)$/.exec(line)
    if (!match?.[1] || !match[2]) throw configError(path, `line ${index + 1}: expected key = value`)
    if (values.has(match[1])) throw configError(path, `line ${index + 1}: duplicate key ${match[1]}`)
    values.set(match[1], match[2].trim())
  }

  const known = new Set([
    'schema',
    'author',
    'paths',
    'ref',
    'since',
    'until',
    'date',
    'include_merges',
    'metric',
    'theme'
  ])
  for (const key of values.keys()) if (!known.has(key)) throw configError(path, `unknown key ${key}`)
  if (values.get('schema') !== '1') throw configError(path, 'schema must be 1')

  const config: AlmanacConfig = { schema: 1 }
  const stringKeys = ['author', 'ref', 'since', 'until'] as const
  for (const key of stringKeys) {
    const raw = values.get(key)
    if (raw !== undefined) config[key] = parseString(raw, path, key)
  }
  const paths = values.get('paths')
  if (paths !== undefined) config.paths = parseStringArray(paths, path, 'paths')
  const includeMerges = values.get('include_merges')
  if (includeMerges !== undefined) {
    if (includeMerges !== 'true' && includeMerges !== 'false') {
      throw configError(path, 'include_merges must be true or false')
    }
    config.includeMerges = includeMerges === 'true'
  }
  const date = values.get('date')
  if (date !== undefined) {
    config.date = requireChoice(parseString(date, path, 'date'), ['author', 'committer'] as const, path, 'date')
  }
  const metric = values.get('metric')
  if (metric !== undefined) {
    config.metric = requireChoice(parseString(metric, path, 'metric'), ['commits'] as const, path, 'metric')
  }
  const theme = values.get('theme')
  if (theme !== undefined) {
    config.theme = requireChoice(parseString(theme, path, 'theme'), ['light', 'dark'] as const, path, 'theme')
  }

  try {
    if (config.since) parseDateKey(config.since)
    if (config.until) parseDateKey(config.until)
    if (config.since && config.until) dateRange(config.since, config.until)
  } catch (error) {
    throw configError(path, (error as Error).message)
  }
  return config
}

export const loadConfig = async (root: string): Promise<AlmanacConfig | null> => {
  const path = join(root, CONFIG_NAME)
  try {
    return parseConfig(await readFile(path, 'utf8'), path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

const configMapping: ReadonlyArray<[ConfigurableOption, keyof AlmanacConfig]> = [
  ['author', 'author'],
  ['paths', 'paths'],
  ['ref', 'ref'],
  ['since', 'since'],
  ['until', 'until'],
  ['date', 'date'],
  ['includeMerges', 'includeMerges'],
  ['metric', 'metric'],
  ['theme', 'theme']
]

export const applyConfig = (request: HistoryRequest, config: AlmanacConfig | null): HistoryOptions => {
  if (!config) return request.options
  const options = { ...request.options, paths: [...request.options.paths] }
  for (const [optionKey, configKey] of configMapping) {
    if (request.supplied.has(optionKey)) continue
    const value = config[configKey]
    if (value !== undefined) Object.assign(options, { [optionKey]: value })
  }
  try {
    if (options.since) parseDateKey(options.since)
    if (options.until) parseDateKey(options.until)
    if (options.since && options.until) dateRange(options.since, options.until)
  } catch (error) {
    throw configError(CONFIG_NAME, (error as Error).message)
  }
  return options
}

const quote = (value: string): string => JSON.stringify(value)

export const renderConfig = (options: HistoryOptions): string =>
  [
    'schema = 1',
    `ref = ${quote(options.ref)}`,
    ...(options.since ? [`since = ${quote(options.since)}`] : []),
    ...(options.until ? [`until = ${quote(options.until)}`] : []),
    `date = ${quote(options.date)}`,
    `include_merges = ${options.includeMerges}`,
    `metric = ${quote(options.metric)}`,
    `theme = ${quote(options.theme)}`,
    ...(options.author ? [`author = ${quote(options.author)}`] : []),
    `paths = ${JSON.stringify(options.paths)}`,
    ''
  ].join('\n')

export const initializeConfig = async (root: string): Promise<'created' | 'existing'> => {
  const path = join(root, CONFIG_NAME)
  const existing = await loadConfig(root)
  if (existing) return 'existing'
  await writeFile(path, CONFIG_TEMPLATE, { encoding: 'utf8', flag: 'wx' })
  return 'created'
}
