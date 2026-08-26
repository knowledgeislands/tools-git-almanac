import { execFile } from 'node:child_process'
import { basename } from 'node:path'
import { promisify } from 'node:util'

import type { GitCommit, RepositoryIdentity, YearOptions } from '../types.js'

const execFileAsync = promisify(execFile)

const gitProcessError = (message: string): Error => {
  const error = new Error(message)
  error.name = 'GitProcessError'
  return error
}

export interface GitResult {
  stdout: string
  stderr: string
  exitCode: number
}

export type GitExecutor = (args: string[], cwd: string) => Promise<GitResult>

export const executeGit: GitExecutor = async (args, cwd) => {
  try {
    const result = await execFileAsync('git', args, { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
    return { stdout: result.stdout, stderr: result.stderr, exitCode: 0 }
  } catch (error) {
    const failure = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string; code?: number }
    return {
      stdout: '',
      stderr: failure.stderr || failure.message,
      exitCode: typeof failure.code === 'number' ? failure.code : 1
    }
  }
}

const requireGit = async (executor: GitExecutor, args: string[], cwd: string, message: string): Promise<string> => {
  const result = await executor(args, cwd)
  if (result.exitCode !== 0) throw gitProcessError(`${message}: ${result.stderr.trim() || 'Git failed'}`)
  return result.stdout.trim()
}

const parseCommits = (output: string): GitCommit[] =>
  output
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [oid, authorEpoch, committerEpoch] = record.split('\x1f')
      if (!oid || !authorEpoch || !committerEpoch) throw gitProcessError('Git returned malformed history data')
      return {
        oid,
        authorEpoch: Number(authorEpoch),
        committerEpoch: Number(committerEpoch)
      }
    })

export interface CollectedHistory {
  repository: RepositoryIdentity
  resolvedRef: string | null
  commits: GitCommit[]
}

export const collectHistory = async (
  options: YearOptions,
  cwd: string,
  executor: GitExecutor = executeGit
): Promise<CollectedHistory> => {
  const root = await requireGit(
    executor,
    ['-C', options.repository, 'rev-parse', '--show-toplevel'],
    cwd,
    `not a Git repository: ${options.repository}`
  )

  const remoteResult = await executor(['-C', root, 'config', '--get', 'remote.origin.url'], cwd)
  const remote = remoteResult.exitCode === 0 ? remoteResult.stdout.trim() || null : null
  const refResult = await executor(['-C', root, 'rev-parse', '--verify', `${options.ref}^{commit}`], cwd)

  if (refResult.exitCode !== 0) {
    const headResult = await executor(['-C', root, 'rev-parse', '--verify', 'HEAD'], cwd)
    if (options.ref === 'HEAD' && headResult.exitCode !== 0) {
      return {
        repository: { root, name: basename(root), remote },
        resolvedRef: null,
        commits: []
      }
    }
    throw gitProcessError(`invalid Git ref '${options.ref}': ${refResult.stderr.trim() || 'not found'}`)
  }

  const resolvedRef = refResult.stdout.trim()
  const args = ['-C', root, 'log', resolvedRef, '--format=%H%x1f%at%x1f%ct%x1e', '--no-decorate']
  if (!options.includeMerges) args.push('--no-merges')
  if (options.author) args.push(`--author=${options.author}`)
  if (options.paths.length > 0) args.push('--', ...options.paths)

  const history = await requireGit(executor, args, cwd, 'could not read Git history')
  return {
    repository: { root, name: basename(root), remote },
    resolvedRef,
    commits: parseCommits(history)
  }
}
