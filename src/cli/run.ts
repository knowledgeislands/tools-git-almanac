import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

import { applyConfig, CONFIG_NAME, initializeConfig, loadConfig, renderConfig } from '../config/config.js'
import { buildActivityModel } from '../core/activity.js'
import { buildAuthorCalendars, buildPeopleModel, type PeopleInput } from '../core/contributors.js'
import { collectHistory, executeGit, type GitExecutor, resolveRepository } from '../git/adapter.js'
import { renderHtml } from '../render/html.js'
import { renderJson } from '../render/json.js'
import { renderPeople } from '../render/people.js'
import { renderSvg } from '../render/svg.js'
import { renderTerminal } from '../render/terminal.js'
import { buildReport } from '../report/workspace.js'
import { ensureReportIgnored, reportIsIgnored } from '../repository/ignore.js'
import type {
  ActivityModel,
  HistoryOptions,
  HistoryRequest,
  OutputFormat,
  PeopleModel,
  ReportSection,
  Theme
} from '../types.js'
import { VERSION } from '../version.js'
import { HELP, renderCompletion, renderHelp } from './help.js'
import { isUsageError, parseArgs, usageError } from './parse.js'

export interface RunContext {
  cwd: string
  now: () => Date
  timezone: string
  isTTY: boolean
  noColorEnvironment: boolean
  stdout: (value: string) => void
  stderr: (value: string) => void
  writeOutput: (path: string, value: string) => Promise<void>
  git: GitExecutor
}

export const defaultContext = (): RunContext => ({
  cwd: process.cwd(),
  now: () => new Date(),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  isTTY: Boolean(process.stdout.isTTY),
  noColorEnvironment: Object.hasOwn(process.env, 'NO_COLOR'),
  stdout: (value) => process.stdout.write(value),
  stderr: (value) => process.stderr.write(value),
  writeOutput: async (path, value) => writeFile(path, value, 'utf8'),
  git: executeGit
})

const renderCalendar = (model: ActivityModel, format: OutputFormat, theme: Theme, color: boolean): string => {
  if (format === 'terminal') return renderTerminal(model, theme, color)
  if (format === 'html') return renderHtml(model, theme)
  if (format === 'svg') return renderSvg(model, theme)
  return renderJson(model)
}

const inferredFormat = (path: string): OutputFormat | null => {
  const extension = extname(path).toLowerCase()
  if (extension === '.html' || extension === '.htm') return 'html'
  if (extension === '.svg') return 'svg'
  if (extension === '.json') return 'json'
  return null
}

const extensionFor = (format: OutputFormat): string => (format === 'terminal' ? 'txt' : format)

const applyOutputInference = (options: HistoryOptions): HistoryOptions => {
  if (options.formatExplicit || !options.output) return options
  return { ...options, format: inferredFormat(options.output) ?? options.format }
}

