const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const shortDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
const dateTime = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatShortDate(iso: string): string {
  return shortDate.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso))
}

export function formatDateRange(startIso: string, endIso: string): string {
  return shortDate.formatRange(new Date(startIso), new Date(endIso))
}

export function formatRelativeTime(iso: string, now: number): string {
  const elapsed = new Date(iso).getTime() - now
  const magnitude = Math.abs(elapsed)
  if (magnitude < MINUTE) return 'just now'
  if (magnitude < HOUR) return relative.format(Math.round(elapsed / MINUTE), 'minute')
  if (magnitude < DAY) return relative.format(Math.round(elapsed / HOUR), 'hour')
  return relative.format(Math.round(elapsed / DAY), 'day')
}

export function formatPoints(points: number): string {
  return points === 1 ? '1 point' : `${points} points`
}

export function formatCount(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`
}

export function formatPercent(part: number, whole: number): string {
  return whole === 0 ? '0%' : `${Math.round((part / whole) * 100)}%`
}
