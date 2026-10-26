import { Plus, Search, SquareKanban } from 'lucide-react'

import { useWorkspace } from '@/context/workspace'
import { MOD_KEY_LABEL } from '@/lib/platform'

import { ScopeSwitcher } from '@/components/layout/ScopeSwitcher'
import { DisplayMenu } from '@/components/settings/DisplayMenu'
import { SimulationPanel } from '@/components/settings/SimulationPanel'
import { Button } from '@/components/ui/Button'
import { Kbd } from '@/components/ui/Kbd'

type TopBarProps = {
  mainContentId: string
  onOpenPalette: () => void
  onCreateIssue: () => void
}

export function TopBar({ mainContentId, onOpenPalette, onCreateIssue }: TopBarProps) {
  const { workspace } = useWorkspace()

  return (
    <header className="relative flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-surface px-4 py-2.5 sm:px-6">
      <a
        href={`#${mainContentId}`}
        onClick={(event) => {
          event.preventDefault()
          document.getElementById(mainContentId)?.focus()
        }}
        className="sr-only rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:z-50"
      >
        Skip to board
      </a>
      <div className="flex min-w-0 items-center gap-2">
        <SquareKanban aria-hidden="true" className="size-6 shrink-0 text-accent" />
        <p className="flex min-w-0 items-baseline gap-1.5 text-sm">
          <span className="font-semibold text-fg">SprintFlow</span>
          <span aria-hidden="true" className="text-fg-subtle">
            /
          </span>
          <span className="truncate text-fg-muted" title={workspace.teamName}>
            {workspace.teamName}
          </span>
        </p>
      </div>
      <ScopeSwitcher />
      <div className="ms-auto flex items-center gap-1.5">
        <Button
          size="sm"
          onClick={onOpenPalette}
          aria-label="Search issues and run commands"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <Search aria-hidden="true" className="size-4" />
          <span className="hidden text-fg-muted md:inline">Search…</span>
          <Kbd>{`${MOD_KEY_LABEL} K`}</Kbd>
        </Button>
        <DisplayMenu />
        <SimulationPanel />
        <Button size="sm" variant="primary" onClick={onCreateIssue}>
          <Plus aria-hidden="true" className="size-4" />
          New issue
        </Button>
      </div>
    </header>
  )
}
