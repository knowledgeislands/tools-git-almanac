export type DateMode = 'author' | 'committer'
export type OutputFormat = 'terminal' | 'html' | 'svg' | 'json'
export type Theme = 'light' | 'dark'

export interface GitCommit {
  oid: string
  authorEpoch: number
  committerEpoch: number
}

export interface RepositoryIdentity {
  root: string
  name: string
  remote: string | null
}

export interface ActivityFilters {
  author: string | null
  paths: string[]
  date: DateMode
  includeMerges: boolean
}

export interface CountingPolicy {
  reachability: 'reachable-from-selected-ref'
  authors: 'all' | 'filtered'
  merges: 'excluded' | 'included'
  dateField: DateMode
  timezoneGrouping: 'local-calendar-day'
  uniqueness: 'commit-oid'
  pathSemantics: 'git-pathspec'
}

export interface DayActivity {
  date: string
  count: number
  intensity: 0 | 1 | 2 | 3 | 4
}

export interface ActivitySummary {
  totalCommits: number
  activeDays: number
  busiestDay: {
    date: string
    count: number
  } | null
  currentStreak: number
  longestStreak: number
}

export interface ActivityInterval {
  since: string
  until: string
  gridSince: string
  gridUntil: string
  timezone: string
  days: number
  weeks: number
}

export interface ActivityModel {
  schemaVersion: 1
  generatedAt: string
  repository: RepositoryIdentity
  ref: {
    selected: string
    resolved: string | null
  }
  filters: ActivityFilters
  interval: ActivityInterval
  countingPolicy: CountingPolicy
  intensityThresholds: [number, number, number, number]
  daily: DayActivity[]
  summary: ActivitySummary
}

export interface YearOptions {
  repository: string
  author: string | null
  paths: string[]
  ref: string
  since: string | null
  until: string | null
  date: DateMode
  includeMerges: boolean
  format: OutputFormat
  output: string | null
  theme: Theme
  noColor: boolean
}
