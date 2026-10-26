import { useId } from 'react'
import { Search } from 'lucide-react'

import { useCommandSearch } from '@/hooks/useCommandSearch'
import { formatCount } from '@/lib/format'

import { CommandList } from '@/components/palette/CommandList'
import { PaletteFooter } from '@/components/palette/PaletteFooter'
import { ModalDialog } from '@/components/ui/ModalDialog'

type CommandPaletteProps = {
  contextIssueId: string | null
  onClose: () => void
  onCreateIssue: () => void
}

function focusAfterDialogOpens(input: HTMLInputElement) {
  let isMounted = true
  queueMicrotask(() => {
    if (isMounted) input.focus()
  })
  return () => {
    isMounted = false
  }
}

export function CommandPalette({ contextIssueId, onClose, onCreateIssue }: CommandPaletteProps) {
  const {
    query,
    deferredQuery,
    isStale,
    sections,
    activeCommand,
    resultCount,
    changeQuery,
    navigationRef,
  } = useCommandSearch({ contextIssueId, onClose, onCreateIssue })
  const baseId = useId()
  const listboxId = `${baseId}-listbox`
  const optionId = (commandId: string) => `${baseId}-option-${commandId}`
  const resultMessage = resultCount === 0 ? 'No results' : formatCount(resultCount, 'result')

  return (
    <ModalDialog onClose={onClose} placement="top" width="lg" aria-label="Command palette">
      <div ref={navigationRef} className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 focus-within:border-accent">
          <Search aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />
          <input
            ref={focusAfterDialogOpens}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeCommand ? optionId(activeCommand.id) : undefined}
            aria-autocomplete="list"
            aria-label="Search issues and commands"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search issues, sprints and commands…"
            value={query}
            onChange={(event) => {
              changeQuery(event.target.value)
            }}
            className="h-12 w-full min-w-0 bg-transparent text-base text-fg placeholder:text-fg-subtle focus-visible:outline-hidden"
          />
        </div>
        <CommandList
          listboxId={listboxId}
          optionId={optionId}
          sections={sections}
          activeId={activeCommand?.id ?? null}
          isStale={isStale}
          query={deferredQuery}
        />
        <p role="status" className="sr-only">
          {resultMessage}
        </p>
        <PaletteFooter />
      </div>
    </ModalDialog>
  )
}
