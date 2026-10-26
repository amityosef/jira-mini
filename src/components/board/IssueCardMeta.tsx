import { useWorkspace } from '@/context/workspace'
import { formatPoints } from '@/lib/format'
import { PRIORITY_LABELS } from '@/lib/workflow'

import { Avatar } from '@/components/ui/Avatar'
import { PriorityIcon } from '@/components/ui/IssueIcons'

import type { BoardIssue } from '@/types'

type IssueCardMetaProps = { issue: BoardIssue }

const MAX_VISIBLE_LABELS = 2

export function IssueCardMeta({ issue }: IssueCardMetaProps) {
  const { membersById } = useWorkspace()
  const assignee = issue.assigneeId === null ? null : (membersById.get(issue.assigneeId) ?? null)
  const visibleLabels = issue.labels.slice(0, MAX_VISIBLE_LABELS)
  const hiddenLabelCount = issue.labels.length - visibleLabels.length
  const priorityLabel = PRIORITY_LABELS[issue.priority]

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="inline-flex shrink-0" title={priorityLabel}>
        <PriorityIcon priority={issue.priority} />
        <span className="sr-only">{`Priority: ${priorityLabel}`}</span>
      </span>
      {visibleLabels.length > 0 ? (
        <ul aria-label="Labels" className="flex min-w-0 flex-1 items-center gap-1">
          {visibleLabels.map((label) => (
            <li
              key={label}
              title={label}
              className="min-w-0 truncate rounded-full border border-border px-1.5 text-xs text-fg-muted"
            >
              {label}
            </li>
          ))}
          {hiddenLabelCount > 0 && (
            <li className="shrink-0 text-xs text-fg-subtle">
              {`+${hiddenLabelCount}`}
              <span className="sr-only"> more labels</span>
            </li>
          )}
        </ul>
      ) : (
        <span className="flex-1" />
      )}
      {issue.points > 0 && (
        <span className="shrink-0 rounded-md bg-surface-muted px-1.5 text-xs font-medium text-fg-muted tabular-nums">
          <span aria-hidden="true">{issue.points}</span>
          <span className="sr-only">{formatPoints(issue.points)}</span>
        </span>
      )}
      <Avatar member={assignee} />
    </div>
  )
}
