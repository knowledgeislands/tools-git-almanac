import { existsSync, realpathSync } from 'node:fs'
import { arch, platform } from 'node:os'
import { basename, dirname, join } from 'node:path'

export interface DiagnosticEnvironment {
  installation: 'local' | 'release' | 'unknown'
  platform: string
  architecture: string
  runtime: { name: string; version: string }
  executable: string | null
}

// Resolve the actual entrypoint, not cwd or the tool's version. An arbitrary
// copied executable has no reliable provenance and must remain unknown.
export const diagnosticEnvironment = (
  entrypoint: string = process.argv[1] ?? '',
  versions: { node: string; bun?: string } = process.versions,
  host: { platform: string; architecture: string } = { platform: platform(), architecture: arch() }
): DiagnosticEnvironment => {
  const result: DiagnosticEnvironment = {
    installation: 'unknown',
    platform:
      ({ darwin: 'macos', Darwin: 'macos', win32: 'windows', Windows: 'windows' } as Record<string, string>)[
        host.platform
      ] ?? host.platform,
    architecture:
      ({ x64: 'x86_64', AMD64: 'x86_64', amd64: 'x86_64', aarch64: 'arm64' } as Record<string, string>)[
        host.architecture
      ] ?? host.architecture,
    runtime: versions.bun ? { name: 'bun', version: versions.bun } : { name: 'node', version: versions.node },
    executable: null
  }
  try {
    result.executable = realpathSync(entrypoint)
  } catch {
    return result
  }
  const directory = dirname(result.executable)
  const checkout = basename(directory) === 'bin' ? dirname(directory) : dirname(dirname(directory))
  const source = join(checkout, 'bin', 'git-almanac')
  const compiled = join(checkout, 'dist', 'cli', 'cli.js')
  if (
    (result.executable === source || result.executable === compiled) &&
    existsSync(join(checkout, '.git')) &&
    existsSync(join(checkout, 'src', 'cli', 'run.ts'))
  ) {
    result.installation = 'local'
  } else if (
    basename(result.executable) === 'git-almanac' &&
    existsSync(join(directory, '..', 'INSTALL_RECEIPT.json'))
  ) {
    result.installation = 'release'
  }
  return result
}

export const renderDiagnosticContext = (
  environment: DiagnosticEnvironment,
  version: string,
  configuration: string
): string =>
  `Tool: git-almanac\nVersion: ${version}\nInstallation: ${environment.installation}\nPlatform: ${environment.platform}\nArchitecture: ${environment.architecture}\nRuntime: ${environment.runtime.name} ${environment.runtime.version}\nConfiguration: ${configuration}\n`
