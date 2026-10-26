import {
  type BoardScope,
  type Issue,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  ISSUE_TYPES,
  type IssuePriority,
  type IssueStatus,
  type IssueType,
  type LayoutDirection,
  STORY_POINTS,
  type StoryPoints,
} from '@/types'

export const STATUS_LABELS = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
} as const satisfies Record<IssueStatus, string>

export const PRIORITY_LABELS = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No priority',
} as const satisfies Record<IssuePriority, string>

export const TYPE_LABELS = {
  feature: 'Feature',
  bug: 'Bug',
  chore: 'Chore',
} as const satisfies Record<IssueType, string>

export const WIP_LIMITS: Readonly<Partial<Record<IssueStatus, number>>> = {
  in_progress: 4,
  in_review: 3,
}

export const BACKLOG_SCOPE_PARAM = 'backlog'

const PRIORITY_RANK = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
} as const satisfies Record<IssuePriority, number>

export function wipLimitFor(status: IssueStatus): number | null {
  return WIP_LIMITS[status] ?? null
}

export function adjacentStatus(status: IssueStatus, step: -1 | 1): IssueStatus | null {
  return ISSUE_STATUSES[ISSUE_STATUSES.indexOf(status) + step] ?? null
}

export function visualStep(key: 'ArrowLeft' | 'ArrowRight', direction: LayoutDirection): -1 | 1 {
  const towardsEnd = key === 'ArrowRight' ? direction === 'ltr' : direction === 'rtl'
  return towardsEnd ? 1 : -1
}

export function issueNumber(issueId: string): number {
  const number = Number(issueId.slice(issueId.lastIndexOf('-') + 1))
  return Number.isFinite(number) ? number : Number.MAX_SAFE_INTEGER
}

export function compareIssues(first: Issue, second: Issue): number {
  return (
    PRIORITY_RANK[first.priority] - PRIORITY_RANK[second.priority] ||
    issueNumber(first.id) - issueNumber(second.id)
  )
}

export function totalPoints(issues: readonly Issue[]): number {
  return issues.reduce((sum, issue) => sum + issue.points, 0)
}

export function isInScope(issue: Issue, scope: BoardScope): boolean {
  return scope.kind === 'backlog' ? issue.sprintId === null : issue.sprintId === scope.sprintId
}

export function scopeToParam(scope: BoardScope): string {
  return scope.kind === 'backlog' ? BACKLOG_SCOPE_PARAM : scope.sprintId
}

export function parseStatus(value: unknown): IssueStatus | null {
  return ISSUE_STATUSES.find((status) => status === value) ?? null
}

export function parsePriority(value: unknown): IssuePriority | null {
  return ISSUE_PRIORITIES.find((priority) => priority === value) ?? null
}

export function parseType(value: unknown): IssueType | null {
  return ISSUE_TYPES.find((type) => type === value) ?? null
}

export function parsePoints(value: unknown): StoryPoints | null {
  const numeric = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  return STORY_POINTS.find((points) => points === numeric) ?? null
}
