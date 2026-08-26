import { COUNTING_RULES } from '../core/activity.js'
import type { ActivityModel, Theme } from '../types.js'
import { busiestLabel, commitLabel, escapeMarkup, gridDays, palettes } from './shared.js'

const CELL = 11
const GAP = 3
const STEP = CELL + GAP
const LEFT = 48
const TOP = 48
const SUMMARY_HEIGHT = 92

export const renderSvg = (model: ActivityModel, theme: Theme): string => {
  const palette = palettes[theme]
  const days = gridDays(model)
  const width = LEFT + model.interval.weeks * STEP + 24
  const height = TOP + 7 * STEP + SUMMARY_HEIGHT
  const monthLabels = days
    .filter((day) => day.monthStart)
    .map((day) => `<text class="month" x="${LEFT + day.week * STEP}" y="30">${escapeMarkup(day.month)}</text>`)
    .join('')
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    .map(
      (label, index) => `<text class="weekday" x="40" y="${TOP + index * STEP + 9}" text-anchor="end">${label}</text>`
    )
    .join('')
  const cells = days
    .map((day) => {
      const label = commitLabel({ date: day.date, count: day.count, intensity: day.intensity }, day.inRange)
      const opacity = day.inRange ? '1' : '0.35'
      return `<g class="day" tabindex="0" role="img" aria-label="${escapeMarkup(label)}" data-date="${day.date}" data-count="${day.count}"><title>${escapeMarkup(label)}</title><rect x="${LEFT + day.week * STEP}" y="${TOP + day.weekday * STEP}" width="${CELL}" height="${CELL}" rx="2.5" fill="${palette.levels[day.intensity]}" opacity="${opacity}"/></g>`
    })
    .join('')
  const summaryY = TOP + 7 * STEP + 28

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="gitlendar-title gitlendar-desc">
  <title id="gitlendar-title">${escapeMarkup(model.repository.name)} activity calendar</title>
  <desc id="gitlendar-desc">${escapeMarkup(`${model.summary.totalCommits} commits across ${model.summary.activeDays} active days. ${COUNTING_RULES}`)}</desc>
  <style>
    svg { background: ${palette.panel}; color: ${palette.text}; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    text { fill: ${palette.text}; }
    .month { font-size: 11px; font-weight: 600; }
    .weekday { fill: ${palette.muted}; font-size: 9px; }
    .summary { font-size: 12px; font-weight: 600; }
    .policy { fill: ${palette.muted}; font-size: 9px; }
    .day:focus rect { stroke: ${palette.text}; stroke-width: 2px; outline: none; }
  </style>
  <rect width="${width}" height="${height}" rx="10" fill="${palette.panel}" stroke="${palette.border}"/>
  ${monthLabels}
  ${weekdays}
  ${cells}
  <text class="summary" x="${LEFT}" y="${summaryY}">${model.summary.totalCommits} commits · ${model.summary.activeDays} active days · busiest ${escapeMarkup(busiestLabel(model))}</text>
  <text class="summary" x="${LEFT}" y="${summaryY + 20}">Current streak ${model.summary.currentStreak} days · longest ${model.summary.longestStreak} days</text>
  <text class="policy" x="${LEFT}" y="${summaryY + 42}">${escapeMarkup(COUNTING_RULES)}</text>
</svg>
`
}
