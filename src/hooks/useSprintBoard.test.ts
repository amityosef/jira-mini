import { describe, expect, test } from 'vitest'

import { buildColumns, reduceBoard } from '@/hooks/useSprintBoard'

import type { BoardIssue, Issue } from '@/types'

function issue(overrides: Partial<Issue> & Pick<Issue, 'id'>): BoardIssue {
  return {
    title: `Issue ${overrides.id}`,
    description: '',
    status: 'todo',
    priority: 'medium',
    type: 'feature',
    points: 1,
    assigneeId: null,
    sprintId: 'sprint-1',
    labels: [],
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    ...overrides,
    syncState: 'synced',
  }
}

describe('reduceBoard', () => {
  const base = [issue({ id: 'SF-1' }), issue({ id: 'SF-2', status: 'done' })]

  test('moves an issue and marks it as syncing', () => {
    const [moved] = reduceBoard(base, { type: 'move', issueId: 'SF-1', status: 'in_review' })

    expect(moved).toMatchObject({ id: 'SF-1', status: 'in_review', syncState: 'moving' })
  })

  test('adds an optimistic draft and reconciles it with the server record exactly once', () => {
    const draft = issue({ id: 'draft-1', title: 'New idea' })
    const created = issue({ id: 'SF-3', title: 'New idea' })
    const withDraft = reduceBoard(base, { type: 'create', draft })
    const confirmed = reduceBoard(withDraft, {
      type: 'confirm-create',
      draftId: 'draft-1',
      issue: created,
    })
    const alreadyCached = reduceBoard([...withDraft, created], {
      type: 'confirm-create',
      draftId: 'draft-1',
      issue: created,
    })

    expect(withDraft.at(-1)).toMatchObject({ id: 'draft-1', syncState: 'creating' })
    expect(confirmed.map((entry) => entry.id)).toEqual(['SF-1', 'SF-2', 'SF-3'])
    expect(alreadyCached.filter((entry) => entry.id === 'SF-3')).toHaveLength(1)
    expect(alreadyCached.some((entry) => entry.id === 'draft-1')).toBe(false)
  })

  test('removes a deleted issue', () => {
    expect(reduceBoard(base, { type: 'delete', issueId: 'SF-2' }).map((entry) => entry.id)).toEqual(
      ['SF-1'],
    )
  })
})

describe('buildColumns', () => {
  test('derives every column, sorted by priority then number, with point totals', () => {
    const columns = buildColumns(
      [
        issue({ id: 'SF-9', priority: 'low', points: 3 }),
        issue({ id: 'SF-4', priority: 'urgent', points: 5 }),
        issue({ id: 'SF-2', priority: 'low', points: 2 }),
        issue({ id: 'SF-7', status: 'in_progress' }),
        issue({ id: 'SF-8', sprintId: 'sprint-2' }),
      ],
      { kind: 'sprint', sprintId: 'sprint-1' },
    )
    const todo = columns.find((column) => column.status === 'todo')

    expect(columns.map((column) => column.status)).toEqual([
      'backlog',
      'todo',
      'in_progress',
      'in_review',
      'done',
    ])
    expect(todo?.issues.map((entry) => entry.id)).toEqual(['SF-4', 'SF-2', 'SF-9'])
    expect(todo?.totalPoints).toBe(10)
    expect(columns.find((column) => column.status === 'in_progress')?.wipLimit).toBe(4)
  })

  test('scopes the team backlog to unscheduled issues', () => {
    const columns = buildColumns([issue({ id: 'SF-1', sprintId: null }), issue({ id: 'SF-2' })], {
      kind: 'backlog',
    })

    expect(columns.flatMap((column) => column.issues).map((entry) => entry.id)).toEqual(['SF-1'])
  })
})
