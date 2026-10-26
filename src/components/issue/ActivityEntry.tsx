import { assertNever } from '@/lib/assert'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { STATUS_LABELS } from '@/lib/workflow'

import { Avatar } from '@/components/ui/Avatar'
import { StatusIcon } from '@/components/ui/IssueIcons'

import type { ActivityEvent, IssueStatus, TeamMember } from '@/types'
import type { ReactNode } from 'react'

type ActivityEntryProps = {
  event: ActivityEvent
  membersById: ReadonlyMap<string, TeamMember>
  now: number
}

function StatusName({ status }: { status: IssueStatus }) {
  return (
    <span className="inline-flex items-center gap-1 font-medium whitespace-nowrap text-fg">
      <StatusIcon status={status} className="size-3.5" />
      {STATUS_LABELS[status]}
    </span>
  )
}

function describeEvent(
  event: ActivityEvent,
  membersById: ReadonlyMap<string, TeamMember>,
): ReactNode {
  switch (event.kind) {
    case 'created':
      return 'created the issue'
    case 'status_changed':
      return (
        <>
          moved it from <StatusName status={event.from} /> to <StatusName status={event.to} />
        </>
      )
    case 'commented':
      return 'commented'
    case 'assigned': {
      if (event.assigneeId === null) return 'removed the assignee'
      return `assigned it to ${membersById.get(event.assigneeId)?.name ?? 'a teammate'}`
    }
    default:
      return assertNever(event)
  }
}

export function ActivityEntry({ event, membersById, now }: ActivityEntryProps) {
  const actor = membersById.get(event.actorId) ?? null

  return (
    <li className="flex min-w-0 gap-3">
      <span aria-hidden="true" className="flex pt-0.5">
        <Avatar member={actor} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm break-words text-fg-muted">
          <span className="font-medium text-fg">{actor?.name ?? 'Someone'}</span>{' '}
          {describeEvent(event, membersById)}
        </p>
        {event.kind === 'commented' && (
          <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm break-words whitespace-pre-line text-fg">
            {event.body}
          </p>
        )}
        <time
          dateTime={event.occurredAt}
          title={formatDateTime(event.occurredAt)}
          className="text-xs text-fg-subtle"
        >
          {formatRelativeTime(event.occurredAt, now)}
        </time>
      </div>
    </li>
  )
}
