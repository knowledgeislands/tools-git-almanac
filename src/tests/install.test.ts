import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  writeFileSync
} from 'node:fs'
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

    expect(execFileSync(executable, ['--version'], { encoding: 'utf8' }).trim()).toBe('git-almanac 0.2.0')
  })

  test('refuses to replace regular files in link mode', () => {
    const root = temporaryRoot()
    mkdirSync(join(root, 'bin'))
    const executable = join(root, 'bin/git-almanac')
    writeFileSync(executable, 'keep this installation\n')
    const result = spawnSync('bash', ['install.sh', '--link'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_ALMANAC_INSTALL_DIR: join(root, 'bin'),
        GIT_ALMANAC_MAN_INSTALL_DIR: join(root, 'man')
      }
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('refusing to replace regular file')
    expect(readFileSync(executable, 'utf8')).toBe('keep this installation\n')
    expect(existsSync(join(root, 'man/git-almanac.1'))).toBe(false)
  })
})

const releaseFixture = () => {
  const root = temporaryRoot()
  const tag = 'v0.2.0'
  const assets = join(root, 'assets')
  const payload = join(assets, `git-almanac-${tag}`)
  const commands = join(root, 'commands')
  mkdirSync(payload, { recursive: true })
  mkdirSync(commands)
  execFileSync('bun', ['build', '--target=node', '--outfile', join(payload, 'git-almanac'), 'src/cli/cli.ts'], {
    cwd: repositoryRoot,
    stdio: 'ignore'
  })
  chmodSync(join(payload, 'git-almanac'), 0o755)
  writeFileSync(join(payload, 'git-almanac.1'), readFileSync(join(repositoryRoot, 'man/git-almanac.1')))
  const archiveName = `git-almanac-${tag}.tar.gz`
  execFileSync('tar', ['-czf', join(assets, archiveName), '-C', assets, `git-almanac-${tag}`])
  const checksum = createHash('sha256')
    .update(readFileSync(join(assets, archiveName)))
    .digest('hex')
  writeFileSync(join(assets, 'SHA256SUMS'), `${checksum}  ${archiveName}\n`)
  writeFileSync(
    join(commands, 'curl'),
    `#!/usr/bin/env bash
set -euo pipefail
destination=''
url=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    --output) destination="$2"; shift 2 ;;
    https://*) url="$1"; shift ;;
    *) shift ;;
  esac
done
case "$url" in
  https://api.github.com/repos/knowledgeislands/tools-git-almanac/releases/latest)
    printf '{"tag_name":"v0.2.0"}\\n' ;;
  https://github.com/knowledgeislands/tools-git-almanac/releases/download/v0.2.0/*)
    [ -n "$destination" ]
    cp "$ALMANAC_TEST_ASSETS/$(basename "$url")" "$destination" ;;
  *) exit 22 ;;
esac
`
  )
  chmodSync(join(commands, 'curl'), 0o755)
  return {
    root,
    assets,
    env: {
      ...process.env,
      PATH: `${commands}:${process.env['PATH'] ?? ''}`,
      ALMANAC_TEST_ASSETS: assets,
      GIT_ALMANAC_VERSION: '',
      GIT_ALMANAC_INSTALL_DIR: join(root, 'installed/bin'),
      GIT_ALMANAC_MAN_INSTALL_DIR: join(root, 'installed/man/man1')
    }
  }
}

describe('verified release installer contract', () => {
  test('installs the actual Node candidate and manual idempotently from isolated release assets', () => {
    const fixture = releaseFixture()
    for (const args of [[], ['v0.2.0']]) {
      execFileSync('bash', ['install.sh', ...args], { cwd: repositoryRoot, env: fixture.env })
    }
    const executable = join(fixture.env.GIT_ALMANAC_INSTALL_DIR, 'git-almanac')
    const manual = join(fixture.env.GIT_ALMANAC_MAN_INSTALL_DIR, 'git-almanac.1')
    expect(execFileSync(executable, ['--version'], { encoding: 'utf8' }).trim()).toBe('git-almanac 0.2.0')
    expect(readFileSync(manual)).toEqual(readFileSync(join(repositoryRoot, 'man/git-almanac.1')))
    expect(readFileSync(executable, 'utf8')).toContain('#!/usr/bin/env node')
  })

  test('rejects a checksum mismatch before replacing an existing executable or manual', () => {
    const fixture = releaseFixture()
    mkdirSync(fixture.env.GIT_ALMANAC_INSTALL_DIR, { recursive: true })
    mkdirSync(fixture.env.GIT_ALMANAC_MAN_INSTALL_DIR, { recursive: true })
    const executable = join(fixture.env.GIT_ALMANAC_INSTALL_DIR, 'git-almanac')
    const manual = join(fixture.env.GIT_ALMANAC_MAN_INSTALL_DIR, 'git-almanac.1')
    writeFileSync(executable, 'original executable\n')
    writeFileSync(manual, 'original manual\n')
    writeFileSync(join(fixture.assets, 'SHA256SUMS'), `${'0'.repeat(64)}  git-almanac-v0.2.0.tar.gz\n`)
    const result = spawnSync('bash', ['install.sh', 'v0.2.0'], {
      cwd: repositoryRoot,
      env: fixture.env,
      encoding: 'utf8'
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('release checksum verification failed')
    expect(readFileSync(executable, 'utf8')).toBe('original executable\n')
    expect(readFileSync(manual, 'utf8')).toBe('original manual\n')
  })
})
