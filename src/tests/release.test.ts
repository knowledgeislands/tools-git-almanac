import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const temporary: string[] = []

afterEach(() => {
  for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe('release candidate preflight', () => {
  const workflow = readFileSync(join(root, '.github/workflows/release.yml'), 'utf8')
  const step = workflow.split('      - name: Validate release tag\n')[1]?.split('\n      - ')[0]
  const script = step
    ?.split('        run: |\n')[1]
    ?.split('\n')
    .map((line) => line.slice(10))
    .join('\n')

  test('rejects version drift before dependency installation, tests and builds', () => {
    expect(script).toBeDefined()
    const position = workflow.indexOf('      - name: Validate release tag')
    expect(position).toBeGreaterThan(0)
    for (const later of ['bun install', 'bun run test:coverage', 'bun run build', 'Build release asset']) {
      expect(position).toBeLessThan(workflow.indexOf(later))
    }
    const directory = mkdtempSync(join(tmpdir(), 'almanac-release-'))
    temporary.push(directory)
    writeFileSync(join(directory, 'package.json'), '{"version":"0.2.0"}\n')
    for (const version of ['main', 'v0.1.0', 'v0.2', 'v0.2.0-rc.1', 'v00.2.0', 'v0.2.0; false']) {
      const outcome = spawnSync('bash', ['-c', script ?? 'exit 99'], {
        cwd: directory,
        env: { ...process.env, VERSION: version },
        encoding: 'utf8'
      })
      expect(outcome.status, version).not.toBe(0)
    }
    expect(
      spawnSync('bash', ['-c', script ?? 'exit 99'], {
        cwd: directory,
        env: { ...process.env, VERSION: 'v0.2.0' },
        encoding: 'utf8'
      }).status
    ).toBe(0)
  })
})
