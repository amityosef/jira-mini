import { useState } from 'react'

import { ISSUE_DRAG_TYPE } from '@/lib/dragAndDrop'

export function useDragSource(issueId: string) {
  const [isDragging, setIsDragging] = useState(false)

  const dragSourceRef = (node: HTMLElement) => {
    function handleDragStart(event: DragEvent) {
      if (!event.dataTransfer) return
      event.dataTransfer.setData(ISSUE_DRAG_TYPE, issueId)
      event.dataTransfer.effectAllowed = 'move'
      setIsDragging(true)
    }
    function handleDragEnd() {
      setIsDragging(false)
    }
    node.addEventListener('dragstart', handleDragStart)
    node.addEventListener('dragend', handleDragEnd)
    return () => {
      node.removeEventListener('dragstart', handleDragStart)
      node.removeEventListener('dragend', handleDragEnd)
    }
  }

  return { isDragging, dragSourceRef }
}
