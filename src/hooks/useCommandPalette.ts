import { useState } from 'react'

type PaletteState =
  { isOpen: false; contextIssueId: null } | { isOpen: true; contextIssueId: string | null }

const CLOSED: PaletteState = { isOpen: false, contextIssueId: null }

function isPaletteShortcut(event: KeyboardEvent): boolean {
  const isK = event.code === 'KeyK' || event.key.toLowerCase() === 'k'
  return isK && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey
}

function focusedIssueId(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null
  return target.closest('[data-issue-id]')?.getAttribute('data-issue-id') ?? null
}

export function useCommandPalette() {
  const [state, setState] = useState<PaletteState>(CLOSED)

  function open(contextIssueId: string | null = null) {
    setState({ isOpen: true, contextIssueId })
  }

  function close() {
    setState(CLOSED)
  }

  const shortcutRef = (node: Element | null) => {
    if (!node) return undefined
    const { ownerDocument } = node
    function handleKeyDown(event: KeyboardEvent) {
      if (!isPaletteShortcut(event)) return
      event.preventDefault()
      if (event.repeat) return
      const contextIssueId = focusedIssueId(event.target)
      setState((current) => (current.isOpen ? CLOSED : { isOpen: true, contextIssueId }))
    }
    ownerDocument.addEventListener('keydown', handleKeyDown)
    return () => {
      ownerDocument.removeEventListener('keydown', handleKeyDown)
    }
  }

  return {
    isOpen: state.isOpen,
    contextIssueId: state.contextIssueId,
    open,
    close,
    shortcutRef,
  }
}
