import { createContext, use } from 'react'

import type { IssueActions } from '@/hooks/useIssueActions'
import type { BoardView } from '@/hooks/useSprintBoard'

import type { BoardIssue, BoardScope } from '@/types'

export type BoardContextValue = IssueActions & {
  scope: BoardScope
  view: BoardView
  issues: BoardIssue[]
  issuesById: ReadonlyMap<string, BoardIssue>
  retry: () => void
}

export const BoardContext = createContext<BoardContextValue | null>(null)

export function useBoard(): BoardContextValue {
  const board = use(BoardContext)
  if (!board) throw new Error('useBoard must be called inside a <BoardContext> provider.')
  return board
}
