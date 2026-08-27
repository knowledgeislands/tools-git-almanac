import { createHash } from 'node:crypto'

import type {
  ActivityModel,
  ContributorSummary,
  GitCommit,
  HistoryOptions,
  PeopleModel,
  RepositoryIdentity
} from '../types.js'
import { activityInterval, buildActivityModel, countingPolicy, selectedCommits } from './activity.js'

export interface PeopleInput {
  commits: GitCommit[]
  repository: RepositoryIdentity
  resolvedRef: string | null
  options: HistoryOptions
  now: Date
  timezone: string
}

const compareText = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0)

export const authorFileSlug = (identity: string): string => {
  const readable = identity
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  const digest = createHash('sha256').update(identity).digest('hex').slice(0, 8)
  return `${readable || 'author'}-${digest}`
}

export const buildPeopleModel = (input: PeopleInput, kind: PeopleModel['kind']): PeopleModel => {
  const interval = activityInterval(input.options, input.now, input.timezone)
  const commits = selectedCommits(input.commits, input.options, interval)
  const counts = new Map<string, { name: string; email: string; commits: number }>()

  for (const commit of commits) {
    const current = counts.get(commit.author.identity)
    counts.set(commit.author.identity, {
      name: commit.author.name,
      email: commit.author.email,
      commits: (current?.commits ?? 0) + 1
    })
  }

  const people = [...counts.entries()].map<ContributorSummary>(([identity, summary]) => ({
    identity,
    name: summary.name,
    email: summary.email,
    commits: summary.commits,
    share: commits.length === 0 ? 0 : Number(((summary.commits / commits.length) * 100).toFixed(6)),
    fileSlug: authorFileSlug(identity)
  }))

  people.sort((left, right) => {
    if (kind === 'contributors' && left.commits !== right.commits) return right.commits - left.commits
    return compareText(left.identity, right.identity)
  })

  return {
    schemaVersion: 1,
    kind,
    generatedAt: input.now.toISOString(),
    repository: input.repository,
    ref: { selected: input.options.ref, resolved: input.resolvedRef },
    filters: {
      author: input.options.author,
      paths: [...input.options.paths],
      date: input.options.date,
      includeMerges: input.options.includeMerges,
      metric: input.options.metric
    },
    interval,
    countingPolicy: countingPolicy(input.options),
    totalCommits: commits.length,
    people
  }
}

export const buildAuthorCalendars = (input: PeopleInput, people: ContributorSummary[]): Map<string, ActivityModel> => {
  const calendars = new Map<string, ActivityModel>()
  for (const person of people) {
    calendars.set(
      person.identity,
      buildActivityModel({
        ...input,
        commits: input.commits.filter((commit) => commit.author.identity === person.identity),
        options: { ...input.options, author: person.identity }
      })
    )
  }
  return calendars
}
