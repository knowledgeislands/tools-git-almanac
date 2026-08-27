import { execFileSync } from 'node:child_process'
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterAll, describe, expect, test } from 'vitest'

import { defaultContext, type RunContext, run } from '../cli/run.js'
import { executeGit, type GitExecutor } from '../git/adapter.js'
import type { ActivityModel } from '../types.js'

const roots: string[] = []
const fixedNow = new Date('2026-08-26T12:00:00.000Z')

const git = (cwd: string, args: string[], env: NodeJS.ProcessEnv = {}): string =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env }
  }).trim()

const repository = (label = 'repository with spaces'): string => {
  const root = mkdtempSync(join(tmpdir(), `git-almanac-${label}-`))
  roots.push(root)
  git(root, ['init', '-b', 'main'])
  git(root, ['config', 'user.name', 'Test User'])
  git(root, ['config', 'user.email', 'test@example.com'])
  return root
}

interface CommitOptions {
  path?: string
  author?: string
  email?: string
  authorDate: string
  committerDate?: string
  message?: string
}

const commit = (root: string, options: CommitOptions): string => {
  const path = options.path ?? 'activity.txt'
  const target = join(root, path)
  mkdirSync(dirname(target), { recursive: true })
  appendFileSync(target, `${options.message ?? options.authorDate}\n`)
  git(root, ['add', '--', path])
  const author = options.author ?? 'Test User'
  const email = options.email ?? 'test@example.com'
  const committerDate = options.committerDate ?? options.authorDate
  git(root, ['commit', '-m', options.message ?? `commit ${options.authorDate}`], {
    GIT_AUTHOR_NAME: author,
    GIT_AUTHOR_EMAIL: email,
    GIT_AUTHOR_DATE: options.authorDate,
    GIT_COMMITTER_NAME: author,
    GIT_COMMITTER_EMAIL: email,
    GIT_COMMITTER_DATE: committerDate
  })
  return git(root, ['rev-parse', 'HEAD'])
}

interface Invocation {
  code: number
  stdout: string
  stderr: string
  written: Map<string, string>
}

interface InvokeOptions {
  timezone?: string
  now?: Date
  isTTY?: boolean
  noColorEnvironment?: boolean
  git?: GitExecutor
  outputError?: unknown
}

const invoke = async (args: string[], options: InvokeOptions = {}): Promise<Invocation> => {
  let stdout = ''
  let stderr = ''
  const written = new Map<string, string>()
  const context: RunContext = {
    cwd: process.cwd(),
    now: () => options.now ?? fixedNow,
    timezone: options.timezone ?? 'UTC',
    isTTY: options.isTTY ?? false,
    noColorEnvironment: options.noColorEnvironment ?? false,
    stdout: (value) => {
      stdout += value
    },
    stderr: (value) => {
      stderr += value
    },
    writeOutput: async (path, value) => {
      if (options.outputError) throw options.outputError
      written.set(path, value)
    },
    git: options.git ?? executeGit
  }
  const code = await run(args, context)
  return { code, stdout, stderr, written }
}

