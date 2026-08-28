import { execFileSync } from 'node:child_process'
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'

import { afterAll, describe, expect, test } from 'vitest'

import { type RunContext, run } from '../cli/run.js'
import { executeGit, type GitExecutor } from '../git/adapter.js'
import { renderPeople } from '../render/people.js'
import type { PeopleModel, ReportSection } from '../types.js'

const roots: string[] = []
const fixedNow = new Date('2026-08-26T12:00:00.000Z')

const git = (cwd: string, args: string[], env: NodeJS.ProcessEnv = {}): string =>
  execFileSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } }).trim()

const repository = (label: string): string => {
  const root = mkdtempSync(join(tmpdir(), `git-almanac-new-${label}-`))
  roots.push(root)
  git(root, ['init', '-b', 'main'])
  git(root, ['config', 'user.name', 'Test User'])
  git(root, ['config', 'user.email', 'test@example.com'])
  return root
}

interface CommitOptions {
  author: string
  email: string
  date: string
  path?: string
}

const commit = (root: string, options: CommitOptions): void => {
  const path = options.path ?? 'activity.txt'
  const target = join(root, path)
  mkdirSync(dirname(target), { recursive: true })
  appendFileSync(target, `${options.author} ${options.date}\n`)
  git(root, ['add', '--', path])
  git(root, ['commit', '-m', `${options.author} ${options.date}`], {
    GIT_AUTHOR_NAME: options.author,
    GIT_AUTHOR_EMAIL: options.email,
    GIT_AUTHOR_DATE: options.date,
    GIT_COMMITTER_NAME: options.author,
    GIT_COMMITTER_EMAIL: options.email,
    GIT_COMMITTER_DATE: options.date
  })
}

interface InvokeOptions {
  cwd?: string
  git?: GitExecutor
  now?: Date
  timezone?: string
}

