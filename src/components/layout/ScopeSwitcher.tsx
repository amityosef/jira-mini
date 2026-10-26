import { useId } from 'react'

import { useBoard } from '@/context/board'
import { useWorkspace } from '@/context/workspace'
import { resolveScope, selectScope } from '@/lib/navigation'
import { BACKLOG_SCOPE_PARAM, scopeToParam } from '@/lib/workflow'

import { focusRingClassName } from '@/components/ui/Button'

import type { Sprint } from '@/types'

const STATE_SUFFIXES = {
  active: ' · active',
  planned: '',
  completed: ' · completed',
} as const satisfies Record<Sprint['state'], string>

export function ScopeSwitcher() {
  const { scope } = useBoard()
  const { sprints } = useWorkspace()
  const selectId = useId()

  return (
    <div className="flex min-w-0 items-center gap-2">
      <label htmlFor={selectId} className="sr-only">
        Board
      </label>
      <select
        id={selectId}
        value={scopeToParam(scope)}
        onChange={(event) => {
          selectScope(resolveScope(event.target.value, sprints))
        }}
        className={`h-8 min-w-0 cursor-pointer rounded-md border border-border-strong bg-surface ps-2.5 pe-8 text-sm font-medium text-fg shadow-sm hover:border-fg-subtle ${focusRingClassName}`}
      >
        {sprints.map((sprint) => (
          <option key={sprint.id} value={sprint.id}>
            {`${sprint.name}${STATE_SUFFIXES[sprint.state]}`}
          </option>
        ))}
        <option value={BACKLOG_SCOPE_PARAM}>Team backlog</option>
      </select>
    </div>
  )
}
