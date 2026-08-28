import { cp, lstat, mkdir, mkdtemp, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, sep } from 'node:path'

import { renderHtml } from '../render/html.js'
import { renderPeople } from '../render/people.js'
import { escapeMarkup } from '../render/shared.js'
import { renderSvg } from '../render/svg.js'
import type { ActivityModel, PeopleModel, ReportSection, Theme } from '../types.js'

export const REPORT_RELATIVE_ROOT = join('reports', 'git-almanac')

const REPORT_SECTIONS: readonly ReportSection[] = ['calendar', 'authors', 'contributors']

interface ReportContract {
  repository: ActivityModel['repository']
  ref: ActivityModel['ref']
  filters: ActivityModel['filters']
  interval: Pick<ActivityModel['interval'], 'since' | 'until' | 'timezone'>
  countingPolicy: ActivityModel['countingPolicy']
  theme: Theme
}

export interface ReportManifest {
  schemaVersion: 1
  tool: 'git-almanac'
  generatedAt: string
  contract: ReportContract
  sections: ReportSection[]
  managedPaths: string[]
}

export interface ReportInput {
  root: string
  sections: ReportSection[]
  calendar: ActivityModel
  authors: PeopleModel
  contributors: PeopleModel
  authorCalendars: Map<string, ActivityModel>
  theme: Theme
}

