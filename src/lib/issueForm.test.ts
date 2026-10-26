import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/apiError'
import {
  defaultIssueFormValues,
  describeFieldErrors,
  DESCRIPTION_MAX_LENGTH,
  fieldErrorFromFailure,
  LABEL_MAX_LENGTH,
  MAX_LABELS,
  parseIssueForm,
  parseLabels,
  parseQuickAddTitle,
  TITLE_MAX_LENGTH,
  validateTitle,
} from '@/lib/issueForm'

function formDataFrom(entries: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [name, value] of Object.entries(entries)) formData.set(name, value)
  return formData
}

const validEntries = {
  title: '  Retry failed webhook deliveries  ',
  description: '  Ack first, then process.  ',
  status: 'in_progress',
  priority: 'high',
  type: 'bug',
  points: '5',
  assigneeId: 'usr-priya',
  sprintId: 'sprint-24',
  labels: 'Webhooks, payments , webhooks',
}

describe('parseIssueForm', () => {
  it('returns a trimmed, typed input and echoes the raw values', () => {
    expect(parseIssueForm(formDataFrom(validEntries))).toEqual({
      ok: true,
      values: validEntries,
      input: {
        title: 'Retry failed webhook deliveries',
        description: 'Ack first, then process.',
        status: 'in_progress',
        priority: 'high',
        type: 'bug',
        points: 5,
        assigneeId: 'usr-priya',
        sprintId: 'sprint-24',
        labels: ['webhooks', 'payments'],
      },
    })
  })

  it('maps an empty assignee and sprint to null and accepts zero points', () => {
    const result = parseIssueForm(
      formDataFrom({ ...validEntries, assigneeId: '', sprintId: '', points: '0', labels: '' }),
    )
    expect(result).toMatchObject({
      ok: true,
      input: { assigneeId: null, sprintId: null, points: 0, labels: [] },
    })
  })

  it('reports every invalid field and keeps the submitted values', () => {
    const entries = {
      ...validEntries,
      title: 'ab',
      description: 'x'.repeat(DESCRIPTION_MAX_LENGTH + 1),
      status: 'archived',
      priority: 'critical',
      type: 'epic',
      points: '4',
      labels: 'dark mode',
    }
    expect(parseIssueForm(formDataFrom(entries))).toEqual({
      ok: false,
      values: entries,
      fieldErrors: {
        title: 'Use at least 3 characters.',
        description: `Use ${DESCRIPTION_MAX_LENGTH} characters or fewer.`,
        status: 'Choose a status.',
        priority: 'Choose a priority.',
        type: 'Choose an issue type.',
        points: 'Choose an estimate.',
        labels: '“dark mode” can only use lowercase letters, numbers and dashes.',
      },
    })
  })

  it('treats missing fields and file entries as empty strings', () => {
    const formData = new FormData()
    formData.set('title', new File(['x'], 'title.txt'))
    expect(parseIssueForm(formData)).toMatchObject({
      ok: false,
      values: { title: '', labels: '', sprintId: '' },
      fieldErrors: { title: 'Enter a title.' },
    })
  })
})

describe('validateTitle', () => {
  it('requires between 3 and 120 trimmed characters', () => {
    expect(validateTitle('   ')).toBe('Enter a title.')
    expect(validateTitle(' ab ')).toBe('Use at least 3 characters.')
    expect(validateTitle('abc')).toBeNull()
    expect(validateTitle('a'.repeat(TITLE_MAX_LENGTH))).toBeNull()
    expect(validateTitle('a'.repeat(TITLE_MAX_LENGTH + 1))).toBe(
      `Use ${TITLE_MAX_LENGTH} characters or fewer.`,
    )
  })
})

describe('parseLabels', () => {
  it('trims, lower-cases, de-duplicates and drops empty entries', () => {
    expect(parseLabels(' Checkout,a11y,, CHECKOUT ,ux-review ')).toEqual({
      ok: true,
      labels: ['checkout', 'a11y', 'ux-review'],
    })
  })

  it('limits the number of labels', () => {
    const labels = Array.from({ length: MAX_LABELS + 1 }, (_, index) => `label-${index}`)
    expect(parseLabels(labels.join(','))).toEqual({
      ok: false,
      error: `Use at most ${MAX_LABELS} labels.`,
    })
  })

  it('limits the length of each label', () => {
    const longLabel = 'a'.repeat(LABEL_MAX_LENGTH + 1)
    expect(parseLabels(`ok, ${longLabel}`)).toEqual({
      ok: false,
      error: `“${longLabel}” is longer than ${LABEL_MAX_LENGTH} characters.`,
    })
  })

  it('rejects labels that do not start with a letter or number', () => {
    expect(parseLabels('-leading-dash')).toEqual({
      ok: false,
      error: '“-leading-dash” can only use lowercase letters, numbers and dashes.',
    })
  })
})

describe('parseQuickAddTitle', () => {
  it('returns the trimmed title when valid', () => {
    expect(parseQuickAddTitle(formDataFrom({ title: '  Write release notes  ' }))).toEqual({
      ok: true,
      title: 'Write release notes',
    })
  })

  it('keeps the raw title alongside the error when invalid', () => {
    expect(parseQuickAddTitle(formDataFrom({ title: ' ab' }))).toEqual({
      ok: false,
      title: ' ab',
      error: 'Use at least 3 characters.',
    })
  })
})

describe('fieldErrorFromFailure', () => {
  it('maps duplicate titles to a title error', () => {
    const error = new ApiError({
      code: 'duplicate-title',
      message: 'An issue with this title already exists in the same sprint.',
      title: 'Duplicate',
    })
    expect(fieldErrorFromFailure(error)).toEqual({
      title: 'An issue with this title already exists in the same sprint.',
    })
  })

  it('returns null for failures that are not about a field', () => {
    expect(
      fieldErrorFromFailure(
        new ApiError({ code: 'network', message: 'The server did not respond.' }),
      ),
    ).toBeNull()
    expect(fieldErrorFromFailure(new Error('Boom'))).toBeNull()
    expect(fieldErrorFromFailure('nope')).toBeNull()
  })
})

describe('describeFieldErrors', () => {
  it('lists the invalid fields in form order', () => {
    expect(describeFieldErrors({ labels: 'x', title: 'y', points: 'z' })).toBe(
      'Check the title, estimate, and labels, then try again.',
    )
    expect(describeFieldErrors({})).toBe('')
  })
})

describe('defaultIssueFormValues', () => {
  it('prefills the status and the current sprint', () => {
    expect(defaultIssueFormValues({ status: 'in_review', sprintId: null })).toEqual({
      title: '',
      description: '',
      status: 'in_review',
      priority: 'medium',
      type: 'feature',
      points: '3',
      assigneeId: '',
      sprintId: '',
      labels: '',
    })
  })
})
