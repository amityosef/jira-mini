import { useOptimistic } from 'react'
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'

import { assertNever } from '@/lib/assert'
import { issueKeys, issuesQuery } from '@/lib/queries'
import { compareIssues, isInScope, totalPoints, wipLimitFor } from '@/lib/workflow'

import { ISSUE_STATUSES } from '@/types'
import type { BoardColumn, BoardIssue, BoardScope, Issue, IssueStatus } from '@/types'

export type BoardAction =
  | { type: 'move'; issueId: string; status: IssueStatus }
  | { type: 'create'; draft: Issue }
  | { type: 'confirm-create'; draftId: string; issue: Issue }
  | { type: 'delete'; issueId: string }

export type BoardView =
  | { status: 'loading' }
  | { status: 'error'; error: Error; isRetrying: boolean }
  | { status: 'ready'; columns: BoardColumn[]; isRefreshing: boolean }

const NO_ISSUES: readonly Issue[] = []

export function reduceBoard(issues: BoardIssue[], action: BoardAction): BoardIssue[] {
  switch (action.type) {
    case 'move':
      return issues.map((issue) =>
        issue.id === action.issueId
          ? { ...issue, status: action.status, syncState: 'moving' }
          : issue,
      )
    case 'create':
      return [...issues, { ...action.draft, syncState: 'creating' }]
    case 'confirm-create': {
      const withoutDraft = issues.filter((issue) => issue.id !== action.draftId)
      return withoutDraft.some((issue) => issue.id === action.issue.id)
        ? withoutDraft
        : [...withoutDraft, { ...action.issue, syncState: 'creating' }]
    }
    case 'delete':
      return issues.filter((issue) => issue.id !== action.issueId)
    default:
      return assertNever(action)
  }
}

export function buildColumns(issues: readonly BoardIssue[], scope: BoardScope): BoardColumn[] {
  const scopedIssues = issues.filter((issue) => isInScope(issue, scope))
  return ISSUE_STATUSES.map((status) => {
    const columnIssues = scopedIssues
      .filter((issue) => issue.status === status)
      .toSorted(compareIssues)
    return {
      status,
      issues: columnIssues,
      totalPoints: totalPoints(columnIssues),
      wipLimit: wipLimitFor(status),
    }
  })
}

function describeBoard(
  query: UseQueryResult<Issue[]>,
  issues: readonly BoardIssue[],
  scope: BoardScope,
): BoardView {
  if (query.data !== undefined) {
    return { status: 'ready', columns: buildColumns(issues, scope), isRefreshing: query.isFetching }
  }
  if (query.status === 'error') {
    return { status: 'error', error: query.error, isRetrying: query.isFetching }
  }
  return { status: 'loading' }
}

export function useSprintBoard(scope: BoardScope) {
  const queryClient = useQueryClient()
  const query = useQuery(issuesQuery())
  const syncedIssues = (query.data ?? NO_ISSUES).map((issue): BoardIssue => ({
    ...issue,
    syncState: 'synced',
  }))
  const [issues, applyOptimistic] = useOptimistic(syncedIssues, reduceBoard)
  const issuesById: ReadonlyMap<string, BoardIssue> = new Map(
    issues.map((issue) => [issue.id, issue]),
  )

  function retry() {
    void queryClient.invalidateQueries({ queryKey: issueKeys.all })
  }

  return {
    view: describeBoard(query, issues, scope),
    issues,
    issuesById,
    applyOptimistic,
    retry,
  }
}
