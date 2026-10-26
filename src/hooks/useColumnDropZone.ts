import { type DragEvent, useState } from 'react'

import { useBoard } from '@/context/board'
import { carriesIssue, ISSUE_DRAG_TYPE } from '@/lib/dragAndDrop'

import type { IssueStatus } from '@/types'

export function useColumnDropZone(status: IssueStatus) {
  const { moveIssue } = useBoard()
  const [isDropTarget, setIsDropTarget] = useState(false)

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!carriesIssue(event.dataTransfer)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsDropTarget(true)
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    const isStillInside =
      event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)
    if (!isStillInside) setIsDropTarget(false)
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    setIsDropTarget(false)
    const issueId = event.dataTransfer.getData(ISSUE_DRAG_TYPE)
    if (!issueId) return
    event.preventDefault()
    moveIssue(issueId, status)
  }

  return {
    isDropTarget,
    dropZoneProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}
