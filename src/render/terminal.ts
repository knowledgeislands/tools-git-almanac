import { COUNTING_RULES } from '../core/activity.js'
import type { ActivityModel, Theme } from '../types.js'
import { busiestLabel, gridDays, palettes } from './shared.js'

const colorCell = (hex: string): string => {
  const value = hex.slice(1)
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return `\u001B[38;2;${red};${green};${blue}m■\u001B[0m `
}

const monthHeading = (model: ActivityModel): string => {
  const width = model.interval.weeks * 2
  const characters = Array.from({ length: width }, () => ' ')
  let lastStart = -10
  for (const day of gridDays(model)) {
    const start = day.week * 2
    if (!day.monthStart || start - lastStart < 5) continue
    for (const [offset, character] of [...day.month].entries()) characters[start + offset] = character
    lastStart = start
  }
  return characters.join('').trimEnd()
}

export const renderTerminal = (model: ActivityModel, theme: Theme, color: boolean): string => {
  const days = gridDays(model)
  const fallback = ['· ', '░ ', '▒ ', '▓ ', '█ '] as const
  const rows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, weekday) => {
    const cells = days
      .filter((day) => day.weekday === weekday)
      .map((day) => {
        if (!day.inRange) return '  '
        return color ? colorCell(palettes[theme].levels[day.intensity]) : fallback[day.intensity]
      })
      .join('')
    return `${label} ${cells}`
  })

  return [
    `${model.repository.name} · ${model.interval.since} to ${model.interval.until} · ${model.interval.timezone}`,
    `    ${monthHeading(model)}`,
    ...rows,
    color ? `Less ${palettes[theme].levels.map((value) => colorCell(value)).join('')}More` : 'Less · ░ ▒ ▓ █ More',
    '',
    `${model.summary.totalCommits} commits · ${model.summary.activeDays} active days · busiest ${busiestLabel(model)}`,
    `Current streak ${model.summary.currentStreak} days · longest ${model.summary.longestStreak} days`,
    `Counting: ${COUNTING_RULES}`,
    ''
  ].join('\n')
}
