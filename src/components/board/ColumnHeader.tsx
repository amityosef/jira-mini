import { cn } from '@/lib/cn'
import { formatCount, formatPoints } from '@/lib/format'
import { STATUS_LABELS } from '@/lib/workflow'

import { StatusIcon } from '@/components/ui/IssueIcons'

import type { BoardColumn } from '@/types'

type ColumnHeaderProps = {
  column: BoardColumn
  headingId: string
}

export function ColumnHeader({ column, headingId }: ColumnHeaderProps) {
  const issueCount = column.issues.length
  const isAtLimit = column.wipLimit !== null && issueCount >= column.wipLimit
  const countLabel = column.wipLimit === null ? `${issueCount}` : `${issueCount}/${column.wipLimit}`
  const countDescription =
    column.wipLimit === null
      ? formatCount(issueCount, 'issue')
      : `${formatCount(issueCount, 'issue')} of a work-in-progress limit of ${column.wipLimit}`

  return (
    <header className="flex min-w-0 items-center gap-2 px-3 pt-3 pb-2">
      <StatusIcon status={column.status} />
      <h2 id={headingId} className="truncate text-sm font-semibold text-fg">
        {STATUS_LABELS[column.status]}
      </h2>
      <span
        className={cn(
          'shrink-0 rounded-full px-1.5 text-xs font-medium tabular-nums',
          isAtLimit ? 'bg-warning-subtle text-warning-fg' : 'bg-surface-active text-fg-muted',
        )}
      >
        <span aria-hidden="true">{countLabel}</span>
        <span className="sr-only">{countDescription}</span>
      </span>
      {isAtLimit && <span className="shrink-0 text-xs font-medium text-warning-fg">At limit</span>}
      <span className="ms-auto shrink-0 text-xs text-fg-muted tabular-nums">
        <span aria-hidden="true">{`${column.totalPoints} pts`}</span>
        <span className="sr-only">{formatPoints(column.totalPoints)}</span>
      </span>
    </header>
  )
}
