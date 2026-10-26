import { useId, useRef, useState } from 'react'
import { Trash } from 'lucide-react'

import { useBoard } from '@/context/board'
import { closeIssue } from '@/lib/navigation'

import { Button } from '@/components/ui/Button'
import { SubmitButton } from '@/components/ui/SubmitButton'

type DeleteIssueFormProps = { issueId: string }

function focusOnMount(element: HTMLElement | null) {
  element?.focus()
}

export function DeleteIssueForm({ issueId }: DeleteIssueFormProps) {
  const { deleteIssue } = useBoard()
  const [isConfirming, setIsConfirming] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const confirmationId = useId()
  const promptId = useId()

  async function confirmDeletion() {
    closeIssue()
    await deleteIssue(issueId)
  }

  function cancel() {
    setIsConfirming(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="flex flex-col items-start gap-3 border-t border-border pt-6">
      <Button
        ref={triggerRef}
        size="sm"
        aria-expanded={isConfirming}
        aria-controls={isConfirming ? confirmationId : undefined}
        onClick={() => {
          setIsConfirming((value) => !value)
        }}
      >
        <Trash aria-hidden="true" className="size-4 text-danger-fg" />
        Delete issue
      </Button>
      {isConfirming && (
        <form
          id={confirmationId}
          action={confirmDeletion}
          className="flex w-full flex-col gap-3 rounded-lg border border-danger/25 bg-danger-subtle p-4"
        >
          <p id={promptId} className="text-sm break-words text-danger-fg">
            Delete {issueId}? This can’t be undone.
          </p>
          <div className="flex flex-wrap gap-2">
            <SubmitButton
              ref={focusOnMount}
              size="sm"
              variant="danger"
              pendingLabel="Deleting…"
              aria-describedby={promptId}
            >
              Delete
            </SubmitButton>
            <Button size="sm" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
