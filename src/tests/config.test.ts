import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, describe, expect, test } from 'vitest'

import { applyConfig, CONFIG_NAME, CONFIG_TEMPLATE, loadConfig, parseConfig, renderConfig } from '../config/config.js'
import { authorFileSlug } from '../core/contributors.js'
import { executeGit, type GitExecutor } from '../git/adapter.js'
import { ensureReportIgnored } from '../repository/ignore.js'
import type { HistoryRequest } from '../types.js'

const roots: string[] = []

const repository = (): string => {
  const root = mkdtempSync(join(tmpdir(), 'git-almanac-config-edge-'))
  roots.push(root)
  execFileSync('git', ['init', '-b', 'main'], { cwd: root })
  return root
}

const request = (): HistoryRequest => ({
  supplied: new Set(),
  options: {
    repository: '.',
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

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

describe('repository configuration edge contract', () => {
  test('parses every supported value, comments, escapes, and arrays', () => {
    const config = parseConfig(`schema = 1
author = "A\\"#B" # trailing comment
paths = ["src", "space path"]
ref = "main"
since = "2026-08-25"
until = "2026-08-26"
date = "committer"
include_merges = true
metric = "commits"
theme = "dark"
`)
    expect(config).toMatchObject({
      author: 'A"#B',
      paths: ['src', 'space path'],
      ref: 'main',
      since: '2026-08-25',
      until: '2026-08-26',
      date: 'committer',
      includeMerges: true,
      metric: 'commits',
      theme: 'dark'
    })
    expect(parseConfig(CONFIG_TEMPLATE)).toMatchObject({ schema: 1, paths: [] })
    expect(authorFileSlug('😀')).toMatch(/^author-[a-f0-9]{8}$/)
  })

  test.each([
    ['schema = 1\n[calendar]\n', 'tables are not supported'],
    ['schema = 1\nnot an assignment\n', 'expected key = value'],
    ['schema = 1\nschema = 1\n', 'duplicate key'],
    ['schema = 1\nunknown = true\n', 'unknown key'],
    ['schema = 2\n', 'schema must be 1'],
    ['schema = 1\nauthor = 1\n', 'double-quoted string'],
    ['schema = 1\npaths = {}\n', 'array of double-quoted strings'],
    ['schema = 1\npaths = [1]\n', 'array of double-quoted strings'],
    ['schema = 1\ninclude_merges = maybe\n', 'true or false'],
    ['schema = 1\ndate = "tree"\n', 'date must be one of'],
    ['schema = 1\nmetric = "lines"\n', 'metric must be one of'],
    ['schema = 1\ntheme = "blue"\n', 'theme must be one of'],
    ['schema = 1\nsince = "2026-02-30"\n', 'real calendar date'],
    ['schema = 1\nsince = "2026-08-27"\nuntil = "2026-08-26"\n', 'after until']
  ])('rejects invalid configuration %#', (source, message) => {
    expect(() => parseConfig(source)).toThrow(message)
  })

  test('applies every repository default, honors CLI supply, and validates merged dates', () => {
    const base = request()
    base.supplied.add('theme')
    const options = applyConfig(base, {
      schema: 1,
      author: 'Alice',
      paths: ['src'],
      ref: 'main',
      since: '2026-08-25',
      until: '2026-08-26',
      date: 'committer',
      includeMerges: true,
      metric: 'commits',
      theme: 'dark'
    })
    expect(options).toMatchObject({
      author: 'Alice',
      paths: ['src'],
      ref: 'main',
      since: '2026-08-25',
      until: '2026-08-26',
      date: 'committer',
      includeMerges: true,
      metric: 'commits',
      theme: 'light'
    })
    expect(renderConfig(options)).toContain('author = "Alice"')

    const invalid = request()
    invalid.options.until = '2026-08-26'
    invalid.supplied.add('until')
    expect(() => applyConfig(invalid, { schema: 1, since: '2026-08-27' })).toThrow('after until')
    expect(applyConfig(request(), { schema: 1, theme: 'dark' })).toMatchObject({
      since: null,
      until: null,
      theme: 'dark'
    })
    expect(applyConfig(request(), null).ref).toBe('HEAD')
  })

  test('surfaces non-file configuration and Git ignore inspection failures', async () => {
    const root = repository()
    mkdirSync(join(root, CONFIG_NAME))
    await expect(loadConfig(root)).rejects.toThrow()

    const failingGit = (stderr: string): GitExecutor => {
      let invocation = 0
      return async () => {
        invocation += 1
        return invocation === 1 ? { stdout: '', stderr: '', exitCode: 1 } : { stdout: '', stderr, exitCode: 1 }
      }
    }
    await expect(ensureReportIgnored(root, root, failingGit('denied'))).rejects.toThrow('denied')
    await expect(ensureReportIgnored(root, root, failingGit(''))).rejects.toThrow('Git failed')
  })

  test('appends a safe ignore rule after an unterminated existing file', async () => {
    const root = repository()
    writeFileSync(join(root, '.gitignore'), 'node_modules')
    const result = await ensureReportIgnored(root, root, executeGit)
    expect(result).toEqual({ changed: true, rule: '/reports/' })
    expect(readFileSync(join(root, '.gitignore'), 'utf8')).toBe('node_modules\n/reports/\n')
  })

  test('propagates unexpected ignore filesystem failures', async () => {
    const ignoreDirectory = repository()
    mkdirSync(join(ignoreDirectory, '.gitignore'))
    await expect(ensureReportIgnored(ignoreDirectory, ignoreDirectory, executeGit)).rejects.toThrow()

    const reportsFile = repository()
    writeFileSync(join(reportsFile, 'reports'), 'not a directory')
    await expect(ensureReportIgnored(reportsFile, reportsFile, executeGit)).rejects.toThrow()
  })
})
