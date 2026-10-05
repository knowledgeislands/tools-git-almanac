import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'

import {
  assess,
  availableTranspilers,
  type Cruise,
  cruise,
  ownedModules,
  typeOnlyCrossings
} from '../../scripts/boundaries.ts'

const root = resolve(import.meta.dirname, '../..')
const temporary: string[] = []

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { force: true, recursive: true })
})

describe('enforced architecture boundaries', () => {
  test('uses a supported isolated compiler and a complete resolved graph', () => {
    expect(availableTranspilers()).toContainEqual(expect.objectContaining({ name: 'typescript', available: true }))
    const graph = cruise()
    expect(assess(graph)).toEqual([])
    expect(ownedModules(graph).length).toBeGreaterThanOrEqual(25)
    expect(typeOnlyCrossings(graph)).toBeGreaterThan(0)
    expect(graph.summary.violations).toEqual([])
    const entry = graph.modules.find((module) => module.source === 'src/cli/cli.ts')
    expect(entry?.dependencies).toContainEqual(
      expect.objectContaining({ resolved: 'src/cli/run.ts', couldNotResolve: false })
    )
    const tooling = JSON.parse(readFileSync(join(root, 'tooling/boundaries/package.json'), 'utf8')) as {
      dependencies: Record<string, string>
    }
    const product = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      devDependencies: Record<string, string>
    }
    expect(tooling.dependencies['dependency-cruiser']).toBe(product.devDependencies['dependency-cruiser'])
  })

  test('rejects an empty or type-blind graph instead of reporting success', () => {
    expect(assess({ modules: [], summary: { violations: [] } })).toHaveLength(2)
    const graph: Cruise = {
      modules: Array.from({ length: 25 }, (_, index) => ({ source: `src/core/${index}.ts`, dependencies: [] })),
      summary: { violations: [] }
    }
    expect(assess(graph)).toEqual(['The boundary checker lost cross-area type-only dependencies.'])
  })

  test('proves each semantic rule rejects a resolved deliberate crossing without touching product source', () => {
    const cases = [
      ['src/core/probe.ts', 'src/cli/run.ts', 'core-does-not-reach-io'],
      ['src/types.ts', 'src/core/activity.ts', 'types-are-the-contract-floor'],
      ['src/render/probe.ts', 'src/git/adapter.ts', 'renderers-do-not-perform-io'],
      ['src/cli/cli.ts', 'src/core/activity.ts', 'cli-entry-stays-thin'],
      ['src/tests/cli.test.ts', 'src/core/activity.ts', 'cli-acceptance-keeps-the-public-seam'],
      ['src/core/probe.ts', 'src/tests/probe.test.ts', 'fixtures-do-not-enter-the-product']
    ] as const

    // Use a private synthetic repository graph. The real checkout is read only
    // even for negative tests, and every imported target is an actual TS module.
    for (const [source, target, name] of cases) {
      const directory = mkdtempSync(join(tmpdir(), 'almanac-boundaries-'))
      temporary.push(directory)
      writeFileSync(join(directory, '.dependency-cruiser.ts'), readFileSync(join(root, '.dependency-cruiser.ts')))
      writeFileSync(
        join(directory, 'tsconfig.json'),
        '{"compilerOptions":{"module":"NodeNext","moduleResolution":"NodeNext"}}'
      )
      mkdirSync(join(directory, source, '..'), { recursive: true })
      mkdirSync(join(directory, target, '..'), { recursive: true })
      writeFileSync(join(directory, target), 'export const fixture = true\n')
      const relative = '../'.repeat(source.split('/').length - 1) + target.replace(/\.ts$/, '.js')
      writeFileSync(join(directory, source), `import '${relative}'\n`)
      const graph = cruise([source], directory)
      expect(
        graph.modules.flatMap((module) => module.dependencies).some((dependency) => dependency.couldNotResolve)
      ).toBe(false)
      expect(graph.modules.find((module) => module.source === source)?.dependencies).toContainEqual(
        expect.objectContaining({ resolved: target, couldNotResolve: false })
      )
      expect(graph.summary.violations.map((violation) => violation.rule.name)).toContain(name)
    }
  })
})
