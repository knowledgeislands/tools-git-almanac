import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'

import { afterEach, expect, test, vi } from 'vitest'

const publicationFault = vi.hoisted(() => ({ enabled: false, lstat: false, lock: false }))

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    lstat: async (...args: Parameters<typeof actual.lstat>): ReturnType<typeof actual.lstat> => {
      if (publicationFault.lstat && basename(String(args[0])) === 'git-almanac') {
        publicationFault.lstat = false
        const error = new Error('simulated report stat failure') as NodeJS.ErrnoException
        error.code = 'EACCES'
        throw error
      }
      return actual.lstat(...args)
    },
    mkdir: async (...args: Parameters<typeof actual.mkdir>): ReturnType<typeof actual.mkdir> => {
      if (publicationFault.lock && basename(String(args[0])) === '.git-almanac.lock') {
        publicationFault.lock = false
        const error = new Error('simulated report lock failure') as NodeJS.ErrnoException
        error.code = 'EACCES'
        throw error
      }
      return actual.mkdir(...args)
    },
    rename: async (source: string, target: string): Promise<void> => {
      const sourceName = basename(source)
      if (
        publicationFault.enabled &&
        sourceName.startsWith('.git-almanac-stage-') &&
        !sourceName.endsWith('-backup') &&
        basename(target) === 'git-almanac'
      ) {
        publicationFault.enabled = false
        throw new Error('simulated report publication failure')
      }
      await actual.rename(source, target)
    }
  }
})

import { type RunContext, run } from '../cli/run.js'
import { executeGit } from '../git/adapter.js'

const roots: string[] = []

const git = (cwd: string, args: string[]): void => {
  execFileSync('git', args, { cwd, stdio: 'ignore' })
}

const repository = (): string => {
  const root = mkdtempSync(join(tmpdir(), 'git-almanac-report-transaction-'))
  roots.push(root)
  git(root, ['init', '-b', 'main'])
  git(root, ['config', 'user.name', 'Transaction Test'])
  git(root, ['config', 'user.email', 'transaction@example.com'])
  writeFileSync(join(root, 'activity.txt'), 'activity\n')
  git(root, ['add', 'activity.txt'])
  execFileSync('git', ['commit', '-m', 'activity'], {
    cwd: root,
    stdio: 'ignore',
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: '2026-08-26T12:00:00Z',
      GIT_COMMITTER_DATE: '2026-08-26T12:00:00Z'
    }
  })
  return root
}

const invoke = async (root: string, args: string[]): Promise<{ code: number; stderr: string }> => {
  let stderr = ''
  const context: RunContext = {
    cwd: root,
    now: () => new Date('2026-08-26T12:00:00.000Z'),
    timezone: 'UTC',
    isTTY: false,
    noColorEnvironment: false,
    stdout: () => {},
    stderr: (value) => {
      stderr += value
    },
    writeOutput: async (path, value) => {
      mkdirSync(join(path, '..'), { recursive: true })
      writeFileSync(path, value)
    },
    git: executeGit
  }
  return { code: await run(args, context), stderr }
}

afterEach(() => {
  publicationFault.enabled = false
  publicationFault.lstat = false
  publicationFault.lock = false
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

test('initial report removes staging after failed publication', async () => {
  const root = repository()
  const reportsRoot = join(root, 'reports')
  publicationFault.enabled = true

  const failed = await invoke(root, ['report'])

  expect(failed.code).toBe(1)
  expect(failed.stderr).toContain('simulated report publication failure')
  expect(readdirSync(reportsRoot).filter((entry) => entry.startsWith('.git-almanac'))).toEqual([])
})

test('filesystem failures propagate without leaving a lock', async () => {
  const statRoot = repository()
  publicationFault.lstat = true
  const statFailed = await invoke(statRoot, ['report'])
  expect(statFailed.code).toBe(1)
  expect(statFailed.stderr).toContain('simulated report stat failure')
  expect(readdirSync(join(statRoot, 'reports')).filter((entry) => entry.startsWith('.git-almanac'))).toEqual([])

  const lockRoot = repository()
  publicationFault.lock = true
  const lockFailed = await invoke(lockRoot, ['report'])
  expect(lockFailed.code).toBe(1)
  expect(lockFailed.stderr).toContain('simulated report lock failure')
  expect(readdirSync(join(lockRoot, 'reports')).filter((entry) => entry.startsWith('.git-almanac'))).toEqual([])
})

test('changed complete report rolls back a failed staged workspace publication', async () => {
  const root = repository()
  expect((await invoke(root, ['report', '--since', '2026-08-26', '--until', '2026-08-26'])).code).toBe(0)
  const reportsRoot = join(root, 'reports')
  const reportRoot = join(reportsRoot, 'git-almanac')
  const manifestPath = join(reportRoot, 'manifest.json')
  const indexPath = join(reportRoot, 'index.html')
  const manifestSource = readFileSync(manifestPath, 'utf8')
  const indexSource = readFileSync(indexPath, 'utf8')
  writeFileSync(join(reportRoot, 'unowned.txt'), 'preserved')

  publicationFault.enabled = true
  const failed = await invoke(root, ['report', '--since', '2026-08-26', '--until', '2026-08-26', '--theme', 'dark'])

  expect(failed.code).toBe(1)
  expect(failed.stderr).toContain('simulated report publication failure')
  expect(readFileSync(manifestPath, 'utf8')).toBe(manifestSource)
  expect(readFileSync(indexPath, 'utf8')).toBe(indexSource)
  expect(readFileSync(join(reportRoot, 'unowned.txt'), 'utf8')).toBe('preserved')
  expect(readdirSync(reportsRoot).filter((entry) => entry.startsWith('.git-almanac'))).toEqual([])
})
