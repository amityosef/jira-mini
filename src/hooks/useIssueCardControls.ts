import { useBoard } from '@/context/board'
import { useWorkspace } from '@/context/workspace'
import { isPlainLeftClick, openIssue } from '@/lib/navigation'
import { adjacentStatus, visualStep } from '@/lib/workflow'

import type { BoardIssue, IssueStatus } from '@/types'
import type { KeyboardEvent, MouseEvent } from 'react'

export function useIssueCardControls(issue: BoardIssue) {
  const { moveIssue, claimFocus } = useBoard()
  const { preferences } = useWorkspace()

  function moveTo(status: IssueStatus) {
    moveIssue(issue.id, status, { restoreFocus: true })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    const { key } = event
    if (!event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return
    if (key !== 'ArrowLeft' && key !== 'ArrowRight') return
    event.preventDefault()
    const target = adjacentStatus(issue.status, visualStep(key, preferences.direction))
    if (target) moveTo(target)
  }

  function handleOpen(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainLeftClick(event)) return
    event.preventDefault()
    openIssue(issue.id)
  }

  function focusAfterMove(node: HTMLElement | null) {
    if (node && claimFocus(issue.id)) node.focus()
  }

  return {
    previousStatus: adjacentStatus(issue.status, -1),
    nextStatus: adjacentStatus(issue.status, 1),
    moveTo,
    handleKeyDown,
    handleOpen,
    focusAfterMove,
  }
}