const readOptional = async (path: string): Promise<string | null> => {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

const isReportSection = (value: unknown): value is ReportSection =>
  typeof value === 'string' && REPORT_SECTIONS.includes(value as ReportSection)

const isManagedPath = (value: unknown): value is string => {
  if (typeof value !== 'string' || value === '' || value.includes('\0') || isAbsolute(value) || value.includes('\\'))
    return false
  return value.split('/').every((part) => part !== '' && part !== '.' && part !== '..')
}

interface ManifestObject extends Record<string, unknown> {
  root?: unknown
  name?: unknown
  remote?: unknown
  selected?: unknown
  resolved?: unknown
  author?: unknown
  paths?: unknown
  date?: unknown
  includeMerges?: unknown
  metric?: unknown
  since?: unknown
  until?: unknown
  timezone?: unknown
  reachability?: unknown
  authors?: unknown
  identity?: unknown
  merges?: unknown
  dateField?: unknown
  timezoneGrouping?: unknown
  uniqueness?: unknown
  pathSemantics?: unknown
  theme?: unknown
}

const isRecord = (value: unknown): value is ManifestObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNullableString = (value: unknown): value is string | null => typeof value === 'string' || value === null

const isReportContract = (value: unknown): value is ReportContract => {
  if (!isRecord(value)) return false
  const { repository, ref, filters, interval, countingPolicy } = value

  return (
    isRecord(repository) &&
    typeof repository.root === 'string' &&
    typeof repository.name === 'string' &&
    isNullableString(repository.remote) &&
    isRecord(ref) &&
    typeof ref.selected === 'string' &&
    isNullableString(ref.resolved) &&
    isRecord(filters) &&
    isNullableString(filters.author) &&
    Array.isArray(filters.paths) &&
    filters.paths.every((path) => typeof path === 'string') &&
    (filters.date === 'author' || filters.date === 'committer') &&
    typeof filters.includeMerges === 'boolean' &&
    filters.metric === 'commits' &&
    isRecord(interval) &&
    typeof interval.since === 'string' &&
    typeof interval.until === 'string' &&
    typeof interval.timezone === 'string' &&
    isRecord(countingPolicy) &&
    countingPolicy.reachability === 'reachable-from-selected-ref' &&
    (countingPolicy.authors === 'all' || countingPolicy.authors === 'filtered') &&
    countingPolicy.identity === 'exact-raw-name-email' &&
    countingPolicy.metric === 'commits' &&
    (countingPolicy.merges === 'excluded' || countingPolicy.merges === 'included') &&
    (countingPolicy.dateField === 'author' || countingPolicy.dateField === 'committer') &&
    countingPolicy.timezoneGrouping === 'local-calendar-day' &&
    countingPolicy.uniqueness === 'commit-oid' &&
    countingPolicy.pathSemantics === 'git-pathspec' &&
    (value.theme === 'light' || value.theme === 'dark')
  )
}

const parseManifest = (source: string, path: string): ReportManifest => {
  try {
    const value = JSON.parse(source) as Partial<ReportManifest>
    if (
      value.schemaVersion !== 1 ||
      value.tool !== 'git-almanac' ||
      !isReportContract(value.contract) ||
      !Array.isArray(value.sections) ||
      !value.sections.every(isReportSection) ||
      !Array.isArray(value.managedPaths) ||
      !value.managedPaths.every(isManagedPath) ||
      new Set(value.managedPaths).size !== value.managedPaths.length ||
      !value.managedPaths.includes('manifest.json')
    ) {
      throw new Error('unrecognised manifest')
    }
    return value as ReportManifest
  } catch (error) {
    throw new Error(`refusing foreign report directory: invalid ${path}: ${(error as Error).message}`)
  }
}

const contractFor = (model: ActivityModel, theme: Theme): ReportContract => ({
  repository: model.repository,
  ref: model.ref,
  filters: model.filters,
  interval: {
    since: model.interval.since,
    until: model.interval.until,
    timezone: model.interval.timezone
  },
  countingPolicy: model.countingPolicy,
  theme
})

const lstatOptional = async (path: string): Promise<Awaited<ReturnType<typeof lstat>> | null> => {
  try {
    return await lstat(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

const reportPath = (root: string, path: string): string => join(root, ...path.split('/'))

const assertSafeManagedTarget = async (root: string, path: string): Promise<void> => {
  const parts = path.split('/')
  let current = root

  for (let index = 0; index < parts.length; index += 1) {
    current = join(current, parts[index] as string)
    const state = await lstatOptional(current)
    if (!state) return
    if (state.isSymbolicLink()) throw new Error(`refusing symbolic report path owned by manifest: ${path}`)
    if (index < parts.length - 1 && !state.isDirectory())
      throw new Error(`refusing non-directory report path ancestor: ${path}`)
    if (index === parts.length - 1 && !state.isFile())
      throw new Error(`refusing non-file report path owned by manifest: ${path}`)
  }
}

const writeStaged = async (root: string, path: string, content: string): Promise<void> => {
  const target = reportPath(root, path)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, content, 'utf8')
}

const copyPreserved = async (root: string, stage: string, excluded: ReadonlySet<string>): Promise<void> => {
  await cp(root, stage, {
    recursive: true,
    preserveTimestamps: true,
    verbatimSymlinks: true,
    filter: (source) => {
      if (source === root) return true
      const path = relative(root, source).split(sep).join('/')
      return !excluded.has(path)
    }
  })
}

const indexHtml = (repository: string, sections: ReportSection[], generatedAt: string, theme: Theme): string => {
  const links = sections
    .map((section) => `<li><a href="${section}.html">${section[0]?.toUpperCase()}${section.slice(1)}</a></li>`)
    .join('\n')
  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeMarkup(repository)} Git Almanac report</title>
  <style>
    :root { color-scheme: ${theme}; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; padding: 32px; background: ${theme === 'dark' ? '#0d1117' : '#f6f8fa'}; color: ${theme === 'dark' ? '#f0f6fc' : '#24292f'}; }
    main { max-width: 760px; margin: auto; }
    a { color: ${theme === 'dark' ? '#58a6ff' : '#0969da'}; }
    li { margin: 12px 0; }
  </style>
</head>
<body><main><h1>${escapeMarkup(repository)} Git Almanac</h1><p>Local repository report.</p><ul>${links}</ul><footer>Generated ${escapeMarkup(generatedAt)}</footer></main></body>
</html>
`
}

const sortedUnique = <T extends string>(values: T[]): T[] => [...new Set(values)].sort()

const renderReportContents = (input: ReportInput): Map<string, string> => {
  const contents = new Map<string, string>()

  for (const section of input.sections) {
    if (section === 'calendar') {
      contents.set('calendar.html', renderHtml(input.calendar, input.theme))
      contents.set('assets/calendar.svg', renderSvg(input.calendar, input.theme))
      contents.set('data/calendar.json', `${JSON.stringify(input.calendar, null, 2)}\n`)
    }
    if (section === 'authors') {
      contents.set('authors.html', renderPeople(input.authors, 'html', input.theme))
      contents.set('data/authors.json', `${JSON.stringify(input.authors, null, 2)}\n`)
    }
    if (section === 'contributors') {
      contents.set(
        'contributors.html',
        renderPeople(input.contributors, 'html', input.theme, (person) => `assets/contributors/${person.fileSlug}.svg`)
      )
      contents.set('data/contributors.json', `${JSON.stringify(input.contributors, null, 2)}\n`)
      for (const person of input.contributors.people) {
        const calendar = input.authorCalendars.get(person.identity) as ActivityModel
        contents.set(`assets/contributors/${person.fileSlug}.svg`, renderSvg(calendar, input.theme))
      }
    }
  }

  return contents
}

const acquireReportLock = async (path: string): Promise<void> => {
  try {
    await mkdir(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST')
      throw new Error(`refusing concurrent report update while lock exists: ${path}`)
    throw error
  }
}

export const buildReport = async (input: ReportInput): Promise<{ root: string; manifest: ReportManifest }> => {
  const root = join(input.root, REPORT_RELATIVE_ROOT)
  const reportsRoot = dirname(root)
  const lockPath = join(reportsRoot, '.git-almanac.lock')
  await mkdir(reportsRoot, { recursive: true })
  await acquireReportLock(lockPath)

  let stage: string | null = null

  try {
    const rootState = await lstatOptional(root)
    if (rootState && (rootState.isSymbolicLink() || !rootState.isDirectory()))
      throw new Error(`refusing unsafe report workspace: ${root}`)

    const manifestPath = join(root, 'manifest.json')
    const entries = rootState ? await readdir(root) : []
    const existingSource = rootState ? await readOptional(manifestPath) : null
    if (!existingSource && entries.length > 0)
      throw new Error(`refusing foreign report directory without a Git Almanac manifest: ${root}`)

    const existing = existingSource ? parseManifest(existingSource, manifestPath) : null
    const contract = contractFor(input.calendar, input.theme)
    const complete = REPORT_SECTIONS.every((section) => input.sections.includes(section))
    const compatible = !existing || JSON.stringify(existing.contract) === JSON.stringify(contract)
    if (!compatible && !complete)
      throw new Error(
        'refusing to combine report sections generated with a different repository, ref, filter, date, timezone, identity, or metric contract (including theme)'
      )

    for (const path of existing?.managedPaths ?? []) await assertSafeManagedTarget(root, path)

    const contents = renderReportContents(input)
    const sections = sortedUnique([...(existing?.sections ?? []), ...input.sections])
    contents.set(
      'index.html',
      indexHtml(input.calendar.repository.name, sections, input.calendar.generatedAt, input.theme)
    )

    const generatedPaths = [...contents.keys()]
    const managedPaths = sortedUnique([
      ...(complete ? [] : (existing?.managedPaths ?? [])),
      ...generatedPaths,
      'manifest.json'
    ])
    const manifest: ReportManifest = {
      schemaVersion: 1,
      tool: 'git-almanac',
      generatedAt: input.calendar.generatedAt,
      contract,
      sections,
      managedPaths
    }

    const existingManaged = new Set(existing?.managedPaths ?? [])
    for (const path of [...generatedPaths, 'manifest.json']) {
      await assertSafeManagedTarget(root, path)
      const state = await lstatOptional(reportPath(root, path))
      if (state && !existingManaged.has(path)) throw new Error(`refusing to overwrite unowned report path: ${path}`)
    }

    const excluded = new Set(complete ? (existing?.managedPaths ?? []) : [...generatedPaths, 'manifest.json'])
    stage = await mkdtemp(join(reportsRoot, '.git-almanac-stage-'))
    if (rootState) await copyPreserved(root, stage, excluded)
    for (const [path, content] of contents) await writeStaged(stage, path, content)
    await writeStaged(stage, 'manifest.json', `${JSON.stringify(manifest, null, 2)}\n`)

    const backup = rootState ? `${stage}-backup` : null
    if (backup) await rename(root, backup)
    try {
      await rename(stage, root)
      stage = null
    } catch (error) {
      if (backup) await rename(backup, root)
      throw error
    }
    if (backup) await rm(backup, { recursive: true, force: true })

    return { root, manifest }
  } finally {
    if (stage) await rm(stage, { recursive: true, force: true })
    await rm(lockPath, { recursive: true, force: true })
  }
}
