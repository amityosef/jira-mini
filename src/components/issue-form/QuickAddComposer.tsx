import { useActionState, useId } from 'react'

import { useBoard } from '@/context/board'
import { describeError } from '@/lib/apiError'
import { assertNever } from '@/lib/assert'
import { fieldErrorFromFailure, parseQuickAddTitle } from '@/lib/issueForm'
import { STATUS_LABELS } from '@/lib/workflow'

import { QuickAddTitleInput } from '@/components/issue-form/QuickAddTitleInput'
import { Button } from '@/components/ui/Button'
import { SubmitButton } from '@/components/ui/SubmitButton'

import type { IssueStatus } from '@/types'

type QuickAddState =
  | { status: 'idle'; attempt: number }
  | { status: 'error'; attempt: number; title: string; message: string }

const initialState: QuickAddState = { status: 'idle', attempt: 0 }

type QuickAddComposerProps = {
  status: IssueStatus
  onCollapse: () => void
}

export function QuickAddComposer({ status, onCollapse }: QuickAddComposerProps) {
  const { scope, createIssueOptimistically } = useBoard()
  const inputId = useId()
  const errorId = useId()

  async function addIssue(previous: QuickAddState, formData: FormData): Promise<QuickAddState> {
    const attempt = previous.attempt + 1
    const parsed = parseQuickAddTitle(formData)
    if (!parsed.ok) return { status: 'error', attempt, title: parsed.title, message: parsed.error }

    const outcome = await createIssueOptimistically({
      title: parsed.title,
      description: '',
      status,
      priority: 'none',
      type: 'feature',
      points: 0,
      assigneeId: null,
      sprintId: scope.kind === 'sprint' ? scope.sprintId : null,
      labels: [],
    })
    switch (outcome.status) {
      case 'created':
        return { status: 'idle', attempt }
      case 'failed':
        return {
          status: 'error',
          attempt,
          title: parsed.title,
          message: fieldErrorFromFailure(outcome.error)?.title ?? describeError(outcome.error),
        }
      default:
        return assertNever(outcome)
    }
  }

  const [state, formAction] = useActionState(addIssue, initialState)
  const errorMessage = state.status === 'error' ? state.message : null

  const collapseOnEscape = (form: HTMLFormElement) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onCollapse()
    }
    form.addEventListener('keydown', handleKeyDown)
    return () => {
      form.removeEventListener('keydown', handleKeyDown)
    }
  }

  return (
    <form
      ref={collapseOnEscape}
      action={formAction}
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-2 shadow-sm"
    >
      <label htmlFor={inputId} className="sr-only">
        {`New issue title in ${STATUS_LABELS[status]}`}
      </label>
      <QuickAddTitleInput
        id={inputId}
        defaultValue={state.status === 'error' ? state.title : ''}
        errorId={errorMessage === null ? undefined : errorId}
      />
      {errorMessage !== null && (
        <p
          key={state.attempt}
          id={errorId}
          role="alert"
          className="text-xs break-words text-danger-fg"
        >
          {errorMessage}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCollapse}>
          Cancel
        </Button>
        <SubmitButton size="sm" pendingLabel="Adding…">
          Add
        </SubmitButton>
      </div>
    </form>
  )
}