const defaultRequest = (repository: string): HistoryRequest => ({
  supplied: new Set(),
  options: {
    repository,
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
})

const resolveHistoryRequest = async (
  request: HistoryRequest,
  context: RunContext
): Promise<{ options: HistoryOptions; repository: Awaited<ReturnType<typeof resolveRepository>> }> => {
  const repository = await resolveRepository(request.options.repository, context.cwd, context.git)
  const config = await loadConfig(repository.root)
  const options = applyOutputInference({ ...applyConfig(request, config), repository: repository.root })
  return { options, repository }
}

const writeSingleOutput = async (output: string, options: HistoryOptions, context: RunContext): Promise<void> => {
  if (options.output) await context.writeOutput(resolve(context.cwd, options.output), output)
  else context.stdout(output)
}

const writeCalendarSet = async (
  directory: string,
  options: HistoryOptions,
  calendar: ActivityModel,
  people: PeopleModel,
  calendars: Map<string, ActivityModel>,
  color: boolean,
  context: RunContext
): Promise<void> => {
  const target = resolve(context.cwd, directory)
  await mkdir(target, { recursive: true })
  const extension = extensionFor(options.format)
  await context.writeOutput(
    join(target, `all.${extension}`),
    renderCalendar(calendar, options.format, options.theme, color)
  )
  for (const person of people.people) {
    const model = calendars.get(person.identity) as ActivityModel
    await context.writeOutput(
      join(target, `${person.fileSlug}.${extension}`),
      renderCalendar(model, options.format, options.theme, color)
    )
  }
  context.stdout(`Wrote ${people.people.length + 1} calendar files to ${target}\n`)
}

const selectedReportSections = (section: ReportSection | 'all'): ReportSection[] =>
  section === 'all' ? ['calendar', 'authors', 'contributors'] : [section]

const runConfigurationCommand = async (
  action: 'init' | 'show' | 'check',
  repositoryArgument: string,
  context: RunContext
): Promise<number> => {
  const repository = await resolveRepository(repositoryArgument, context.cwd, context.git)
  if (action === 'init') {
    const result = await initializeConfig(repository.root)
    context.stdout(`${result === 'created' ? 'Created' : 'Validated existing'} ${join(repository.root, CONFIG_NAME)}\n`)
    return 0
  }
  const config = await loadConfig(repository.root)
  if (action === 'check') {
    context.stdout(
      config ? `Valid ${join(repository.root, CONFIG_NAME)}\n` : `No ${CONFIG_NAME}; built-in defaults are valid\n`
    )
    return 0
  }
  context.stdout(renderConfig(applyConfig(defaultRequest(repository.root), config)))
  return 0
}

const runIgnoreCommand = async (repositoryArgument: string, context: RunContext): Promise<number> => {
  const repository = await resolveRepository(repositoryArgument, context.cwd, context.git)
  const result = await ensureReportIgnored(repository.root, context.cwd, context.git)
  context.stdout(
    result.changed
      ? `Added ${result.rule} to ${join(repository.root, '.gitignore')}\n`
      : `Report output is already ignored in ${repository.root}\n`
  )
  return 0
}

export const run = async (args: string[], context: RunContext = defaultContext()): Promise<number> => {
  try {
    const parsed = parseArgs(args, context.cwd)
    if (parsed.command === 'help') {
      context.stdout(renderHelp(parsed.topic))
      return 0
    }
    if (parsed.command === 'version') {
      context.stdout(`git-almanac ${VERSION}\n`)
      return 0
    }
    if (parsed.command === 'completion') {
      context.stdout(renderCompletion(parsed.shell))
      return 0
    }
    if (parsed.command === 'config') {
      return await runConfigurationCommand(parsed.action, parsed.repository, context)
    }
    if (parsed.command === 'ignore') return await runIgnoreCommand(parsed.repository, context)
    if (parsed.command === 'init') {
      await runConfigurationCommand('init', parsed.repository, context)
      return await runIgnoreCommand(parsed.repository, context)
    }

    const { options, repository } = await resolveHistoryRequest(parsed.request, context)
    if ((parsed.command === 'authors' || parsed.command === 'contributors') && options.format === 'svg') {
      throw usageError(`${parsed.command} supports terminal, HTML, and JSON output; use calendar for SVG`)
    }
    if ((parsed.command === 'authors' || parsed.command === 'contributors') && options.outputDir) {
      throw usageError('--output-dir is supported by calendar; report creates managed contributor assets')
    }

    const history = await collectHistory(options, context.cwd, repository, context.git)
    const input: PeopleInput = {
      commits: history.commits,
      repository: history.repository,
      resolvedRef: history.resolvedRef,
      options,
      now: context.now(),
      timezone: context.timezone
    }
    const calendar = buildActivityModel(input)
    const authors = buildPeopleModel(input, 'authors')
    const contributors = buildPeopleModel(input, 'contributors')
    const color = !options.noColor && !context.noColorEnvironment && context.isTTY

    if (parsed.command === 'report') {
      const authorCalendars = buildAuthorCalendars(input, contributors.people)
      const result = await buildReport({
        root: repository.root,
        sections: selectedReportSections(parsed.section),
        calendar,
        authors,
        contributors,
        authorCalendars,
        theme: options.theme
      })
      context.stdout(`Updated Git Almanac report at ${result.root}\n`)
      if (!(await reportIsIgnored(repository.root, context.cwd, context.git))) {
        context.stderr(`git-almanac: warning: report output is not ignored; run 'git almanac ignore'\n`)
      }
      return 0
    }

    if (parsed.command === 'calendar') {
      if (options.outputDir) {
        const calendars = buildAuthorCalendars(input, contributors.people)
        await writeCalendarSet(options.outputDir, options, calendar, contributors, calendars, color, context)
      } else {
        await writeSingleOutput(renderCalendar(calendar, options.format, options.theme, color), options, context)
      }
      return 0
    }

    const model = parsed.command === 'authors' ? authors : contributors
    await writeSingleOutput(renderPeople(model, options.format, options.theme), options, context)
    return 0
  } catch (error) {
    if (isUsageError(error)) {
      context.stderr(`git-almanac: error: ${error.message}\n\n${HELP}`)
      return 2
    }
    const message = error instanceof Error ? error.message : String(error)
    context.stderr(`git-almanac: error: ${message}\n`)
    return 1
  }
}
