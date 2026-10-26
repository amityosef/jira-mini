import { useWorkspace } from '@/context/workspace'
import { formatDateTime, formatPoints } from '@/lib/format'
import { PRIORITY_LABELS } from '@/lib/workflow'

import { Avatar } from '@/components/ui/Avatar'
import { PriorityIcon } from '@/components/ui/IssueIcons'

import type { Issue } from '@/types'
import type { ReactNode } from 'react'

type PropertyProps = {
  term: string
  children: ReactNode
}

function Property({ term, children }: PropertyProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs font-medium text-fg-muted">{term}</dt>
      <dd className="flex min-w-0 items-center gap-2 text-sm text-fg">{children}</dd>
    </div>
  )
}

type IssuePropertiesProps = { issue: Issue }

export function IssueProperties({ issue }: IssuePropertiesProps) {
  const { membersById, sprints } = useWorkspace()
  const assignee = issue.assigneeId ? (membersById.get(issue.assigneeId) ?? null) : null
  const sprintName =
    sprints.find((sprint) => sprint.id === issue.sprintId)?.name ?? 'No sprint (team backlog)'

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <Property term="Priority">
        <PriorityIcon priority={issue.priority} />
        {PRIORITY_LABELS[issue.priority]}
      </Property>
      <Property term="Estimate">
        {issue.points > 0 ? formatPoints(issue.points) : 'Unestimated'}
      </Property>
      <Property term="Assignee">
        <span aria-hidden="true" className="flex">
          <Avatar member={assignee} />
        </span>
        <span className="truncate">{assignee?.name ?? 'Unassigned'}</span>
      </Property>
      <Property term="Sprint">
        <span className="truncate" title={sprintName}>
          {sprintName}
        </span>
      </Property>
      <Property term="Labels">
        {issue.labels.length > 0 ? (
          <ul className="flex min-w-0 flex-wrap gap-1.5">
            {issue.labels.map((label) => (
              <li
                key={label}
                className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs break-all text-fg-muted"
              >
                {label}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-fg-subtle">None</span>
        )}
      </Property>
      <Property term="Created">
        <time dateTime={issue.createdAt}>{formatDateTime(issue.createdAt)}</time>
      </Property>
      <Property term="Last updated">
        <time dateTime={issue.updatedAt}>{formatDateTime(issue.updatedAt)}</time>
      </Property>
    </dl>
  )
}
