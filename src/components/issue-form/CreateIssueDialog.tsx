import { useActionState, useId } from 'react'
import { X } from 'lucide-react'

import { useBoard } from '@/context/board'
import { describeError } from '@/lib/apiError'
import { assertNever } from '@/lib/assert'
import {
  defaultIssueFormValues,
  describeFieldErrors,
  fieldErrorFromFailure,
  type FieldErrors,
  type IssueFormValues,
  parseIssueForm,
} from '@/lib/issueForm'

import { FormErrorSummary } from '@/components/issue-form/FormErrorSummary'
import { IssueFormFields } from '@/components/issue-form/IssueFormFields'
import { Button } from '@/components/ui/Button'
import { ModalDialog } from '@/components/ui/ModalDialog'
import { SubmitButton } from '@/components/ui/SubmitButton'

import type { IssueStatus } from '@/types'

type CreateIssueDialogProps = {
  onClose: () => void
  initialStatus?: IssueStatus
}

type CreateIssueState =
  | { status: 'editing'; attempt: number; values: IssueFormValues }
  | { status: 'invalid'; attempt: number; values: IssueFormValues; fieldErrors: FieldErrors }
  | { status: 'failed'; attempt: number; values: IssueFormValues; message: string }

const NO_FIELD_ERRORS: FieldErrors = {}

function ErrorSummary({ state }: { state: CreateIssueState }) {
  switch (state.status) {
    case 'editing':
      return null
    case 'invalid':
      return (
        <FormErrorSummary
          title="Some fields need attention"
          message={describeFieldErrors(state.fieldErrors)}
        />
      )
    case 'failed':
      return <FormErrorSummary title="Couldn’t create the issue" message={state.message} />
    default:
      return assertNever(state)
  }
}

export function CreateIssueDialog({ onClose, initialStatus = 'todo' }: CreateIssueDialogProps) {
  const { scope, submitNewIssue } = useBoard()
  const headingId = useId()
  const descriptionId = useId()
  const initialValues = defaultIssueFormValues({
    status: initialStatus,
    sprintId: scope.kind === 'sprint' ? scope.sprintId : null,
  })

  async function createIssueAction(
    previous: CreateIssueState,
    formData: FormData,
  ): Promise<CreateIssueState> {
    const attempt = previous.attempt + 1
    const parsed = parseIssueForm(formData)
    if (!parsed.ok) {
      return { status: 'invalid', attempt, values: parsed.values, fieldErrors: parsed.fieldErrors }
    }

    const outcome = await submitNewIssue(parsed.input)
    switch (outcome.status) {
      case 'created':
        onClose()
        return { status: 'editing', attempt, values: initialValues }
      case 'failed': {
        const fieldErrors = fieldErrorFromFailure(outcome.error)
        return fieldErrors
          ? { status: 'invalid', attempt, values: parsed.values, fieldErrors }
          : {
              status: 'failed',
              attempt,
              values: parsed.values,
              message: describeError(outcome.error),
            }
      }
      default:
        return assertNever(outcome)
    }
  }

  const [state, formAction] = useActionState(createIssueAction, {
    status: 'editing',
    attempt: 0,
    values: initialValues,
  })

  return (
    <ModalDialog
      onClose={onClose}
      width="lg"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      <form action={formAction} className="relative flex flex-col">
        <header className="border-b border-border px-5 py-4 pe-14">
          <h2 id={headingId} className="text-base font-semibold text-fg">
            New issue
          </h2>
          <p id={descriptionId} className="mt-1 text-sm text-fg-muted">
            Capture the problem, its impact and who owns it.
          </p>
        </header>
        <div className="flex flex-col gap-4 px-5 py-4">
          <ErrorSummary key={state.attempt} state={state} />
          <IssueFormFields
            values={state.values}
            fieldErrors={state.status === 'invalid' ? state.fieldErrors : NO_FIELD_ERRORS}
          />
        </div>
        <footer className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton pendingLabel="Creating…">Create issue</SubmitButton>
        </footer>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          className="absolute end-3 top-3"
          onClick={onClose}
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </form>
    </ModalDialog>
  )
}
