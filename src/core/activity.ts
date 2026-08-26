import type {
  ActivityModel,
  ActivitySummary,
  DayActivity,
  GitCommit,
  RepositoryIdentity,
  YearOptions
} from '../types.js'
import { addDays, dateKeyForEpoch, dateRange, daysBetweenInclusive, gridBounds, todayDateKey } from './dates.js'

export const COUNTING_RULES =
  'Commits reachable from the selected ref are counted once by object ID; all authors are included unless filtered; merges are excluded by default; commits are grouped by the selected Git date in the local timezone.'

export const intensityThresholds = (maximum: number): [number, number, number, number] => {
  if (maximum === 0) return [0, 0, 0, 0]
  return [Math.ceil(maximum * 0.25), Math.ceil(maximum * 0.5), Math.ceil(maximum * 0.75), maximum]
}

export const intensityFor = (count: number, thresholds: [number, number, number, number]): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0
  if (count <= thresholds[0]) return 1
  if (count <= thresholds[1]) return 2
  if (count <= thresholds[2]) return 3
  return 4
}

const summarize = (daily: DayActivity[]): ActivitySummary => {
  let totalCommits = 0
  let activeDays = 0
  let busiestDay: ActivitySummary['busiestDay'] = null
  let longestStreak = 0
  let runningStreak = 0

  for (const day of daily) {
    totalCommits += day.count
    if (day.count > 0) {
      activeDays += 1
      runningStreak += 1
      longestStreak = Math.max(longestStreak, runningStreak)
      if (!busiestDay || day.count > busiestDay.count) busiestDay = { date: day.date, count: day.count }
    } else {
      runningStreak = 0
    }
  }

  let currentStreak = 0
  for (let index = daily.length - 1; index >= 0; index -= 1) {
    if (daily[index]?.count === 0) break
    currentStreak += 1
  }

  return { totalCommits, activeDays, busiestDay, currentStreak, longestStreak }
}

export interface ModelInput {
  commits: GitCommit[]
  repository: RepositoryIdentity
  resolvedRef: string | null
  options: YearOptions
  now: Date
  timezone: string
}

export const buildActivityModel = (input: ModelInput): ActivityModel => {
  const until = input.options.until ?? todayDateKey(input.now, input.timezone)
  const since = input.options.since ?? addDays(until, -364)
  const dates = dateRange(since, until)
  const counts = new Map(dates.map((date) => [date, 0]))

  for (const commit of input.commits) {
    const epoch = input.options.date === 'author' ? commit.authorEpoch : commit.committerEpoch
    const date = dateKeyForEpoch(epoch, input.timezone)
    if (counts.has(date)) counts.set(date, (counts.get(date) as number) + 1)
  }

  const maximum = Math.max(0, ...counts.values())
  const thresholds = intensityThresholds(maximum)
  const daily = dates.map<DayActivity>((date) => {
    const count = counts.get(date) as number
    return { date, count, intensity: intensityFor(count, thresholds) }
  })
  const grid = gridBounds(since, until)

  return {
    schemaVersion: 1,
    generatedAt: input.now.toISOString(),
    repository: input.repository,
    ref: {
      selected: input.options.ref,
      resolved: input.resolvedRef
    },
    filters: {
      author: input.options.author,
      paths: [...input.options.paths],
      date: input.options.date,
      includeMerges: input.options.includeMerges
    },
    interval: {
      since,
      until,
      gridSince: grid.gridSince,
      gridUntil: grid.gridUntil,
      timezone: input.timezone,
      days: daysBetweenInclusive(since, until),
      weeks: grid.weeks
    },
    countingPolicy: {
      reachability: 'reachable-from-selected-ref',
      authors: input.options.author ? 'filtered' : 'all',
      merges: input.options.includeMerges ? 'included' : 'excluded',
      dateField: input.options.date,
      timezoneGrouping: 'local-calendar-day',
      uniqueness: 'commit-oid',
      pathSemantics: 'git-pathspec'
    },
    intensityThresholds: thresholds,
    daily,
    summary: summarize(daily)
  }
}
