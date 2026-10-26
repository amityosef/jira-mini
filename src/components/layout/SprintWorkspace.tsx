import { useId, useState } from 'react'

import { useWorkspace } from '@/context/workspace'
import { useAppLocation } from '@/hooks/useAppLocation'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { MOD_KEY_LABEL } from '@/lib/platform'

import { Board } from '@/components/board/Board'
import { IssueDrawer } from '@/components/issue/IssueDrawer'
import { CreateIssueDialog } from '@/components/issue-form/CreateIssueDialog'
import { AppMetadata } from '@/components/layout/AppMetadata'
import { TopBar } from '@/components/layout/TopBar'
import { CommandPalette } from '@/components/palette/CommandPalette'
import { BoardProvider } from '@/components/providers/BoardProvider'
import { SprintHeader } from '@/components/sprint/SprintHeader'

export function SprintWorkspace() {
  const mainContentId = useId()
  const { preferences } = useWorkspace()
  const { issueId } = useAppLocation()
  const {
    isOpen: isPaletteOpen,
    contextIssueId,
    open: openPalette,
    close: closePalette,
    shortcutRef,
  } = useCommandPalette()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  function openCreateDialog() {
    setIsCreateOpen(true)
  }

  return (
    <BoardProvider>
      <div
        ref={shortcutRef}
        data-density={preferences.density}
        className="flex h-dvh flex-col overflow-hidden"
      >
        {issueId === null && <AppMetadata />}
        <TopBar
          mainContentId={mainContentId}
          onOpenPalette={() => {
            openPalette()
          }}
          onCreateIssue={openCreateDialog}
        />
        <main
          id={mainContentId}
          tabIndex={-1}
          className="flex min-h-0 flex-1 flex-col outline-hidden"
        >
          <SprintHeader />
          <Board />
          <p className="hidden px-6 pb-3 text-xs text-fg-subtle md:block">
            {`Tip: focus a card and press Shift + ← / → to move it between columns. Press ${MOD_KEY_LABEL} K to search or run a command.`}
          </p>
        </main>
        {issueId && <IssueDrawer key={issueId} issueId={issueId} />}
        {isPaletteOpen && (
          <CommandPalette
            contextIssueId={contextIssueId}
            onClose={closePalette}
            onCreateIssue={openCreateDialog}
          />
        )}
        {isCreateOpen && (
          <CreateIssueDialog
            onClose={() => {
              setIsCreateOpen(false)
            }}
          />
        )}
      </div>
    </BoardProvider>
  )
}
