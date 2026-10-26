import { useAppLocation } from '@/hooks/useAppLocation'
import { useDragSource } from '@/hooks/useDragSource'
import { useIssueCardControls } from '@/hooks/useIssueCardControls'
import { cn } from '@/lib/cn'
import { hrefWith } from '@/lib/navigation'

import { CardMoveButtons } from '@/components/board/CardMoveButtons'
import { IssueCardMeta } from '@/components/board/IssueCardMeta'
import { TypeIcon } from '@/components/ui/IssueIcons'
import { Spinner } from '@/components/ui/Spinner'

import type { BoardIssue } from '@/types'

type IssueCardProps = { issue: BoardIssue }

const SYNC_LABELS = { creating: 'Creating…', moving: 'Saving…' } as const

const cardClassName = cn(
  'group relative flex min-w-0 cursor-grab flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-sm',
  'hover:border-border-strong hover:shadow-md active:cursor-grabbing motion-safe:transition-shadow',
  'aria-busy:cursor-progress aria-busy:border-dashed data-dragging:opacity-50 compact:gap-1 compact:p-2',
)

const stretchedLinkClassName = cn(
  'outline-hidden after:absolute after:inset-0 after:rounded-lg',
  'focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus',
)

export function IssueCard({ issue }: IssueCardProps) {
  const { search } = useAppLocation()
  const { isDragging, dragSourceRef } = useDragSource(issue.id)
  const { previousStatus, nextStatus, moveTo, handleKeyDown, handleOpen, focusAfterMove } =
    useIssueCardControls(issue)
  const isDraft = issue.syncState === 'creating'

  return (
    <article
      ref={isDraft ? undefined : dragSourceRef}
      data-issue-id={isDraft ? undefined : issue.id}
      data-dragging={isDragging || undefined}
      aria-busy={issue.syncState === 'synced' ? undefined : true}
      draggable={!isDraft}
      className={cardClassName}
    >
      <div className="flex min-w-0 items-center gap-1.5 text-xs text-fg-muted">
        <TypeIcon type={issue.type} className="size-3.5" />
        <span className="font-mono tabular-nums">{isDraft ? 'New' : issue.id}</span>
        {issue.syncState !== 'synced' && (
          <span className="inline-flex items-center gap-1 text-fg-subtle">
            <Spinner className="size-3" />
            {SYNC_LABELS[issue.syncState]}
          </span>
        )}
        {!isDraft && (
          <CardMoveButtons
            issueId={issue.id}
            previousStatus={previousStatus}
            nextStatus={nextStatus}
            onMove={moveTo}
          />
        )}
      </div>
      <h3 className="line-clamp-3 text-sm leading-snug font-medium break-words text-fg">
        {isDraft ? (
          issue.title
        ) : (
          <a
            ref={focusAfterMove}
            href={hrefWith(search, { issue: issue.id })}
            draggable={false}
            aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
            onClick={handleOpen}
            onKeyDown={handleKeyDown}
            className={stretchedLinkClassName}
          >
            {issue.title}
          </a>
        )}
      </h3>
      <IssueCardMeta issue={issue} />
    </article>
  )
}
