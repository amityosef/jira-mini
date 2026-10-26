import { startTransition, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/context/toast'
import type { BoardAction } from '@/hooks/useSprintBoard'
import { describeError, isRetryableError } from '@/lib/apiError'
import {
  invalidateIssueDependents,
  removeIssueFromCache,
  writeIssueToCache,
} from '@/lib/issueCache'
import { STATUS_LABELS } from '@/lib/workflow'
import { createIssue, deleteIssue as deleteIssueRequest, updateIssueStatus } from '@/mocks/mockApi'

import type { BoardIssue, CreateIssueInput, Issue, IssueStatus } from '@/types'

export type MoveOutcome =
  { status: 'moved'; issue: Issue } | { status: 'skipped' } | { status: 'failed'; message: string }

export type CreateOutcome =
  { status: 'created'; issue: Issue } | { status: 'failed'; error: unknown }

export type DeleteOutcome = { status: 'deleted' } | { status: 'failed'; message: string }

export type MoveOptions = { restoreFocus?: boolean }

export type IssueActions = {
  moveIssue: (issueId: string, status: IssueStatus, options?: MoveOptions) => void
  changeStatus: (
    issueId: string,
    status: IssueStatus,
    options?: MoveOptions,
  ) => Promise<MoveOutcome>
  createIssueOptimistically: (input: CreateIssueInput) => Promise<CreateOutcome>
  submitNewIssue: (input: CreateIssueInput) => Promise<CreateOutcome>
  deleteIssue: (issueId: string) => Promise<DeleteOutcome>
  claimFocus: (issueId: string) => boolean
}

type IssueActionsSource = {
  issuesById: ReadonlyMap<string, BoardIssue>
  applyOptimistic: (action: BoardAction) => void
}

function createDraft(input: CreateIssueInput): Issue {
  const now = new Date().toISOString()
  return { ...input, id: `draft-${crypto.randomUUID()}`, createdAt: now, updatedAt: now }
}

export function useIssueActions({ issuesById, applyOptimistic }: IssueActionsSource): IssueActions {
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const pendingFocusRef = useRef<string | null>(null)

  function retryAction(error: unknown, retry: () => void) {
    return isRetryableError(error) ? { label: 'Retry', onAction: retry } : undefined
  }

  async function changeStatus(
    issueId: string,
    status: IssueStatus,
    { restoreFocus = false }: MoveOptions = {},
  ): Promise<MoveOutcome> {
    const issue = issuesById.get(issueId)
    if (!issue || issue.status === status || issue.syncState === 'creating') {
      return { status: 'skipped' }
    }
    if (restoreFocus) pendingFocusRef.current = issueId
    applyOptimistic({ type: 'move', issueId, status })
    try {
      const updated = await updateIssueStatus(issueId, status)
      writeIssueToCache(queryClient, updated)
      invalidateIssueDependents(queryClient, issueId)
      notify({ tone: 'success', message: `${issueId} moved to ${STATUS_LABELS[status]}.` })
      return { status: 'moved', issue: updated }
    } catch (error) {
      if (restoreFocus) pendingFocusRef.current = issueId
      const message = `Couldn’t move ${issueId} to ${STATUS_LABELS[status]}. ${describeError(error)} It’s back in ${STATUS_LABELS[issue.status]}.`
      notify({
        tone: 'error',
        message,
        action: retryAction(error, () => {
          moveIssue(issueId, status)
        }),
      })
      return { status: 'failed', message }
    }
  }

  function moveIssue(issueId: string, status: IssueStatus, options: MoveOptions = {}) {
    startTransition(async () => {
      await changeStatus(issueId, status, options)
    })
  }

  async function createIssueOptimistically(input: CreateIssueInput): Promise<CreateOutcome> {
    const draft = createDraft(input)
    applyOptimistic({ type: 'create', draft })
    try {
      const issue = await createIssue(input)
      startTransition(() => {
        applyOptimistic({ type: 'confirm-create', draftId: draft.id, issue })
      })
      writeIssueToCache(queryClient, issue)
      invalidateIssueDependents(queryClient, issue.id)
      notify({ tone: 'success', message: `${issue.id} added to ${STATUS_LABELS[issue.status]}.` })
      return { status: 'created', issue }
    } catch (error) {
      return { status: 'failed', error }
    }
  }

  async function submitNewIssue(input: CreateIssueInput): Promise<CreateOutcome> {
    try {
      const issue = await createIssue(input)
      writeIssueToCache(queryClient, issue)
      invalidateIssueDependents(queryClient, issue.id)
      notify({ tone: 'success', message: `${issue.id} created: ${issue.title}` })
      return { status: 'created', issue }
    } catch (error) {
      return { status: 'failed', error }
    }
  }

  async function deleteIssue(issueId: string): Promise<DeleteOutcome> {
    applyOptimistic({ type: 'delete', issueId })
    try {
      await deleteIssueRequest(issueId)
      removeIssueFromCache(queryClient, issueId)
      invalidateIssueDependents(queryClient, issueId)
      notify({ tone: 'success', message: `${issueId} deleted.` })
      return { status: 'deleted' }
    } catch (error) {
      const message = `Couldn’t delete ${issueId}. ${describeError(error)} It has been restored.`
      notify({
        tone: 'error',
        message,
        action: retryAction(error, () => {
          startTransition(async () => {
            await deleteIssue(issueId)
          })
        }),
      })
      return { status: 'failed', message }
    }
  }

  function claimFocus(issueId: string): boolean {
    if (pendingFocusRef.current !== issueId) return false
    pendingFocusRef.current = null
    return true
  }

  return {
    moveIssue,
    changeStatus,
    createIssueOptimistically,
    submitNewIssue,
    deleteIssue,
    claimFocus,
  }
}
