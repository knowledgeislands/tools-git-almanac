import type {
  ActivityInterval,
  ActivityModel,
  ActivitySummary,
  CountingPolicy,
  DayActivity,
  GitCommit,
  HistoryOptions,
  RepositoryIdentity
} from '../types.js'
import { addDays, dateKeyForEpoch, dateRange, daysBetweenInclusive, gridBounds, todayDateKey } from './dates.js'

export const COUNTING_RULES =
  'Commits reachable from the selected ref are counted once by object ID; exact raw Name <email> identities are preserved; all authors are included unless filtered; merges are excluded by default; commits are grouped by the selected Git date in the local timezone.'

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
  options: HistoryOptions
  now: Date
  timezone: string
}

export const activityInterval = (options: HistoryOptions, now: Date, timezone: string): ActivityInterval => {
  const until = options.until ?? todayDateKey(now, timezone)
  const since = options.since ?? addDays(until, -364)
  const grid = gridBounds(since, until)
  return {
    since,
    until,
    gridSince: grid.gridSince,
    gridUntil: grid.gridUntil,
    timezone,
    days: daysBetweenInclusive(since, until),
    weeks: grid.weeks
  }
}

export const selectedCommits = (
  commits: GitCommit[],
  options: HistoryOptions,
  interval: ActivityInterval
): GitCommit[] => {
  const unique = new Map<string, GitCommit>()
  for (const commit of commits) {
    const epoch = options.date === 'author' ? commit.authorEpoch : commit.committerEpoch
    const date = dateKeyForEpoch(epoch, interval.timezone)
    if (date >= interval.since && date <= interval.until) unique.set(commit.oid, commit)
  }
  return [...unique.values()]
}

export const countingPolicy = (options: HistoryOptions): CountingPolicy => ({
  reachability: 'reachable-from-selected-ref',
  authors: options.author ? 'filtered' : 'all',
  identity: 'exact-raw-name-email',
  metric: options.metric,
  merges: options.includeMerges ? 'included' : 'excluded',
  dateField: options.date,
  timezoneGrouping: 'local-calendar-day',
  uniqueness: 'commit-oid',
  pathSemantics: 'git-pathspec'
})

export const buildActivityModel = (input: ModelInput): ActivityModel => {
  const interval = activityInterval(input.options, input.now, input.timezone)
  const dates = dateRange(interval.since, interval.until)
  const counts = new Map(dates.map((date) => [date, 0]))

  for (const commit of selectedCommits(input.commits, input.options, interval)) {
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
      includeMerges: input.options.includeMerges,
      metric: input.options.metric
    },
    interval,
    countingPolicy: countingPolicy(input.options),
    intensityThresholds: thresholds,
    daily,
    summary: summarize(daily)
  }
}
