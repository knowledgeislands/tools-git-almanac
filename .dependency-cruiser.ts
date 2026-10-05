const area = (...names: readonly string[]) => `^src/(${names.join('|')})(/|$)`
const product = '^src/'
const testFile = '\\.test\\.ts$'

const config: IConfiguration = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'Every module has one dependency direction; a cycle makes its owner unclear.',
      severity: 'error',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-unresolvable',
      comment: 'Unresolved imports escape every boundary rule and must never look like a clean graph.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true }
    },
    {
      name: 'core-does-not-reach-io',
      comment:
        'Counting, dates and identity logic remain usable without Git, configuration, rendering or report writes.',
      severity: 'error',
      from: { path: area('core') },
      to: { path: area('cli', 'git', 'config', 'render', 'report', 'repository') }
    },
    {
      name: 'types-are-the-contract-floor',
      comment: 'Shared data contracts do not depend on implementations that consume them.',
      severity: 'error',
      from: { path: '^src/types\\.ts$' },
      to: { path: product }
    },
    {
      name: 'renderers-do-not-perform-io',
      comment: 'Rendering transforms a model; repository discovery and filesystem ownership stay outside it.',
      severity: 'error',
      from: { path: area('render') },
      to: { path: area('cli', 'git', 'config', 'report', 'repository') }
    },
    {
      name: 'cli-entry-stays-thin',
      comment: 'The executable only passes arguments to the same run boundary exercised by acceptance tests.',
      severity: 'error',
      from: { path: '^src/cli/cli\\.ts$' },
      to: { path: product, pathNot: '^src/cli/run\\.ts$' }
    },
    {
      name: 'cli-acceptance-keeps-the-public-seam',
      comment: 'CLI acceptance tests use run; Git executor and diagnostic environment are documented fixture ports.',
      severity: 'error',
      from: { path: '^src/tests/(cli|report-transaction)\\.test\\.ts$' },
      to: { path: product, pathNot: '^src/(cli/(run|diagnostics)|git/adapter|types)\\.ts$' }
    },
    {
      name: 'fixtures-do-not-enter-the-product',
      comment: 'A released product must never depend on the fixtures that test it.',
      severity: 'error',
      from: { path: product, pathNot: testFile },
      to: { path: area('tests') }
    }
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'types', 'default'],
      extensions: ['.ts', '.js', '.mjs', '.cjs', '.d.ts', '.json']
    }
  }
}

export default config

import type { IConfiguration } from 'dependency-cruiser'
