import { BoardContext, type BoardContextValue } from '@/context/board'
import { useWorkspace } from '@/context/workspace'
import { useAppLocation } from '@/hooks/useAppLocation'
import { useIssueActions } from '@/hooks/useIssueActions'
import { useSprintBoard } from '@/hooks/useSprintBoard'
import { resolveScope } from '@/lib/navigation'

import type { ReactNode } from 'react'

type BoardProviderProps = { children: ReactNode }

export function BoardProvider({ children }: BoardProviderProps) {
  const { sprints } = useWorkspace()
  const { scopeParam } = useAppLocation()
  const scope = resolveScope(scopeParam, sprints)
  const { view, issues, issuesById, applyOptimistic, retry } = useSprintBoard(scope)
  const actions = useIssueActions({ issuesById, applyOptimistic })

  const value: BoardContextValue = { ...actions, scope, view, issues, issuesById, retry }

  return <BoardContext value={value}>{children}</BoardContext>
}
