export type DateMode = 'author' | 'committer'
export type Metric = 'commits'
export type OutputFormat = 'terminal' | 'html' | 'svg' | 'json'
export type Theme = 'light' | 'dark'
export type ReportSection = 'calendar' | 'authors' | 'contributors'

export interface GitAuthor {
  name: string
  email: string
  identity: string
}

export interface GitCommit {
  oid: string
  authorEpoch: number
  committerEpoch: number
  author: GitAuthor
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
  metric: Metric
}

export interface CountingPolicy {
  reachability: 'reachable-from-selected-ref'
  authors: 'all' | 'filtered'
  identity: 'exact-raw-name-email'
  metric: Metric
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
  busiestDay: { date: string; count: number } | null
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
  ref: { selected: string; resolved: string | null }
  filters: ActivityFilters
  interval: ActivityInterval
  countingPolicy: CountingPolicy
  intensityThresholds: [number, number, number, number]
  daily: DayActivity[]
  summary: ActivitySummary
}

export interface ContributorSummary extends GitAuthor {
  commits: number
  share: number
  fileSlug: string
}

export interface PeopleModel {
  schemaVersion: 1
  kind: 'authors' | 'contributors'
  generatedAt: string
  repository: RepositoryIdentity
  ref: ActivityModel['ref']
  filters: ActivityFilters
  interval: ActivityInterval
  countingPolicy: CountingPolicy
  totalCommits: number
  people: ContributorSummary[]
}

export interface HistoryOptions {
  repository: string
  author: string | null
  paths: string[]
  ref: string
  since: string | null
  until: string | null
  date: DateMode
  includeMerges: boolean
  metric: Metric
  format: OutputFormat
  formatExplicit: boolean
  output: string | null
  outputDir: string | null
  theme: Theme
  noColor: boolean
}

export type ConfigurableOption =
  | 'author'
  | 'paths'
  | 'ref'
  | 'since'
  | 'until'
  | 'date'
  | 'includeMerges'
  | 'metric'
  | 'theme'

export interface HistoryRequest {
  options: HistoryOptions
  supplied: Set<ConfigurableOption>
}

export interface AlmanacConfig {
  schema: 1
  author?: string
  paths?: string[]
  ref?: string
  since?: string
  until?: string
  date?: DateMode
  includeMerges?: boolean
  metric?: Metric
  theme?: Theme
}