const report = async (root: string, extra: string[] = [], options: InvokeOptions = {}): Promise<ActivityModel> => {
  const result = await invoke(['year', root, '--format', 'json', ...extra], options)
  expect(result.code).toBe(0)
  return JSON.parse(result.stdout) as ActivityModel
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

describe('Git Almanac CLI contract', () => {
  test('renders help, version, and completion surfaces', async () => {
    const help = await invoke([])
    expect(help.code).toBe(0)
    expect(help.stdout).toContain('Usage: git almanac year')

    const version = await invoke(['--version'])
    expect(version.stdout).toMatch(/^git-almanac 0\.1\.0/)

    const bash = await invoke(['completion', 'bash'])
    expect(bash.stdout).toContain('complete -F _git_almanac git-almanac')

    const zsh = await invoke(['completion', 'zsh'])
    expect(zsh.stdout).toContain('#compdef git-almanac')
    expect(zsh.stdout).toContain('compdef _git_almanac git-almanac')

    expect((await invoke(['help'])).stdout).toContain('Usage: git almanac year')
    expect((await invoke(['year', '--help'])).stdout).toContain('Usage: git almanac year')
    expect((await invoke(['-V'])).stdout).toContain('git-almanac 0.1.0')
    expect((await invoke(['year', '--format', 'json'])).code).toBe(0)
  })

  test('constructs a usable default process context', async () => {
    const context = defaultContext()
    expect(context.cwd).toBe(process.cwd())
    expect(context.now()).toBeInstanceOf(Date)
    expect(context.timezone).toBeTruthy()
    context.stdout('')
    context.stderr('')
    const target = join(repository('default context'), 'output.txt')
    await context.writeOutput(target, 'ok')
    expect(readFileSync(target, 'utf8')).toBe('ok')
  })

  test('calculates a trailing 365-day interval and complete 53-week grid across leap day', async () => {
    const root = repository('leap')
    const model = await report(root, [], { now: new Date('2024-03-01T12:00:00Z') })
    expect(model.interval).toMatchObject({
      since: '2023-03-03',
      until: '2024-03-01',
      days: 365,
      weeks: 53,
      gridSince: '2023-02-26',
      gridUntil: '2024-03-02'
    })
    expect(model.daily).toHaveLength(365)
  })

  test('pads custom partial weeks without counting padding dates', async () => {
    const root = repository('partial')
    const model = await report(root, ['--since', '2024-02-28', '--until', '2024-03-01'])
    expect(model.interval).toMatchObject({
      days: 3,
      weeks: 1,
      gridSince: '2024-02-25',
      gridUntil: '2024-03-02'
    })
    expect(model.daily.map((day) => day.date)).toEqual(['2024-02-28', '2024-02-29', '2024-03-01'])
  })

  test('groups by author or committer date and local timezone', async () => {
    const root = repository('dates')
    commit(root, {
      authorDate: '2026-08-26T23:30:00Z',
      committerDate: '2026-08-27T01:00:00Z'
    })

    const authorUtc = await report(root, ['--since', '2026-08-26', '--until', '2026-08-26'])
    expect(authorUtc.summary.totalCommits).toBe(1)

    const committerUtc = await report(root, ['--since', '2026-08-27', '--until', '2026-08-27', '--date', 'committer'])
    expect(committerUtc.summary.totalCommits).toBe(1)

    const authorAuckland = await report(root, ['--since', '2026-08-27', '--until', '2026-08-27'], {
      timezone: 'Pacific/Auckland'
    })
    expect(authorAuckland.summary.totalCommits).toBe(1)
  })

  test('excludes merges by default and includes each reachable commit once when requested', async () => {
    const root = repository('merges')
    commit(root, { authorDate: '2026-08-20T12:00:00Z', message: 'base' })
    git(root, ['checkout', '-b', 'feature'])
    commit(root, { authorDate: '2026-08-21T12:00:00Z', path: 'feature.txt', message: 'feature' })
    git(root, ['checkout', 'main'])
    commit(root, { authorDate: '2026-08-22T12:00:00Z', path: 'main.txt', message: 'main' })
    git(root, ['merge', '--no-ff', 'feature', '-m', 'merge feature'], {
      GIT_AUTHOR_DATE: '2026-08-23T12:00:00Z',
      GIT_COMMITTER_DATE: '2026-08-23T12:00:00Z'
    })

    const withoutMerges = await report(root, ['--since', '2026-08-20', '--until', '2026-08-23'])
    expect(withoutMerges.summary.totalCommits).toBe(3)

    const withMerges = await report(root, ['--since', '2026-08-20', '--until', '2026-08-23', '--include-merges'])
    expect(withMerges.summary.totalCommits).toBe(4)
    expect(new Set(withMerges.daily.map((day) => day.date)).size).toBe(withMerges.daily.length)
  })

  test('filters authors and pathspecs including paths with spaces', async () => {
    const root = repository('filters')
    commit(root, {
      author: 'Alice Example',
      email: 'alice@example.com',
      authorDate: '2026-08-24T12:00:00Z',
      path: 'space dir/alice.txt'
    })
    commit(root, {
      author: 'Bob Example',
      email: 'bob@example.com',
      authorDate: '2026-08-25T12:00:00Z',
      path: 'other/bob.txt'
    })

    const alice = await report(root, ['--since', '2026-08-24', '--until', '2026-08-25', '--author', 'Alice'])
    expect(alice.summary.totalCommits).toBe(1)

    const spacedPath = await report(root, ['--since', '2026-08-24', '--until', '2026-08-25', '--path', 'space dir'])
    expect(spacedPath.summary.totalCommits).toBe(1)
  })

  test('supports alternate refs independently of current HEAD', async () => {
    const root = repository('refs')
    const first = commit(root, { authorDate: '2026-08-20T12:00:00Z' })
    git(root, ['tag', 'first', first])
    commit(root, { authorDate: '2026-08-21T12:00:00Z' })

    const head = await report(root, ['--since', '2026-08-20', '--until', '2026-08-21'])
    const tagged = await report(root, ['--since', '2026-08-20', '--until', '2026-08-21', '--ref', 'first'])
    expect(head.summary.totalCommits).toBe(2)
    expect(tagged.summary.totalCommits).toBe(1)
    expect(tagged.ref.resolved).toBe(first)
    git(root, ['remote', 'add', 'origin', 'https://example.com/example/repository.git'])
    const withRemote = await report(root, ['--ref', 'first'])
    expect(withRemote.repository.remote).toBe('https://example.com/example/repository.git')
  })

  test('handles empty repositories and years with no selected activity', async () => {
    const empty = repository('empty')
    const emptyModel = await report(empty)
    expect(emptyModel.ref.resolved).toBeNull()
    expect(emptyModel.summary).toEqual({
      totalCommits: 0,
      activeDays: 0,
      busiestDay: null,
      currentStreak: 0,
      longestStreak: 0
    })
    expect((await invoke(['year', empty, '--no-color'])).stdout).toContain('busiest No activity')

    const old = repository('old')
    commit(old, { authorDate: '2020-01-01T12:00:00Z' })
    const oldModel = await report(old)
    expect(oldModel.summary.totalCommits).toBe(0)
  })

  test('uses stable shared intensity thresholds and streak statistics', async () => {
    const root = repository('intensity')
    for (let day = 20; day <= 23; day += 1) {
      for (let count = 0; count < day - 19; count += 1) {
        commit(root, {
          authorDate: `2026-08-${day}T12:00:0${count}Z`,
          path: `day-${day}-${count}.txt`
        })
      }
    }
    const model = await report(root, ['--since', '2026-08-20', '--until', '2026-08-23'])
    expect(model.intensityThresholds).toEqual([1, 2, 3, 4])
    expect(model.daily.map((day) => day.intensity)).toEqual([1, 2, 3, 4])
    expect(model.summary).toMatchObject({
      totalCommits: 10,
      activeDays: 4,
      currentStreak: 4,
      longestStreak: 4,
      busiestDay: { date: '2026-08-23', count: 4 }
    })
  })

  test('keeps totals consistent and exposes accessible SVG labels in every renderer', async () => {
    const root = repository('renderers')
    commit(root, { authorDate: '2026-08-26T12:00:00Z' })
    const base = ['year', root, '--since', '2026-08-26', '--until', '2026-08-26']
    const terminal = await invoke([...base, '--format', 'terminal', '--no-color'])
    const svg = await invoke([...base, '--format', 'svg'])
    const html = await invoke([...base, '--format', 'html', '--theme', 'dark'])
    const json = await invoke([...base, '--format', 'json'])

    expect(terminal.stdout).toContain('1 commits')
    expect(terminal.stdout).toContain('█')
    expect(svg.stdout).toContain('role="img"')
    expect(svg.stdout).toContain('aria-label="2026-08-26: 1 commit"')
    expect(html.stdout).toContain('<!doctype html>')
    expect(html.stdout).toContain('data-theme="dark"')
    expect(html.stdout).toContain('1 commits')
    expect((JSON.parse(json.stdout) as ActivityModel).summary.totalCommits).toBe(1)
  })

  test('emits ANSI colour only for an eligible terminal', async () => {
    const root = repository('color')
    commit(root, { authorDate: '2026-08-26T12:00:00Z' })
    const args = ['year', root, '--since', '2026-08-26', '--until', '2026-08-26']
    const color = await invoke(args, { isTTY: true })
    expect(color.stdout).toContain('\u001B[38;2;')

    const environmentDisabled = await invoke(args, { isTTY: true, noColorEnvironment: true })
    expect(environmentDisabled.stdout).not.toContain('\u001B[')
  })

  test('writes explicit output and remains deterministic with an injected clock', async () => {
    const root = repository('deterministic')
    commit(root, { authorDate: '2026-08-26T12:00:00Z' })
    const args = ['year', root, '--format', 'svg', '--output', 'report.svg']
    const first = await invoke(args)
    const second = await invoke(args)
    const expectedPath = join(process.cwd(), 'report.svg')
    expect(first.stdout).toBe('')
    expect(first.written.get(expectedPath)).toBe(second.written.get(expectedPath))
  })

  test('uses one Git history traversal', async () => {
    const root = repository('single traversal')
    commit(root, { authorDate: '2026-08-26T12:00:00Z' })
    let traversals = 0
    const countingExecutor: GitExecutor = async (args, cwd) => {
      if (args.includes('log')) traversals += 1
      return executeGit(args, cwd)
    }
    const result = await invoke(['year', root, '--format', 'json'], { git: countingExecutor })
    expect(result.code).toBe(0)
    expect(traversals).toBe(1)
  })

  test('reports invalid repositories, refs, dates, options, and commands helpfully', async () => {
    const missing = await invoke(['year', join(tmpdir(), 'git-almanac-does-not-exist')])
    expect(missing.code).toBe(1)
    expect(missing.stderr).toContain('not a Git repository')

    const root = repository('errors')
    commit(root, { authorDate: '2026-08-26T12:00:00Z' })
    const invalidRef = await invoke(['year', root, '--ref', 'missing-ref'])
    expect(invalidRef.code).toBe(1)
    expect(invalidRef.stderr).toContain("invalid Git ref 'missing-ref'")

    for (const args of [
      ['year', root, '--since', 'not-a-date'],
      ['year', root, '--since', '2026-02-30'],
      ['year', root, '--since', '2026-08-27', '--until', '2026-08-26'],
      ['year', root, '--format', 'pdf'],
      ['year', root, '--date', 'tree'],
      ['year', root, '--theme', 'blue'],
      ['year', root, '--author', '--no-color'],
      ['year', root, '--unknown'],
      ['year', root, 'second-repository'],
      ['completion', 'fish'],
      ['completion', 'bash', 'extra'],
      ['--version', 'extra'],
      ['unknown']
    ]) {
      const result = await invoke(args)
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('git-almanac: error:')
    }
  })

  test('surfaces output failures without changing history', async () => {
    const root = repository('output error')
    commit(root, { authorDate: '2026-08-26T12:00:00Z' })
    const result = await invoke(['year', root, '--output', 'blocked.txt'], { outputError: 'write blocked' })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('write blocked')
    const before = git(root, ['rev-parse', 'HEAD'])
    const after = git(root, ['rev-parse', 'HEAD'])
    expect(after).toBe(before)
  })

  test('reports malformed Git output and dependency failures', async () => {
    const root = repository('fake git')
    const oid = '1'.repeat(40)
    const malformedExecutor: GitExecutor = async (args) => {
      if (args.includes('--show-toplevel')) return { stdout: root, stderr: '', exitCode: 0 }
      if (args.includes('config')) return { stdout: '', stderr: '', exitCode: 0 }
      if (args.includes('--verify')) return { stdout: oid, stderr: '', exitCode: 0 }
      return { stdout: 'malformed\x1e', stderr: '', exitCode: 0 }
    }
    const malformed = await invoke(['year', root], { git: malformedExecutor })
    expect(malformed.code).toBe(1)
    expect(malformed.stderr).toContain('malformed history data')

    const emptyFailure: GitExecutor = async () => ({ stdout: '', stderr: '', exitCode: 1 })
    const failed = await invoke(['year', root], { git: emptyFailure })
    expect(failed.stderr).toContain('Git failed')

    const invalidRefExecutor: GitExecutor = async (args) => {
      if (args.includes('--show-toplevel')) return { stdout: root, stderr: '', exitCode: 0 }
      if (args.includes('config')) return { stdout: '', stderr: '', exitCode: 1 }
      if (args.at(-1) === 'HEAD') return { stdout: oid, stderr: '', exitCode: 0 }
      return { stdout: '', stderr: '', exitCode: 1 }
    }
    const invalid = await invoke(['year', root, '--ref', 'missing'], { git: invalidRefExecutor })
    expect(invalid.stderr).toContain("invalid Git ref 'missing': not found")

    const environment = process.env as { PATH?: string }
    const originalPath = environment.PATH
    environment.PATH = ''
    const missingGit = await executeGit(['--version'], process.cwd())
    environment.PATH = originalPath
    expect(missingGit.exitCode).toBe(1)
    expect(missingGit.stderr).toContain('git')
  })
})
