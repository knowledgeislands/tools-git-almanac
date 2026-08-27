import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import { renderHtml } from '../render/html.js'
import { renderPeople } from '../render/people.js'
import { escapeMarkup } from '../render/shared.js'
import { renderSvg } from '../render/svg.js'
import type { ActivityModel, PeopleModel, ReportSection, Theme } from '../types.js'

export const REPORT_RELATIVE_ROOT = join('reports', 'git-almanac')

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

const listOptional = async (path: string): Promise<string[]> => {
  try {
    return await readdir(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

const parseManifest = (source: string, path: string): ReportManifest => {
  try {
    const value = JSON.parse(source) as Partial<ReportManifest>
    if (
      value.schemaVersion !== 1 ||
      value.tool !== 'git-almanac' ||
      !value.contract ||
      !Array.isArray(value.sections) ||
      !Array.isArray(value.managedPaths)
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

const atomicWrite = async (path: string, content: string): Promise<void> => {
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.tmp-${process.pid}`
  await writeFile(temporary, content, 'utf8')
  await rename(temporary, path)
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

export const buildReport = async (input: ReportInput): Promise<{ root: string; manifest: ReportManifest }> => {
  const root = join(input.root, REPORT_RELATIVE_ROOT)
  const manifestPath = join(root, 'manifest.json')
  const existingSource = await readOptional(manifestPath)
  const entries = await listOptional(root)
  if (!existingSource && entries.length > 0) {
    throw new Error(`refusing foreign report directory without a Git Almanac manifest: ${root}`)
  }

  const existing = existingSource ? parseManifest(existingSource, manifestPath) : null
  const contract = contractFor(input.calendar, input.theme)
  if (existing && JSON.stringify(existing.contract) !== JSON.stringify(contract)) {
    throw new Error(
      'refusing to combine report sections generated with a different repository, ref, filter, date, timezone, identity, or metric contract'
    )
  }

  await mkdir(root, { recursive: true })
  const managedPaths = [...(existing?.managedPaths ?? [])]
  const record = async (relative: string, content: string): Promise<void> => {
    await atomicWrite(join(root, relative), content)
    managedPaths.push(relative)
  }

  for (const section of input.sections) {
    if (section === 'calendar') {
      await record('calendar.html', renderHtml(input.calendar, input.theme))
      await record('assets/calendar.svg', renderSvg(input.calendar, input.theme))
      await record('data/calendar.json', `${JSON.stringify(input.calendar, null, 2)}\n`)
    }
    if (section === 'authors') {
      await record('authors.html', renderPeople(input.authors, 'html', input.theme))
      await record('data/authors.json', `${JSON.stringify(input.authors, null, 2)}\n`)
    }
    if (section === 'contributors') {
      await record(
        'contributors.html',
        renderPeople(input.contributors, 'html', input.theme, (person) => `assets/contributors/${person.fileSlug}.svg`)
      )
      await record('data/contributors.json', `${JSON.stringify(input.contributors, null, 2)}\n`)
      for (const person of input.contributors.people) {
        const calendar = input.authorCalendars.get(person.identity)
        if (calendar) await record(`assets/contributors/${person.fileSlug}.svg`, renderSvg(calendar, input.theme))
      }
    }
  }

  const sections = sortedUnique([...(existing?.sections ?? []), ...input.sections])
  const generatedAt = input.calendar.generatedAt
  await record('index.html', indexHtml(input.calendar.repository.name, sections, generatedAt, input.theme))
  const manifest: ReportManifest = {
    schemaVersion: 1,
    tool: 'git-almanac',
    generatedAt,
    contract,
    sections,
    managedPaths: sortedUnique([...managedPaths, 'manifest.json'])
  }
  await atomicWrite(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return { root, manifest }
}
