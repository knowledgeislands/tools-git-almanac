import { dateRange, dayOfMonth, dayOfWeek, monthLabel } from '../core/dates.js'
import type { ActivityModel, DayActivity, Theme } from '../types.js'

export interface Palette {
  background: string
  panel: string
  text: string
  muted: string
  border: string
  levels: [string, string, string, string, string]
}

export const palettes: Record<Theme, Palette> = {
  light: {
    background: '#f6f8fa',
    panel: '#ffffff',
    text: '#1f2328',
    muted: '#59636e',
    border: '#d1d9e0',
    levels: ['#eff2f5', '#aceebb', '#4ac26b', '#2da44e', '#116329']
  },
  dark: {
    background: '#0d1117',
    panel: '#161b22',
    text: '#f0f6fc',
    muted: '#9198a1',
    border: '#30363d',
    levels: ['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353']
  }
}

export const escapeMarkup = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const commitLabel = (day: DayActivity, inRange = true): string => {
  const commits = `${day.count} ${day.count === 1 ? 'commit' : 'commits'}`
  return inRange ? `${day.date}: ${commits}` : `${day.date}: outside selected interval`
}

export interface GridDay {
  date: string
  count: number
  intensity: 0 | 1 | 2 | 3 | 4
  inRange: boolean
  week: number
  weekday: number
  monthStart: boolean
  month: string
}

export const gridDays = (model: ActivityModel): GridDay[] => {
  const byDate = new Map(model.daily.map((day) => [day.date, day]))
  return dateRange(model.interval.gridSince, model.interval.gridUntil).map((date, index) => {
    const day = byDate.get(date)
    return {
      date,
      count: day?.count ?? 0,
      intensity: day?.intensity ?? 0,
      inRange: Boolean(day),
      week: Math.floor(index / 7),
      weekday: dayOfWeek(date),
      monthStart: dayOfMonth(date) === 1,
      month: monthLabel(date)
    }
  })
}

export const busiestLabel = (model: ActivityModel): string =>
  model.summary.busiestDay ? `${model.summary.busiestDay.date} (${model.summary.busiestDay.count})` : 'No activity'
