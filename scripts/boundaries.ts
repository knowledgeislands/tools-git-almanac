import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

export type Dependency = Readonly<{ resolved: string; dependencyTypes?: readonly string[]; couldNotResolve?: boolean }>
export type Cruise = Readonly<{
  modules: readonly Readonly<{ source: string; dependencies: readonly Dependency[] }>[]
  summary: Readonly<{ violations: readonly Readonly<{ rule: Readonly<{ name: string }>; from: string; to: string }>[] }>
}>

const root = resolve(import.meta.dirname, '..')

// Resolve the checker from its own install root: the root TypeScript 7 compiler
// is outside dependency-cruiser's supported range and can produce an empty graph.
const checker = resolve(root, 'tooling/boundaries/node_modules/.bin/depcruise')

export const cruise = (roots: readonly string[] = ['src'], directory = root): Cruise => {
  // depcruise deliberately exits nonzero on rule violations; retain its JSON so
  // negative fixtures can assert the named rule rather than only the exit code.
  try {
    return JSON.parse(
      execFileSync(
        process.execPath,
        [checker, '--config', '.dependency-cruiser.ts', '--output-type', 'json', ...roots],
        {
          cwd: directory,
          encoding: 'utf8',
          maxBuffer: 8 * 1024 * 1024,
          stdio: ['ignore', 'pipe', 'pipe']
        }
      )
    ) as Cruise
  } catch (error) {
    const output = (error as { stdout?: string }).stdout
    if (!output) throw error
    return JSON.parse(output) as Cruise
  }
}

export const availableTranspilers = (): readonly Readonly<{ name: string; available: boolean }>[] =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        "import { getAvailableTranspilers } from 'dependency-cruiser'; console.log(JSON.stringify(getAvailableTranspilers()))"
      ],
      {
        cwd: resolve(root, 'tooling/boundaries'),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      }
    )
  ) as readonly Readonly<{ name: string; available: boolean }>[]

export const ownedModules = (graph: Cruise) => graph.modules.filter((module) => module.source.startsWith('src/'))

export const typeOnlyCrossings = (graph: Cruise) =>
  ownedModules(graph).flatMap((module) =>
    module.dependencies.filter(
      (dependency) => dependency.dependencyTypes?.includes('type-only') && dependency.resolved === 'src/types.ts'
    )
  ).length

export const assess = (graph: Cruise): readonly string[] => {
  const failures: string[] = []
  // Keep the floor close to the source/test count so a partial parse cannot pass.
  if (ownedModules(graph).length < 25) failures.push('The boundary checker did not read the complete source graph.')
  if (typeOnlyCrossings(graph) === 0) failures.push('The boundary checker lost cross-area type-only dependencies.')
  return failures
}
