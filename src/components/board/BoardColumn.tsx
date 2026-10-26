import { useId } from 'react'

import { useColumnDropZone } from '@/hooks/useColumnDropZone'
import { cn } from '@/lib/cn'

import { ChaosProbe } from '@/components/board/ChaosProbe'
import { ColumnHeader } from '@/components/board/ColumnHeader'
import { IssueCard } from '@/components/board/IssueCard'
import { QuickAddForm } from '@/components/issue-form/QuickAddForm'

import type { BoardColumn as BoardColumnData } from '@/types'

type BoardColumnProps = { column: BoardColumnData }

export const columnFrameClassName =
  'relative flex max-h-full min-w-64 max-w-96 flex-1 snap-start flex-col rounded-xl border border-border bg-surface-muted'

const dropTargetClassName =
  'data-drop-target:border-accent data-drop-target:bg-accent-subtle motion-safe:transition-colors'

export function BoardColumn({ column }: BoardColumnProps) {
  const headingId = useId()
  const { isDropTarget, dropZoneProps } = useColumnDropZone(column.status)

  return (
    <section
      aria-labelledby={headingId}
      data-drop-target={isDropTarget || undefined}
      className={cn(columnFrameClassName, dropTargetClassName)}
      {...dropZoneProps}
    >
      <ChaosProbe status={column.status} />
      <ColumnHeader column={column} headingId={headingId} />
      {column.issues.length === 0 ? (
        <p className="mx-2 rounded-lg border border-dashed border-border-strong px-3 py-6 text-center text-xs text-fg-muted">
          No issues yet. Drag a card here or add one below.
        </p>
      ) : (
        <ol
          aria-labelledby={headingId}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pt-0.5 pb-1"
        >
          {column.issues.map((issue) => (
            <li key={issue.id}>
              <IssueCard issue={issue} />
            </li>
          ))}
        </ol>
      )}
      <div className="p-2">
        <QuickAddForm status={column.status} />
      </div>
    </section>
  )
}
