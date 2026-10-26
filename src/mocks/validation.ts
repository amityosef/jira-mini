import { parsePoints, parsePriority, parseStatus, parseType } from '@/lib/workflow'
import type { MockDatabase } from '@/mocks/seed'

import { AVATAR_TONES, SPRINT_STATES } from '@/types'
import type { ActivityEvent, Issue, Sprint, TeamMember, Workspace } from '@/types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value)
}

function isIsoDate(value: unknown): value is string {
  return isString(value) && !Number.isNaN(Date.parse(value))
}

function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard)
}

function isOneOf<const T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return values.some((candidate) => candidate === value)
}

export function isIssue(value: unknown): value is Issue {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.description) &&
    parseStatus(value.status) !== null &&
    parsePriority(value.priority) !== null &&
    parseType(value.type) !== null &&
    parsePoints(value.points) !== null &&
    isNullableString(value.assigneeId) &&
    isNullableString(value.sprintId) &&
    isArrayOf(value.labels, isString) &&
    isIsoDate(value.createdAt) &&
    isIsoDate(value.updatedAt)
  )
}

function isSprint(value: unknown): value is Sprint {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.goal) &&
    isIsoDate(value.startDate) &&
    isIsoDate(value.endDate) &&
    isOneOf(SPRINT_STATES, value.state)
  )
}

function isTeamMember(value: unknown): value is TeamMember {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.initials) &&
    isString(value.role) &&
    isOneOf(AVATAR_TONES, value.avatarTone)
  )
}

function isWorkspace(value: unknown): value is Workspace {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.teamName) &&
    isString(value.issuePrefix) &&
    isString(value.currentUserId)
  )
}

function isActivityEvent(value: unknown): value is ActivityEvent {
  if (!isRecord(value)) return false
  const hasEnvelope =
    isString(value.id) &&
    isString(value.issueId) &&
    isString(value.actorId) &&
    isIsoDate(value.occurredAt)
  if (!hasEnvelope) return false
  switch (value.kind) {
    case 'created':
      return true
    case 'status_changed':
      return parseStatus(value.from) !== null && parseStatus(value.to) !== null
    case 'commented':
      return isString(value.body)
    case 'assigned':
      return isNullableString(value.assigneeId)
    default:
      return false
  }
}

export function isMockDatabase(value: unknown): value is MockDatabase {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isWorkspace(value.workspace) &&
    isArrayOf(value.members, isTeamMember) &&
    isArrayOf(value.sprints, isSprint) &&
    isArrayOf(value.issues, isIssue) &&
    isArrayOf(value.activity, isActivityEvent) &&
    typeof value.nextIssueNumber === 'number' &&
    Number.isInteger(value.nextIssueNumber)
  )
}
