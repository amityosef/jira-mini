import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'
import { STATUS_LABELS } from '@/lib/workflow'

import { Button } from '@/components/ui/Button'

import type { IssueStatus } from '@/types'

type CardMoveButtonsProps = {
  issueId: string
  previousStatus: IssueStatus | null
  nextStatus: IssueStatus | null
  onMove: (status: IssueStatus) => void
}

const revealClassName = cn(
  'relative z-10 ms-auto flex items-center gap-0.5',
  'pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100',
  'motion-safe:transition-opacity',
)

export function CardMoveButtons({
  issueId,
  previousStatus,
  nextStatus,
  onMove,
}: CardMoveButtonsProps) {
  return (
    <div className={revealClassName}>
      {previousStatus && (
        <Button
          size="icon-sm"
          variant="ghost"
          tabIndex={-1}
          aria-label={`Move ${issueId} to ${STATUS_LABELS[previousStatus]}`}
          title={`Move to ${STATUS_LABELS[previousStatus]}`}
          onClick={() => {
            onMove(previousStatus)
          }}
        >
          <ChevronLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Button>
      )}
      {nextStatus && (
        <Button
          size="icon-sm"
          variant="ghost"
          tabIndex={-1}
          aria-label={`Move ${issueId} to ${STATUS_LABELS[nextStatus]}`}
          title={`Move to ${STATUS_LABELS[nextStatus]}`}
          onClick={() => {
            onMove(nextStatus)
          }}
        >
          <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Button>
      )}
    </div>
  )
}
