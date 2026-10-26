import { ApiError } from '@/lib/apiError'
import { STATUS_LABELS, totalPoints, wipLimitFor } from '@/lib/workflow'
import { loadDatabase, resetDatabase, saveDatabase } from '@/mocks/database'
import type { MockDatabase } from '@/mocks/seed'
import { simulateNetwork } from '@/mocks/simulation'

import type {
  ActivityEvent,
  CreateIssueInput,
  Issue,
  IssueStatus,
  SprintMetrics,
  WorkspaceSnapshot,
} from '@/types'

export type RequestOptions = { signal?: AbortSignal }

const DAY = 86_400_000

function issueNotFound(issueId: string): ApiError {
  return new ApiError({
    code: 'not-found',
    message: `Issue ${issueId} no longer exists. It may have been deleted.`,
    resource: 'issue',
    id: issueId,
  })
}

function requireIssue(database: MockDatabase, issueId: string): Issue {
  const issue = database.issues.find((candidate) => candidate.id === issueId)
  if (!issue) throw issueNotFound(issueId)
  return issue
}

function activityId(): string {
  return `act-${crypto.randomUUID()}`
}

function normalizeTitle(title: string): string {
  return title.trim().toLocaleLowerCase()
}

function pointsPerStatus(issues: Issue[]): Record<IssueStatus, number> {
  const pointsIn = (status: IssueStatus) =>
    totalPoints(issues.filter((issue) => issue.status === status))
  return {
    backlog: pointsIn('backlog'),
    todo: pointsIn('todo'),
    in_progress: pointsIn('in_progress'),
    in_review: pointsIn('in_review'),
    done: pointsIn('done'),
  }
}

export async function fetchWorkspace({ signal }: RequestOptions = {}): Promise<WorkspaceSnapshot> {
  await simulateNetwork(signal)
  const { workspace, members, sprints } = loadDatabase()
  return { workspace, members, sprints }
}

export async function fetchIssues({ signal }: RequestOptions = {}): Promise<Issue[]> {
  await simulateNetwork(signal)
  return loadDatabase().issues
}

export async function fetchIssueById(
  issueId: string,
  { signal }: RequestOptions = {},
): Promise<Issue> {
  await simulateNetwork(signal)
  return requireIssue(loadDatabase(), issueId)
}

export async function fetchIssueActivity(
  issueId: string,
  { signal }: RequestOptions = {},
): Promise<ActivityEvent[]> {
  await simulateNetwork(signal)
  const database = loadDatabase()
  requireIssue(database, issueId)
  return database.activity
    .filter((event) => event.issueId === issueId)
    .toSorted((first, second) => Date.parse(second.occurredAt) - Date.parse(first.occurredAt))
}

export async function updateIssueStatus(issueId: string, status: IssueStatus): Promise<Issue> {
  await simulateNetwork()
  const database = loadDatabase()
  const issue = requireIssue(database, issueId)
  if (issue.status === status) return issue

  const limit = wipLimitFor(status)
  const occupancy = database.issues.filter(
    (candidate) =>
      candidate.id !== issueId &&
      candidate.status === status &&
      candidate.sprintId === issue.sprintId,
  ).length
  if (limit !== null && issue.sprintId !== null && occupancy >= limit) {
    throw new ApiError({
      code: 'wip-limit',
      message: `${STATUS_LABELS[status]} is at its work-in-progress limit of ${limit}.`,
      status,
      limit,
    })
  }

  const occurredAt = new Date().toISOString()
  const updated: Issue = { ...issue, status, updatedAt: occurredAt }
  const event: ActivityEvent = {
    id: activityId(),
    issueId,
    actorId: database.workspace.currentUserId,
    occurredAt,
    kind: 'status_changed',
    from: issue.status,
    to: status,
  }
  saveDatabase({
    ...database,
    issues: database.issues.map((candidate) => (candidate.id === issueId ? updated : candidate)),
    activity: [...database.activity, event],
  })
  return updated
}

export async function createIssue(input: CreateIssueInput): Promise<Issue> {
  await simulateNetwork()
  const database = loadDatabase()
  const title = input.title.trim()
  const isDuplicate = database.issues.some(
    (issue) =>
      issue.sprintId === input.sprintId && normalizeTitle(issue.title) === normalizeTitle(title),
  )
  if (isDuplicate) {
    throw new ApiError({
      code: 'duplicate-title',
      message: 'An issue with this title already exists in the same sprint.',
      title,
    })
  }

  const createdAt = new Date().toISOString()
  const issue: Issue = {
    ...input,
    title,
    id: `${database.workspace.issuePrefix}-${database.nextIssueNumber}`,
    createdAt,
    updatedAt: createdAt,
  }
  const event: ActivityEvent = {
    id: activityId(),
    issueId: issue.id,
    actorId: database.workspace.currentUserId,
    occurredAt: createdAt,
    kind: 'created',
  }
  saveDatabase({
    ...database,
    issues: [...database.issues, issue],
    activity: [...database.activity, event],
    nextIssueNumber: database.nextIssueNumber + 1,
  })
  return issue
}

export async function deleteIssue(issueId: string): Promise<{ id: string }> {
  await simulateNetwork()
  const database = loadDatabase()
  requireIssue(database, issueId)
  saveDatabase({
    ...database,
    issues: database.issues.filter((issue) => issue.id !== issueId),
    activity: database.activity.filter((event) => event.issueId !== issueId),
  })
  return { id: issueId }
}

export async function fetchSprintMetrics(
  sprintId: string,
  { signal }: RequestOptions = {},
): Promise<SprintMetrics> {
  await simulateNetwork(signal)
  const database = loadDatabase()
  const sprint = database.sprints.find((candidate) => candidate.id === sprintId)
  if (!sprint) {
    throw new ApiError({
      code: 'not-found',
      message: `Sprint ${sprintId} does not exist.`,
      resource: 'sprint',
      id: sprintId,
    })
  }

  const issues = database.issues.filter((issue) => issue.sprintId === sprintId)
  const pointsByStatus = pointsPerStatus(issues)
  const start = Date.parse(sprint.startDate)
  const daysTotal = Math.max(1, Math.round((Date.parse(sprint.endDate) - start) / DAY))
  const daysElapsed = Math.min(daysTotal, Math.max(0, Math.floor((Date.now() - start) / DAY)))

  return {
    sprintId,
    totalPoints: totalPoints(issues),
    completedPoints: pointsByStatus.done,
    totalIssues: issues.length,
    completedIssues: issues.filter((issue) => issue.status === 'done').length,
    daysTotal,
    daysElapsed,
    daysRemaining: daysTotal - daysElapsed,
    pointsByStatus,
  }
}

export function resetDemoData(): Promise<void> {
  resetDatabase()
  return Promise.resolve()
}
