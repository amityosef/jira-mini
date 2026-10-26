import type { PaletteSection } from '@/lib/commands'

import { CommandOption } from '@/components/palette/CommandOption'

type CommandListProps = {
  listboxId: string
  optionId: (commandId: string) => string
  sections: PaletteSection[]
  activeId: string | null
  isStale: boolean
  query: string
}

export function CommandList({
  listboxId,
  optionId,
  sections,
  activeId,
  isStale,
  query,
}: CommandListProps) {
  return (
    <>
      <div
        key={query}
        id={listboxId}
        role="listbox"
        aria-label="Search results"
        aria-busy={isStale || undefined}
        className="relative max-h-96 overflow-y-auto overscroll-contain p-2 empty:p-0 aria-busy:opacity-60 motion-safe:transition-opacity"
      >
        {sections.map((section) => {
          const headingId = `${listboxId}-${section.id}`
          return (
            <div key={section.id} role="group" aria-labelledby={headingId} className="py-1">
              <div
                id={headingId}
                aria-hidden="true"
                className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-fg-subtle"
              >
                {section.title}
              </div>
              {section.commands.map((command) => (
                <CommandOption
                  key={command.id}
                  id={optionId(command.id)}
                  command={command}
                  isActive={command.id === activeId}
                />
              ))}
            </div>
          )
        })}
      </div>
      {sections.length === 0 && (
        <p className="px-4 pt-6 pb-8 text-center text-sm break-words text-fg-muted">
          No results for “{query}”
        </p>
      )}
    </>
  )
}
