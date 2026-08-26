import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { buildActivityModel } from '../core/activity.js'
import { collectHistory, executeGit, type GitExecutor } from '../git/adapter.js'
import { renderHtml } from '../render/html.js'
import { renderJson } from '../render/json.js'
import { renderSvg } from '../render/svg.js'
import { renderTerminal } from '../render/terminal.js'
import type { ActivityModel, OutputFormat, Theme } from '../types.js'
import { VERSION } from '../version.js'
import { HELP, renderCompletion } from './help.js'
import { isUsageError, parseArgs } from './parse.js'

export interface RunContext {
  cwd: string
  now: () => Date
  timezone: string
  isTTY: boolean
  noColorEnvironment: boolean
  stdout: (value: string) => void
  stderr: (value: string) => void
  writeOutput: (path: string, value: string) => Promise<void>
  git: GitExecutor
}

export const defaultContext = (): RunContext => ({
  cwd: process.cwd(),
  now: () => new Date(),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  isTTY: Boolean(process.stdout.isTTY),
  noColorEnvironment: Object.hasOwn(process.env, 'NO_COLOR'),
  stdout: (value) => process.stdout.write(value),
  stderr: (value) => process.stderr.write(value),
  writeOutput: async (path, value) => writeFile(path, value, 'utf8'),
  git: executeGit
})

const render = (model: ActivityModel, format: OutputFormat, theme: Theme, color: boolean): string => {
  if (format === 'terminal') return renderTerminal(model, theme, color)
  if (format === 'html') return renderHtml(model, theme)
  if (format === 'svg') return renderSvg(model, theme)
  return renderJson(model)
}

export const run = async (args: string[], context: RunContext = defaultContext()): Promise<number> => {
  try {
    const parsed = parseArgs(args, context.cwd)
    if (parsed.command === 'help') {
      context.stdout(HELP)
      return 0
    }
    if (parsed.command === 'version') {
      context.stdout(`gitlendar ${VERSION}\n`)
      return 0
    }
    if (parsed.command === 'completion') {
      context.stdout(renderCompletion(parsed.shell))
      return 0
    }

    const history = await collectHistory(parsed.options, context.cwd, context.git)
    const model = buildActivityModel({
      commits: history.commits,
      repository: history.repository,
      resolvedRef: history.resolvedRef,
      options: parsed.options,
      now: context.now(),
      timezone: context.timezone
    })
    const color = !parsed.options.noColor && !context.noColorEnvironment && context.isTTY
    const output = render(model, parsed.options.format, parsed.options.theme, color)

    if (parsed.options.output) {
      await context.writeOutput(resolve(context.cwd, parsed.options.output), output)
    } else {
      context.stdout(output)
    }
    return 0
  } catch (error) {
    if (isUsageError(error)) {
      context.stderr(`gitlendar: error: ${error.message}\n\n${HELP}`)
      return 2
    }
    const message = error instanceof Error ? error.message : String(error)
    context.stderr(`gitlendar: error: ${message}\n`)
    return 1
  }
}
