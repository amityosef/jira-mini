import { useActionState, useId, useRef } from 'react'
import { useFormStatus } from 'react-dom'

import { useBoard } from '@/context/board'
import { assertNever } from '@/lib/assert'
import { cn } from '@/lib/cn'
import { parseStatus, STATUS_LABELS } from '@/lib/workflow'

import { StatusIcon } from '@/components/ui/IssueIcons'
import { Spinner } from '@/components/ui/Spinner'

import { ISSUE_STATUSES } from '@/types'
import type { IssueStatus } from '@/types'

type StatusFormState = { status: 'idle' } | { status: 'failed'; message: string }

type IssueStatusFormProps = {
  issueId: string
  status: IssueStatus
  isDisabled: boolean
}

const IDLE: StatusFormState = { status: 'idle' }

const selectClassName = cn(
  'h-9 w-full cursor-pointer rounded-md border border-border-strong bg-surface ps-8 pe-3 text-sm text-fg shadow-sm',
  'hover:border-fg-subtle disabled:cursor-not-allowed disabled:opacity-60',
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus',
)

function SavingIndicator() {
  const { pending } = useFormStatus()
  return (
    <p role="status" className="flex min-h-5 items-center gap-1.5 text-xs text-fg-muted">
      {pending && (
        <>
          <Spinner className="size-3.5" />
          Saving…
        </>
      )}
    </p>
  )
}

export function IssueStatusForm({ issueId, status, isDisabled }: IssueStatusFormProps) {
  const { changeStatus } = useBoard()
  const selectId = useId()
  const errorId = useId()
  const restoreFocusRef = useRef(false)

  async function updateStatus(
    _previous: StatusFormState,
    formData: FormData,
  ): Promise<StatusFormState> {
    const nextStatus = parseStatus(formData.get('status'))
    if (!nextStatus) return { status: 'failed', message: 'Choose one of the listed statuses.' }
    const outcome = await changeStatus(issueId, nextStatus)
    switch (outcome.status) {
      case 'moved':
      case 'skipped':
        return IDLE
      case 'failed':
        return { status: 'failed', message: outcome.message }
      default:
        return assertNever(outcome)
    }
  }

  const [state, formAction] = useActionState(updateStatus, IDLE)
  const hasError = state.status === 'failed'

  const keepFocusAcrossRemount = (select: HTMLSelectElement) => {
    if (restoreFocusRef.current) {
      restoreFocusRef.current = false
      select.focus()
    }
    return () => {
      restoreFocusRef.current = select.ownerDocument.activeElement === select
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-fg">
        Status
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-56 max-w-full">
          <StatusIcon
            status={status}
            className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2"
          />
          <select
            key={status}
            ref={keepFocusAcrossRemount}
            id={selectId}
            name="status"
            defaultValue={status}
            disabled={isDisabled}
            aria-describedby={hasError ? errorId : undefined}
            onChange={(event) => {
              event.currentTarget.form?.requestSubmit()
            }}
            className={selectClassName}
          >
            {ISSUE_STATUSES.map((option) => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <SavingIndicator />
      </div>
      {hasError && (
        <p id={errorId} className="text-sm break-words text-danger-fg">
          {state.message}
        </p>
      )}
    </form>
  )
}
