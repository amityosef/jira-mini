import { useDeferredValue, useState } from 'react'

import { useBoard } from '@/context/board'
import { useWorkspace } from '@/context/workspace'
import { useAppLocation } from '@/hooks/useAppLocation'
import { assertNever } from '@/lib/assert'
import { buildPaletteSections, type PaletteCommand, type PaletteSection } from '@/lib/commands'
import { openIssue, selectScope } from '@/lib/navigation'

type CommandSearchOptions = {
  contextIssueId: string | null
  onClose: () => void
  onCreateIssue: () => void
}

const OPTION_SELECTOR = '[data-command-id]'
const LISTBOX_SELECTOR = '[role="listbox"]'

function commandIdFrom(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null
  return target.closest(OPTION_SELECTOR)?.getAttribute('data-command-id') ?? null
}

function revealOption(container: HTMLElement, commandId: string) {
  const option = Array.from(container.querySelectorAll<HTMLElement>(OPTION_SELECTOR)).find(
    (element) => element.dataset.commandId === commandId,
  )
  const listbox = option?.closest<HTMLElement>(LISTBOX_SELECTOR)
  if (!option || !listbox) return
  const optionBottom = option.offsetTop + option.offsetHeight
  if (option.offsetTop < listbox.scrollTop) {
    listbox.scrollTop = option.offsetTop
  } else if (optionBottom > listbox.scrollTop + listbox.clientHeight) {
    listbox.scrollTop = optionBottom - listbox.clientHeight
  }
}

export function useCommandSearch({ contextIssueId, onClose, onCreateIssue }: CommandSearchOptions) {
  const { issues, scope, moveIssue } = useBoard()
  const { sprints, preferences, updatePreferences } = useWorkspace()
  const { issueId: openIssueId } = useAppLocation()
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query)

  const searchableIssues = issues.filter((issue) => issue.syncState !== 'creating')
  const contextId = contextIssueId ?? openIssueId
  const contextIssue = searchableIssues.find((issue) => issue.id === contextId) ?? null

  function sectionsFor(searchQuery: string): PaletteSection[] {
    return buildPaletteSections({
      query: searchQuery,
      issues: searchableIssues,
      sprints,
      scope,
      contextIssue,
      preferences,
    })
  }

  const sections = sectionsFor(deferredQuery)
  const options = sections.flatMap((section) => section.commands)
  const activeCommand = options.find((command) => command.id === activeId) ?? options[0] ?? null
  const isStale = query !== deferredQuery

  function changeQuery(value: string) {
    setQuery(value)
    setActiveId(null)
  }

  function runCommand(command: PaletteCommand) {
    onClose()
    switch (command.kind) {
      case 'open-issue':
        openIssue(command.issue.id)
        return
      case 'set-status':
        moveIssue(command.issue.id, command.status)
        return
      case 'switch-scope':
        selectScope(command.scope)
        return
      case 'create-issue':
        onCreateIssue()
        return
      case 'set-direction':
        updatePreferences({ direction: command.direction })
        return
      case 'set-density':
        updatePreferences({ density: command.density })
        return
      default:
        assertNever(command)
    }
  }

  function activate(container: HTMLElement, command: PaletteCommand | undefined) {
    if (!command) return
    setActiveId(command.id)
    revealOption(container, command.id)
  }

  function step(container: HTMLElement, offset: 1 | -1) {
    const currentIndex = activeCommand ? options.indexOf(activeCommand) : -1
    activate(container, options.at((currentIndex + offset) % options.length))
  }

  function commandForEnter(): PaletteCommand | null {
    if (!isStale) return activeCommand
    return sectionsFor(query).flatMap((section) => section.commands)[0] ?? null
  }

  const navigationRef = (container: HTMLElement | null) => {
    if (!container) return undefined
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) return
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          step(container, 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          step(container, -1)
          break
        case 'Home':
          event.preventDefault()
          activate(container, options.at(0))
          break
        case 'End':
          event.preventDefault()
          activate(container, options.at(-1))
          break
        case 'Enter': {
          const command = commandForEnter()
          if (!command) return
          event.preventDefault()
          runCommand(command)
          break
        }
        default:
          break
      }
    }
    const handlePointerMove = (event: PointerEvent) => {
      const commandId = commandIdFrom(event.target)
      if (commandId && commandId !== activeCommand?.id) setActiveId(commandId)
    }
    const handleMouseDown = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(LISTBOX_SELECTOR)) {
        event.preventDefault()
      }
    }
    const handleClick = (event: MouseEvent) => {
      const commandId = commandIdFrom(event.target)
      const command = options.find((option) => option.id === commandId)
      if (command) runCommand(command)
    }
    container.addEventListener('keydown', handleKeyDown)
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('click', handleClick)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('click', handleClick)
    }
  }

  return {
    query,
    deferredQuery,
    isStale,
    sections,
    activeCommand,
    resultCount: options.length,
    changeQuery,
    navigationRef,
  }
}
