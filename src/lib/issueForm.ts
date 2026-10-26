import { isApiError } from '@/lib/apiError'
import { assertNever } from '@/lib/assert'
import { parsePoints, parsePriority, parseStatus, parseType } from '@/lib/workflow'

import type { CreateIssueInput, IssueStatus } from '@/types'

export const TITLE_MIN_LENGTH = 3
export const TITLE_MAX_LENGTH = 120
export const DESCRIPTION_MAX_LENGTH = 2000
export const MAX_LABELS = 5
export const LABEL_MAX_LENGTH = 24

const LABEL_PATTERN = /^[a-z0-9][a-z0-9-]*$/

export const ISSUE_FORM_FIELDS = [
  'title',
  'description',
  'status',
  'priority',
  'type',
  'points',
  'labels',
] as const

export type IssueFormField = (typeof ISSUE_FORM_FIELDS)[number]

export type FieldErrors = Partial<Record<IssueFormField, string>>

export type IssueFormValues = {
  title: string
  description: string
  status: string
  priority: string
  type: string
  points: string
  assigneeId: string
  sprintId: string
  labels: string
}

export type IssueFormResult =
  | { ok: true; input: CreateIssueInput; values: IssueFormValues }
  | { ok: false; values: IssueFormValues; fieldErrors: FieldErrors }

export type QuickAddTitleResult =
  { ok: true; title: string } | { ok: false; title: string; error: string }

export type LabelsResult = { ok: true; labels: string[] } | { ok: false; error: string }

const FIELD_NAMES = {
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  type: 'type',
  points: 'estimate',
  labels: 'labels',
} as const satisfies Record<IssueFormField, string>

const fieldList = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })

function readText(formData: FormData, name: keyof IssueFormValues): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

export function readIssueFormValues(formData: FormData): IssueFormValues {
  return {
    title: readText(formData, 'title'),
    description: readText(formData, 'description'),
    status: readText(formData, 'status'),
    priority: readText(formData, 'priority'),
    type: readText(formData, 'type'),
    points: readText(formData, 'points'),
    assigneeId: readText(formData, 'assigneeId'),
    sprintId: readText(formData, 'sprintId'),
    labels: readText(formData, 'labels'),
  }
}

export function defaultIssueFormValues(defaults: {
  status: IssueStatus
  sprintId: string | null
}): IssueFormValues {
  return {
    title: '',
    description: '',
    status: defaults.status,
    priority: 'medium',
    type: 'feature',
    points: '3',
    assigneeId: '',
    sprintId: defaults.sprintId ?? '',
    labels: '',
  }
}

export function validateTitle(title: string): string | null {
  const { length } = title.trim()
  if (length === 0) return 'Enter a title.'
  if (length < TITLE_MIN_LENGTH) return `Use at least ${TITLE_MIN_LENGTH} characters.`
  if (length > TITLE_MAX_LENGTH) return `Use ${TITLE_MAX_LENGTH} characters or fewer.`
  return null
}

function validateDescription(description: string): string | null {
  return description.trim().length > DESCRIPTION_MAX_LENGTH
    ? `Use ${DESCRIPTION_MAX_LENGTH} characters or fewer.`
    : null
}

export function parseLabels(raw: string): LabelsResult {
  const labels = [
    ...new Set(
      raw
        .split(',')
        .map((label) => label.trim().toLowerCase())
        .filter((label) => label !== ''),
    ),
  ]
  if (labels.length > MAX_LABELS) return { ok: false, error: `Use at most ${MAX_LABELS} labels.` }
  const tooLong = labels.find((label) => label.length > LABEL_MAX_LENGTH)
  if (tooLong !== undefined) {
    return { ok: false, error: `“${tooLong}” is longer than ${LABEL_MAX_LENGTH} characters.` }
  }
  const malformed = labels.find((label) => !LABEL_PATTERN.test(label))
  if (malformed !== undefined) {
    return {
      ok: false,
      error: `“${malformed}” can only use lowercase letters, numbers and dashes.`,
    }
  }
  return { ok: true, labels }
}

function compactErrors(candidates: Record<IssueFormField, string | null>): FieldErrors {
  const errors: FieldErrors = {}
  for (const field of ISSUE_FORM_FIELDS) {
    const message = candidates[field]
    if (message !== null) errors[field] = message
  }
  return errors
}

export function parseIssueForm(formData: FormData): IssueFormResult {
  const values = readIssueFormValues(formData)
  const titleError = validateTitle(values.title)
  const descriptionError = validateDescription(values.description)
  const status = parseStatus(values.status)
  const priority = parsePriority(values.priority)
  const type = parseType(values.type)
  const points = parsePoints(values.points)
  const labels = parseLabels(values.labels)

  if (
    titleError !== null ||
    descriptionError !== null ||
    status === null ||
    priority === null ||
    type === null ||
    points === null ||
    !labels.ok
  ) {
    return {
      ok: false,
      values,
      fieldErrors: compactErrors({
        title: titleError,
        description: descriptionError,
        status: status === null ? 'Choose a status.' : null,
        priority: priority === null ? 'Choose a priority.' : null,
        type: type === null ? 'Choose an issue type.' : null,
        points: points === null ? 'Choose an estimate.' : null,
        labels: labels.ok ? null : labels.error,
      }),
    }
  }

  return {
    ok: true,
    values,
    input: {
      title: values.title.trim(),
      description: values.description.trim(),
      status,
      priority,
      type,
      points,
      assigneeId: values.assigneeId === '' ? null : values.assigneeId,
      sprintId: values.sprintId === '' ? null : values.sprintId,
      labels: labels.labels,
    },
  }
}

export function parseQuickAddTitle(formData: FormData): QuickAddTitleResult {
  const title = readText(formData, 'title')
  const error = validateTitle(title)
  return error === null ? { ok: true, title: title.trim() } : { ok: false, title, error }
}

export function fieldErrorFromFailure(error: unknown): FieldErrors | null {
  if (!isApiError(error)) return null
  const { failure } = error
  switch (failure.code) {
    case 'duplicate-title':
      return { title: failure.message }
    case 'network':
    case 'not-found':
    case 'wip-limit':
      return null
    default:
      return assertNever(failure)
  }
}

export function describeFieldErrors(fieldErrors: FieldErrors): string {
  const invalidFields = ISSUE_FORM_FIELDS.filter((field) => fieldErrors[field] !== undefined).map(
    (field) => FIELD_NAMES[field],
  )
  return invalidFields.length === 0
    ? ''
    : `Check the ${fieldList.format(invalidFields)}, then try again.`
}