const invoke = async (args: string[], options: InvokeOptions = {}) => {
  let stdout = ''
  let stderr = ''
  const written = new Map<string, string>()
  const context: RunContext = {
    cwd: options.cwd ?? process.cwd(),
    now: () => options.now ?? fixedNow,
    timezone: options.timezone ?? 'UTC',
    isTTY: false,
    noColorEnvironment: false,
    stdout: (value) => {
      stdout += value
    },
    stderr: (value) => {
      stderr += value
    },
    writeOutput: async (path, value) => {
      written.set(path, value)
    },
    git: options.git ?? executeGit
  }
  const code = await run(args, context)
  return { code, stdout, stderr, written }
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

describe('Git Almanac expanded command contract', () => {
  test('renders scoped help and rejects command-specific invalid combinations', async () => {
    const root = repository('usage')
    commit(root, { author: 'Alice', email: 'alice@example.com', date: '2026-08-26T12:00:00Z' })
    for (const topic of ['config', 'report', 'calendar', 'ignore', 'init', 'not-a-topic']) {
      const help = await invoke(['help', topic])
      expect(help.code).toBe(0)
      expect(help.stdout).toContain('Usage:')
    }
    for (const args of [
      ['report', '--help'],
      ['config', '--help'],
      ['ignore', '--help'],
      ['init', '--help'],
      ['calendar', root, '--output', 'one.svg', '--output-dir', 'many'],
      ['report', root, '--format', 'json'],
      ['config', 'unknown'],
      ['ignore', root, 'extra'],
      ['ignore', '--unknown'],
      ['authors', root, '--format', 'svg'],
      ['contributors', root, '--output-dir', 'many']
    ]) {
      const result = await invoke(args)
      if (args.includes('--help')) expect(result.code).toBe(0)
      else expect(result.code).toBe(2)
    }
    expect((await invoke(['calendar', root, '--metric', 'commits'])).code).toBe(0)
  })

  test('lists exact authors and ranks contributors from one history traversal', async () => {
    const root = repository('people')
    commit(root, { author: 'Alice Example', email: 'alice@example.com', date: '2026-08-24T12:00:00Z' })
    commit(root, { author: 'Bob Example', email: 'bob@example.com', date: '2026-08-25T12:00:00Z' })
    commit(root, { author: 'Alice Example', email: 'alice@example.com', date: '2026-08-26T12:00:00Z' })
    let traversals = 0
    const countingGit: GitExecutor = async (args, cwd) => {
      if (args.includes('log')) traversals += 1
      return executeGit(args, cwd)
    }

    const authors = await invoke(['authors', root, '--since', '2026-08-24', '--until', '2026-08-26'], {
      git: countingGit
    })
    expect(authors.code).toBe(0)
    expect(authors.stdout).toContain('Alice Example <alice@example.com>')
    expect(authors.stdout).toContain('Bob Example <bob@example.com>')
    expect(traversals).toBe(1)

    const contributors = await invoke([
      'contributors',
      root,
      '--since',
      '2026-08-24',
      '--until',
      '2026-08-26',
      '--format',
      'json'
    ])
    const model = JSON.parse(contributors.stdout) as PeopleModel
    expect(model.people.map((person) => [person.identity, person.commits])).toEqual([
      ['Alice Example <alice@example.com>', 2],
      ['Bob Example <bob@example.com>', 1]
    ])
    expect(model.people[0]?.share).toBe(66.666667)
    expect(model.countingPolicy.identity).toBe('exact-raw-name-email')
    expect(model.countingPolicy.metric).toBe('commits')
    expect((await invoke(['contributors', root])).stdout).toContain('  1  Alice Example')
  })

  test('infers output format from extension while explicit format wins', async () => {
    const root = repository('inference')
    commit(root, { author: 'Alice', email: 'alice@example.com', date: '2026-08-26T12:00:00Z' })

    const inferred = await invoke([
      'calendar',
      root,
      '--since',
      '2026-08-26',
      '--until',
      '2026-08-26',
      '--output',
      'calendar.svg'
    ])
    expect([...inferred.written.values()][0]).toContain('<svg')

    const overridden = await invoke([
      'calendar',
      root,
      '--since',
      '2026-08-26',
      '--until',
      '2026-08-26',
      '--format',
      'json',
      '--output',
      'calendar.svg'
    ])
    expect(() => JSON.parse([...overridden.written.values()][0] as string)).not.toThrow()

    const stdout = await invoke(['calendar', root, '--format', 'html'])
    expect(stdout.stdout).toContain('<!doctype html>')
    const inferredJson = await invoke(['calendar', root, '--output', 'calendar.json'])
    expect(() => JSON.parse([...inferredJson.written.values()][0] as string)).not.toThrow()
  })

  test('writes combined and per-author calendar sets only with output-dir', async () => {
    const root = repository('calendar-set')
    commit(root, { author: 'Alice', email: 'alice@example.com', date: '2026-08-25T12:00:00Z' })
    commit(root, { author: 'Bob', email: 'bob@example.com', date: '2026-08-26T12:00:00Z' })
    const outputDir = join(root, 'exports')
    const result = await invoke([
      'calendar',
      root,
      '--since',
      '2026-08-25',
      '--until',
      '2026-08-26',
      '--format',
      'svg',
      '--output-dir',
      outputDir
    ])
    expect(result.code).toBe(0)
    expect([...result.written.keys()].map((path) => basename(path)).sort()).toEqual([
      'alice-alice-example-com-cf03b7e8.svg',
      'all.svg',
      'bob-bob-example-com-d7117734.svg'
    ])
    const terminalSet = await invoke(['calendar', root, '--output-dir', join(root, 'text-exports')])
    expect([...terminalSet.written.keys()].every((path) => path.endsWith('.txt'))).toBe(true)
  })

  test('applies built-in then repository then CLI configuration precedence from a nested directory', async () => {
    const root = repository('config')
    const nested = join(root, 'src', 'nested')
    mkdirSync(nested, { recursive: true })
    commit(root, { author: 'Alice', email: 'alice@example.com', date: '2026-08-24T12:00:00Z' })
    commit(root, { author: 'Bob', email: 'bob@example.com', date: '2026-08-26T12:00:00Z' })
    writeFileSync(
      join(root, '.git-almanac.toml'),
      'schema = 1\nsince = "2026-08-24"\nuntil = "2026-08-24"\nmetric = "commits"\npaths = []\n'
    )

    const configured = await invoke(['calendar', '--format', 'json'], { cwd: nested })
    expect(JSON.parse(configured.stdout).summary.totalCommits).toBe(1)
    const overridden = await invoke(['calendar', '--until', '2026-08-26', '--format', 'json'], { cwd: nested })
    expect(JSON.parse(overridden.stdout).summary.totalCommits).toBe(2)
    expect((await invoke(['config', 'check'], { cwd: nested })).stdout).toContain('Valid')
    expect((await invoke(['config', 'show'], { cwd: nested })).stdout).toContain('since = "2026-08-24"')
    const withoutConfig = repository('no-config')
    expect((await invoke(['config', 'check', withoutConfig])).stdout).toContain('No .git-almanac.toml')
    expect((await invoke(['config', 'show', withoutConfig])).stdout).not.toContain('since =')
  })

  test('initialises configuration and chooses broad or narrow safe ignore rules idempotently', async () => {
    const broad = repository('ignore-broad')
    const first = await invoke(['init', broad])
    expect(first.code).toBe(0)
    expect(readFileSync(join(broad, '.gitignore'), 'utf8')).toBe('/reports/\n')
    expect(existsSync(join(broad, '.git-almanac.toml'))).toBe(true)
    const second = await invoke(['init', broad])
    expect(second.code).toBe(0)
    expect(readFileSync(join(broad, '.gitignore'), 'utf8')).toBe('/reports/\n')

    const narrow = repository('ignore-narrow')
    mkdirSync(join(narrow, 'reports'), { recursive: true })
    writeFileSync(join(narrow, 'reports', 'coverage.html'), 'tracked report')
    git(narrow, ['add', 'reports/coverage.html'])
    commit(narrow, {
      author: 'Maintainer',
      email: 'maintainer@example.com',
      date: '2026-08-26T12:00:00Z',
      path: 'activity.txt'
    })
    const ignored = await invoke(['ignore', narrow])
    expect(ignored.code).toBe(0)
    expect(readFileSync(join(narrow, '.gitignore'), 'utf8')).toBe('/reports/git-almanac/\n')
  })

  test('builds compatible partial reports and refuses foreign or incompatible workspaces', async () => {
    const freshPartial = repository('fresh-partial-report')
    commit(freshPartial, { author: 'Partial', email: 'partial@example.com', date: '2026-08-26T12:00:00Z' })
    expect((await invoke(['report', 'authors', freshPartial])).code).toBe(0)
    const freshManifest = JSON.parse(
      readFileSync(join(freshPartial, 'reports', 'git-almanac', 'manifest.json'), 'utf8')
    ) as { sections: ReportSection[] }
    expect(freshManifest.sections).toEqual(['authors'])

    const root = repository('report')
    commit(root, { author: 'Alice', email: 'alice@example.com', date: '2026-08-25T12:00:00Z' })
    commit(root, { author: 'Bob', email: 'bob@example.com', date: '2026-08-26T12:00:00Z' })
    const contract = [root, '--since', '2026-08-25', '--until', '2026-08-26']
    const all = await invoke(['report', ...contract])
    expect(all.code).toBe(0)
    const reportRoot = join(root, 'reports', 'git-almanac')
    expect(readdirSync(reportRoot).sort()).toEqual([
      'assets',
      'authors.html',
      'calendar.html',
      'contributors.html',
      'data',
      'index.html',
      'manifest.json'
    ])
    const manifest = JSON.parse(readFileSync(join(reportRoot, 'manifest.json'), 'utf8')) as {
      sections: ReportSection[]
      managedPaths: string[]
    }
    expect(manifest.sections).toEqual(['authors', 'calendar', 'contributors'])
    expect(manifest.managedPaths).toContain('assets/calendar.svg')
    expect(readdirSync(join(reportRoot, 'assets', 'contributors'))).toHaveLength(2)
    expect(readFileSync(join(reportRoot, 'contributors.html'), 'utf8')).toContain('assets/contributors/')

    const partial = await invoke(['report', 'authors', ...contract])
    expect(partial.code).toBe(0)
    const incompatible = await invoke(['report', 'calendar', root, '--since', '2026-08-26', '--until', '2026-08-26'])
    expect(incompatible.code).toBe(1)
    expect(incompatible.stderr).toContain(
      'different repository, ref, filter, date, timezone, identity, or metric contract'
    )

    writeFileSync(join(reportRoot, 'unowned.txt'), 'preserve me')
    writeFileSync(join(reportRoot, 'stale-managed.txt'), 'remove me')
    const staleManifest = JSON.parse(readFileSync(join(reportRoot, 'manifest.json'), 'utf8')) as {
      managedPaths: string[]
    }
    staleManifest.managedPaths.push('stale-managed.txt')
    writeFileSync(join(reportRoot, 'manifest.json'), `${JSON.stringify(staleManifest, null, 2)}\n`)

    const rebuilt = await invoke(['report', root, '--since', '2026-08-26', '--until', '2026-08-26', '--theme', 'dark'])
    expect(rebuilt.code).toBe(0)
    const rebuiltManifest = JSON.parse(readFileSync(join(reportRoot, 'manifest.json'), 'utf8')) as {
      contract: { interval: { since: string }; theme: string }
      managedPaths: string[]
    }
    expect(rebuiltManifest.contract.interval.since).toBe('2026-08-26')
    expect(rebuiltManifest.contract.theme).toBe('dark')
    expect(rebuiltManifest.managedPaths).not.toContain('stale-managed.txt')
    expect(existsSync(join(reportRoot, 'stale-managed.txt'))).toBe(false)
    expect(readFileSync(join(reportRoot, 'unowned.txt'), 'utf8')).toBe('preserve me')

    git(root, ['branch', 'report-ref', 'HEAD~1'])
    const rebuiltSelectors = await invoke(
      [
        'report',
        root,
        '--ref',
        'report-ref',
        '--author',
        'Alice',
        '--path',
        'activity.txt',
        '--since',
        '2026-08-25',
        '--until',
        '2026-08-25',
        '--date',
        'committer',
        '--include-merges',
        '--theme',
        'light'
      ],
      { timezone: 'Europe/London' }
    )
    expect(rebuiltSelectors.code).toBe(0)
    const selectorManifest = JSON.parse(readFileSync(join(reportRoot, 'manifest.json'), 'utf8')) as {
      contract: {
        ref: { selected: string }
        filters: { author: string; paths: string[]; date: string; includeMerges: boolean; metric: string }
        interval: { since: string; until: string; timezone: string }
        countingPolicy: { identity: string; metric: string }
        theme: string
      }
    }
    expect(selectorManifest.contract).toMatchObject({
      ref: { selected: 'report-ref' },
      filters: {
        author: 'Alice',
        paths: ['activity.txt'],
        date: 'committer',
        includeMerges: true,
        metric: 'commits'
      },
      interval: { since: '2026-08-25', until: '2026-08-25', timezone: 'Europe/London' },
      countingPolicy: { identity: 'exact-raw-name-email', metric: 'commits' },
      theme: 'light'
    })
    expect(readFileSync(join(reportRoot, 'unowned.txt'), 'utf8')).toBe('preserve me')

    const incompatibleAfterRebuild = await invoke([
      'report',
      'authors',
      root,
      '--since',
      '2026-08-25',
      '--until',
      '2026-08-26',
      '--theme',
      'dark'
    ])
    expect(incompatibleAfterRebuild.code).toBe(1)
    expect(JSON.parse(readFileSync(join(reportRoot, 'manifest.json'), 'utf8'))).toEqual(selectorManifest)

    const changedRepository = repository('report-changed-repository')
    commit(changedRepository, {
      author: 'Other Owner',
      email: 'other@example.com',
      date: '2026-08-26T12:00:00Z'
    })
    mkdirSync(join(changedRepository, 'reports'), { recursive: true })
    cpSync(reportRoot, join(changedRepository, 'reports', 'git-almanac'), { recursive: true })

    const rebuiltRepository = await invoke(['report', changedRepository])
    expect(rebuiltRepository.code).toBe(0)
    const changedRepositoryRoot = join(changedRepository, 'reports', 'git-almanac')
    const changedRepositoryManifest = JSON.parse(
      readFileSync(join(changedRepositoryRoot, 'manifest.json'), 'utf8')
    ) as { contract: { repository: { root: string } } }
    expect(changedRepositoryManifest.contract.repository.root).toBe(realpathSync(changedRepository))
    expect(readFileSync(join(changedRepositoryRoot, 'unowned.txt'), 'utf8')).toBe('preserve me')

    const foreign = repository('foreign-report')
    mkdirSync(join(foreign, 'reports', 'git-almanac'), { recursive: true })
    writeFileSync(join(foreign, 'reports', 'git-almanac', 'foreign.txt'), 'do not overwrite')
    const refused = await invoke(['report', foreign])
    expect(refused.code).toBe(1)
    expect(refused.stderr).toContain('refusing foreign report directory')
    expect(readFileSync(join(foreign, 'reports', 'git-almanac', 'foreign.txt'), 'utf8')).toBe('do not overwrite')

    for (const [label, manifestSource] of [
      ['invalid-json', '{'],
      ['invalid-shape', '{}']
    ] as const) {
      const invalidManifest = repository(label)
      mkdirSync(join(invalidManifest, 'reports', 'git-almanac'), { recursive: true })
      writeFileSync(join(invalidManifest, 'reports', 'git-almanac', 'manifest.json'), manifestSource)
      const invalid = await invoke(['report', invalidManifest])
      expect(invalid.code).toBe(1)
      expect(invalid.stderr).toContain('invalid')
    }

    const manifestDirectory = repository('manifest-directory')
    mkdirSync(join(manifestDirectory, 'reports', 'git-almanac', 'manifest.json'), { recursive: true })
    expect((await invoke(['report', manifestDirectory])).code).toBe(1)

    const reportFile = repository('report-file')
    mkdirSync(join(reportFile, 'reports'), { recursive: true })
    writeFileSync(join(reportFile, 'reports', 'git-almanac'), 'not a directory')
    expect((await invoke(['report', reportFile])).code).toBe(1)
  })

  test('refuses unowned report collisions without partial publication', async () => {
    const collision = repository('report-unowned-collision')
    commit(collision, {
      author: 'Owner',
      email: 'owner@example.com',
      date: '2026-08-26T12:00:00Z'
    })
    expect((await invoke(['report', collision])).code).toBe(0)
    const collisionRoot = join(collision, 'reports', 'git-almanac')
    const collisionManifestPath = join(collisionRoot, 'manifest.json')
    const collisionManifest = JSON.parse(readFileSync(collisionManifestPath, 'utf8')) as { managedPaths: string[] }
    collisionManifest.managedPaths = collisionManifest.managedPaths.filter((path) => path !== 'authors.html')
    writeFileSync(collisionManifestPath, `${JSON.stringify(collisionManifest, null, 2)}\n`)
    const collisionManifestSource = readFileSync(collisionManifestPath, 'utf8')
    const collisionAuthorsSource = readFileSync(join(collisionRoot, 'authors.html'), 'utf8')

    const collisionResult = await invoke(['report', collision, '--theme', 'dark'])
    expect(collisionResult.code).toBe(1)
    expect(collisionResult.stderr).toContain('refusing to overwrite unowned report path: authors.html')
    expect(readFileSync(collisionManifestPath, 'utf8')).toBe(collisionManifestSource)
    expect(readFileSync(join(collisionRoot, 'authors.html'), 'utf8')).toBe(collisionAuthorsSource)
    expect(readdirSync(join(collision, 'reports')).filter((entry) => entry.startsWith('.git-almanac'))).toEqual([])
  })

  test('rejects malformed and unsafe report manifests', async () => {
    const unsafe = repository('report-unsafe-manifest')
    commit(unsafe, { author: 'Owner', email: 'owner@example.com', date: '2026-08-26T12:00:00Z' })
    expect((await invoke(['report', unsafe])).code).toBe(0)
    const unsafeRoot = join(unsafe, 'reports', 'git-almanac')
    const unsafeManifestPath = join(unsafeRoot, 'manifest.json')
    const unsafeManifest = JSON.parse(readFileSync(unsafeManifestPath, 'utf8')) as { managedPaths: string[] }
    unsafeManifest.managedPaths.push('../outside.txt')
    writeFileSync(unsafeManifestPath, `${JSON.stringify(unsafeManifest, null, 2)}\n`)
    writeFileSync(join(unsafe, 'reports', 'outside.txt'), 'outside')
    const unsafeManifestSource = readFileSync(unsafeManifestPath, 'utf8')

    const unsafeResult = await invoke(['report', unsafe, '--theme', 'dark'])
    expect(unsafeResult.code).toBe(1)
    expect(unsafeResult.stderr).toContain('unrecognised manifest')
    expect(readFileSync(unsafeManifestPath, 'utf8')).toBe(unsafeManifestSource)
    expect(readFileSync(join(unsafe, 'reports', 'outside.txt'), 'utf8')).toBe('outside')

    unsafeManifest.managedPaths[unsafeManifest.managedPaths.length - 1] = '/outside.txt'
    writeFileSync(unsafeManifestPath, `${JSON.stringify(unsafeManifest, null, 2)}\n`)
    expect((await invoke(['report', unsafe, '--theme', 'dark'])).stderr).toContain('unrecognised manifest')

    const malformed = repository('report-malformed-contract')
    commit(malformed, { author: 'Owner', email: 'owner@example.com', date: '2026-08-26T12:00:00Z' })
    expect((await invoke(['report', malformed])).code).toBe(0)
    const malformedManifestPath = join(malformed, 'reports', 'git-almanac', 'manifest.json')
    const malformedManifest = JSON.parse(readFileSync(malformedManifestPath, 'utf8')) as { contract: unknown }
    malformedManifest.contract = {}
    writeFileSync(malformedManifestPath, `${JSON.stringify(malformedManifest, null, 2)}\n`)
    const malformedManifestSource = readFileSync(malformedManifestPath, 'utf8')

    const malformedResult = await invoke(['report', malformed, '--theme', 'dark'])
    expect(malformedResult.code).toBe(1)
    expect(malformedResult.stderr).toContain('unrecognised manifest')
    expect(readFileSync(malformedManifestPath, 'utf8')).toBe(malformedManifestSource)

    malformedManifest.contract = null
    writeFileSync(malformedManifestPath, `${JSON.stringify(malformedManifest, null, 2)}\n`)
    expect((await invoke(['report', malformed, '--theme', 'dark'])).stderr).toContain('unrecognised manifest')
  })

  test('rejects unsafe manifest-owned filesystem shapes', async () => {
    const symbolic = repository('report-symbolic-owned-path')
    commit(symbolic, { author: 'Owner', email: 'owner@example.com', date: '2026-08-26T12:00:00Z' })
    expect((await invoke(['report', symbolic])).code).toBe(0)
    const symbolicRoot = join(symbolic, 'reports', 'git-almanac')
    rmSync(join(symbolicRoot, 'authors.html'))
    symlinkSync(join(symbolicRoot, 'calendar.html'), join(symbolicRoot, 'authors.html'))
    expect((await invoke(['report', symbolic, '--theme', 'dark'])).stderr).toContain('refusing symbolic report path')

    const blockedAncestor = repository('report-blocked-owned-ancestor')
    commit(blockedAncestor, { author: 'Owner', email: 'owner@example.com', date: '2026-08-26T12:00:00Z' })
    expect((await invoke(['report', blockedAncestor])).code).toBe(0)
    const blockedAncestorRoot = join(blockedAncestor, 'reports', 'git-almanac')
    rmSync(join(blockedAncestorRoot, 'assets'), { recursive: true })
    writeFileSync(join(blockedAncestorRoot, 'assets'), 'not a directory')
    expect((await invoke(['report', blockedAncestor, '--theme', 'dark'])).stderr).toContain(
      'refusing non-directory report path ancestor'
    )

    const nonFile = repository('report-non-file-owned-path')
    commit(nonFile, { author: 'Owner', email: 'owner@example.com', date: '2026-08-26T12:00:00Z' })
    expect((await invoke(['report', nonFile])).code).toBe(0)
    const nonFileRoot = join(nonFile, 'reports', 'git-almanac')
    rmSync(join(nonFileRoot, 'authors.html'))
    mkdirSync(join(nonFileRoot, 'authors.html'))
    expect((await invoke(['report', nonFile, '--theme', 'dark'])).stderr).toContain(
      'refusing non-file report path owned by manifest'
    )
  })

  test('refuses concurrent report updates without mutation', async () => {
    const locked = repository('report-locked')
    commit(locked, { author: 'Owner', email: 'owner@example.com', date: '2026-08-26T12:00:00Z' })
    expect((await invoke(['report', locked])).code).toBe(0)
    const lockedManifestPath = join(locked, 'reports', 'git-almanac', 'manifest.json')
    const lockedManifestSource = readFileSync(lockedManifestPath, 'utf8')
    mkdirSync(join(locked, 'reports', '.git-almanac.lock'))

    const lockedResult = await invoke(['report', locked, '--theme', 'dark'])
    expect(lockedResult.code).toBe(1)
    expect(lockedResult.stderr).toContain('refusing concurrent report update')
    expect(readFileSync(lockedManifestPath, 'utf8')).toBe(lockedManifestSource)
  })
  test('supports dark ignored reports, empty people views, and renderer guardrails', async () => {
    const root = repository('dark-report')
    commit(root, { author: 'Dark Author', email: 'dark@example.com', date: '2026-08-26T12:00:00Z' })
    expect((await invoke(['ignore', root])).code).toBe(0)
    const report = await invoke(['report', root, '--since', '2026-08-26', '--until', '2026-08-26', '--theme', 'dark'])
    expect(report.code).toBe(0)
    expect(report.stderr).toBe('')
    expect(readFileSync(join(root, 'reports', 'git-almanac', 'index.html'), 'utf8')).toContain('#0d1117')

    const empty = repository('empty-people')
    const authors = await invoke(['authors', empty])
    expect(authors.stdout).toContain('No matching authors.')
    const json = await invoke(['authors', empty, '--format', 'json'])
    const model = JSON.parse(json.stdout) as PeopleModel
    expect(() => renderPeople(model, 'svg', 'light')).toThrow('does not support SVG')
    const htm = await invoke(['calendar', root, '--output', 'calendar.htm'])
    expect([...htm.written.values()][0]).toContain('<!doctype html>')
  })
})
