import { CalendarDays, Inbox } from 'lucide-react'

import { useBoard } from '@/context/board'
import { useWorkspace } from '@/context/workspace'
import { assertNever } from '@/lib/assert'
import { formatCount, formatDateRange } from '@/lib/format'

import { SprintMetricsSummary } from '@/components/sprint/SprintMetricsSummary'

import type { Sprint } from '@/types'

const SPRINT_STATE_LABELS = {
  active: 'Active',
  planned: 'Planned',
  completed: 'Completed',
} as const satisfies Record<Sprint['state'], string>

function SprintSummary({ sprint }: { sprint: Sprint }) {
  return (
    <header className="flex flex-wrap items-end gap-x-8 gap-y-4 px-4 pt-5 pb-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs text-fg-muted">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          <span>{formatDateRange(sprint.startDate, sprint.endDate)}</span>
          <span aria-hidden="true">·</span>
          <span>{SPRINT_STATE_LABELS[sprint.state]}</span>
        </p>
        <h1 className="mt-1 text-xl font-semibold text-fg">{sprint.name}</h1>
        <p className="mt-0.5 max-w-prose text-sm break-words text-fg-muted">{sprint.goal}</p>
      </div>
      <SprintMetricsSummary sprintId={sprint.id} />
    </header>
  )
}

function BacklogSummary() {
  const { issues } = useBoard()
  const unscheduledCount = issues.filter((issue) => issue.sprintId === null).length

  return (
    <header className="px-4 pt-5 pb-4 sm:px-6">
      <p className="flex items-center gap-1.5 text-xs text-fg-muted">
        <Inbox aria-hidden="true" className="size-3.5" />
        {formatCount(unscheduledCount, 'unscheduled issue')}
      </p>
      <h1 className="mt-1 text-xl font-semibold text-fg">Team backlog</h1>
      <p className="mt-0.5 max-w-prose text-sm text-fg-muted">
        Issues that are not planned into a sprint yet. Triage and prioritise them here before sprint
        planning.
      </p>
    </header>
  )
}

export function SprintHeader() {
  const { scope } = useBoard()
  const { sprints } = useWorkspace()

  switch (scope.kind) {
    case 'sprint': {
      const sprint = sprints.find((candidate) => candidate.id === scope.sprintId)
      return sprint ? <SprintSummary sprint={sprint} /> : null
    }
    case 'backlog':
      return <BacklogSummary />
    default:
      return assertNever(scope)
  }
}
