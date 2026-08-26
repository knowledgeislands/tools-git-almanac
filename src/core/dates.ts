const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

interface DateParts {
  year: string
  month: string
  day: string
}

const partsFor = (epochMilliseconds: number, timezone: string): DateParts => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(epochMilliseconds))

  return Object.fromEntries(parts.map((part) => [part.type, part.value])) as unknown as DateParts
}

export const dateKeyForEpoch = (epochSeconds: number, timezone: string): string => {
  const parts = partsFor(epochSeconds * 1000, timezone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export const todayDateKey = (now: Date, timezone: string): string => {
  const parts = partsFor(now.getTime(), timezone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export const parseDateKey = (value: string): Date => {
  const match = DATE_PATTERN.exec(value)
  if (!match) throw new Error(`malformed date '${value}'; expected YYYY-MM-DD`)

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(Date.UTC(year, month - 1, day))

  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new Error(`malformed date '${value}'; expected a real calendar date`)
  }

  return parsed
}

export const formatDateKey = (date: Date): string => {
  const year = date.getUTCFullYear().toString().padStart(4, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = date.getUTCDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDays = (value: string, days: number): string => {
  const date = parseDateKey(value)
  date.setUTCDate(date.getUTCDate() + days)
  return formatDateKey(date)
}

export const daysBetweenInclusive = (since: string, until: string): number => {
  const start = parseDateKey(since).getTime()
  const end = parseDateKey(until).getTime()
  return Math.floor((end - start) / 86_400_000) + 1
}

export const dateRange = (since: string, until: string): string[] => {
  const count = daysBetweenInclusive(since, until)
  if (count < 1) throw new Error(`since date ${since} is after until date ${until}`)
  return Array.from({ length: count }, (_, index) => addDays(since, index))
}

export const gridBounds = (since: string, until: string): { gridSince: string; gridUntil: string; weeks: number } => {
  const start = parseDateKey(since)
  const end = parseDateKey(until)
  const gridSince = addDays(since, -start.getUTCDay())
  const gridUntil = addDays(until, 6 - end.getUTCDay())
  return {
    gridSince,
    gridUntil,
    weeks: daysBetweenInclusive(gridSince, gridUntil) / 7
  }
}

export const dayOfWeek = (value: string): number => parseDateKey(value).getUTCDay()

export const dayOfMonth = (value: string): number => parseDateKey(value).getUTCDate()

export const monthLabel = (value: string): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
  return months[parseDateKey(value).getUTCMonth()] as string
}
