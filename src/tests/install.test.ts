import { execFileSync } from 'node:child_process'
import { lstatSync, mkdtempSync, readlinkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, test } from 'vitest'

const roots: string[] = []
const repositoryRoot = resolve(import.meta.dirname, '../..')

const temporaryRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), 'git-almanac-install-'))
  roots.push(root)
  return root
}

afterAll(() => {
  for (const root of roots) rmSync(root, { force: true, recursive: true })
})

describe('development installer contract', () => {
  test('documents release and link modes', () => {
    const output = execFileSync('bash', ['install.sh', '--help'], {
      cwd: repositoryRoot,
      encoding: 'utf8'
    })

    expect(output).toContain('./install.sh [vX.Y.Z]')
    expect(output).toContain('./install.sh --link')
    expect(output).toContain('GIT_ALMANAC_INSTALL_DIR')
  })

  test('links the development executable and manual into isolated directories', () => {
    const root = temporaryRoot()
    const executableDirectory = join(root, 'bin')
    const manualDirectory = join(root, 'share', 'man', 'man1')

    execFileSync('bash', ['install.sh', '--link'], {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        GIT_ALMANAC_INSTALL_DIR: executableDirectory,
        GIT_ALMANAC_MAN_INSTALL_DIR: manualDirectory
      }
    })

    const executable = join(executableDirectory, 'git-almanac')
    const manual = join(manualDirectory, 'git-almanac.1')
    expect(lstatSync(executable).isSymbolicLink()).toBe(true)
    expect(lstatSync(manual).isSymbolicLink()).toBe(true)
    expect(resolve(executableDirectory, readlinkSync(executable))).toBe(join(repositoryRoot, 'bin', 'git-almanac'))
    expect(resolve(manualDirectory, readlinkSync(manual))).toBe(join(repositoryRoot, 'man', 'git-almanac.1'))

    expect(execFileSync(executable, ['--version'], { encoding: 'utf8' }).trim()).toBe('git-almanac 0.1.0')
  })
})
