import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { GitExecutor } from '../git/adapter.js'

export interface IgnoreResult {
  changed: boolean
  rule: '/reports/' | '/reports/git-almanac/' | 'existing'
}

const readOptional = async (path: string): Promise<string | null> => {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

const directoryEntries = async (path: string): Promise<string[]> => {
  try {
    return await readdir(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

export const reportIsIgnored = async (root: string, cwd: string, git: GitExecutor): Promise<boolean> => {
  const result = await git(
    ['-C', root, 'check-ignore', '--no-index', '--quiet', '--', 'reports/git-almanac/.git-almanac-probe'],
    cwd
  )
  return result.exitCode === 0
}

export const ensureReportIgnored = async (root: string, cwd: string, git: GitExecutor): Promise<IgnoreResult> => {
  if (await reportIsIgnored(root, cwd, git)) return { changed: false, rule: 'existing' }

  const tracked = await git(['-C', root, 'ls-files', '--', 'reports'], cwd)
  if (tracked.exitCode !== 0)
    throw new Error(`could not inspect tracked reports: ${tracked.stderr.trim() || 'Git failed'}`)
  const entries = await directoryEntries(join(root, 'reports'))
  const containsForeignReports = entries.some((entry) => entry !== 'git-almanac')
  const broadSafe = tracked.stdout.trim() === '' && !containsForeignReports
  const rule = broadSafe ? '/reports/' : '/reports/git-almanac/'
  const path = join(root, '.gitignore')
  const source = (await readOptional(path)) ?? ''
  const separator = source.length === 0 || source.endsWith('\n') ? '' : '\n'
  await writeFile(path, `${source}${separator}${rule}\n`, 'utf8')
  return { changed: true, rule }
}
