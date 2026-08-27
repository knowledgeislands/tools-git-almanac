import { execFile } from 'node:child_process'
import { basename } from 'node:path'
import { promisify } from 'node:util'

import type { GitCommit, HistoryOptions, RepositoryIdentity } from '../types.js'

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

const requireGit = async (
  executor: GitExecutor,
  args: string[],
  cwd: string,
  message: string,
  trim = true
): Promise<string> => {
  const result = await executor(args, cwd)
  if (result.exitCode !== 0) throw gitProcessError(`${message}: ${result.stderr.trim() || 'Git failed'}`)
  return trim ? result.stdout.trim() : result.stdout
}

const parseCommits = (output: string): GitCommit[] =>
  output
    .split('\x1e')
    .map((record) => record.replace(/^\n+|\n+$/g, ''))
    .filter(Boolean)
    .map((record) => {
      const [oid, authorEpoch, committerEpoch, authorName, authorEmail] = record.split('\x1f')
      if (!oid || !authorEpoch || !committerEpoch || authorName === undefined || authorEmail === undefined) {
        throw gitProcessError('Git returned malformed history data')
      }
      return {
        oid,
        authorEpoch: Number(authorEpoch),
        committerEpoch: Number(committerEpoch),
        author: {
          name: authorName,
          email: authorEmail,
          identity: `${authorName} <${authorEmail}>`
        }
      }
    })

export interface CollectedHistory {
  repository: RepositoryIdentity
  resolvedRef: string | null
  commits: GitCommit[]
}

export const resolveRepository = async (
  repository: string,
  cwd: string,
  executor: GitExecutor = executeGit
): Promise<RepositoryIdentity> => {
  const root = await requireGit(
    executor,
    ['-C', repository, 'rev-parse', '--show-toplevel'],
    cwd,
    `not a Git repository: ${repository}`
  )
  const remoteResult = await executor(['-C', root, 'config', '--get', 'remote.origin.url'], cwd)
  return {
    root,
    name: basename(root),
    remote: remoteResult.exitCode === 0 ? remoteResult.stdout.trim() || null : null
  }
}

export const collectHistory = async (
  options: HistoryOptions,
  cwd: string,
  repository: RepositoryIdentity,
  executor: GitExecutor = executeGit
): Promise<CollectedHistory> => {
  const root = repository.root
  const refResult = await executor(['-C', root, 'rev-parse', '--verify', `${options.ref}^{commit}`], cwd)

  if (refResult.exitCode !== 0) {
    const headResult = await executor(['-C', root, 'rev-parse', '--verify', 'HEAD'], cwd)
    if (options.ref === 'HEAD' && headResult.exitCode !== 0) {
      return {
        repository,
        resolvedRef: null,
        commits: []
      }
    }
    throw gitProcessError(`invalid Git ref '${options.ref}': ${refResult.stderr.trim() || 'not found'}`)
  }

  const resolvedRef = refResult.stdout.trim()
  const args = ['-C', root, 'log', resolvedRef, '--format=%H%x1f%at%x1f%ct%x1f%an%x1f%ae%x1e', '--no-decorate']
  if (!options.includeMerges) args.push('--no-merges')
  if (options.author) args.push(`--author=${options.author}`)
  if (options.paths.length > 0) args.push('--', ...options.paths)

  const history = await requireGit(executor, args, cwd, 'could not read Git history', false)
  return {
    repository,
    resolvedRef,
    commits: parseCommits(history)
  }
}
