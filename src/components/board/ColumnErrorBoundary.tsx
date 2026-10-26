import { ErrorBoundary } from 'react-error-boundary'
import { useQueryClient } from '@tanstack/react-query'

import { cn } from '@/lib/cn'
import { issueKeys } from '@/lib/queries'
import { STATUS_LABELS } from '@/lib/workflow'
import { getSimulationSettings, updateSimulationSettings } from '@/mocks/simulation'

import { columnFrameClassName } from '@/components/board/BoardColumn'
import { ErrorPanel } from '@/components/ui/ErrorPanel'

import type { IssueStatus } from '@/types'
import type { ReactNode } from 'react'

type ColumnErrorBoundaryProps = {
  status: IssueStatus
  children: ReactNode
}

export function ColumnErrorBoundary({ status, children }: ColumnErrorBoundaryProps) {
  const queryClient = useQueryClient()
  const label = STATUS_LABELS[status]

  function recover() {
    if (getSimulationSettings().crashedColumn === status) {
      updateSimulationSettings({ crashedColumn: null })
    }
    void queryClient.invalidateQueries({ queryKey: issueKeys.all })
  }

  return (
    <ErrorBoundary
      onReset={recover}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <section
          aria-label={`${label} column`}
          className={cn(columnFrameClassName, 'gap-3 border-dashed p-3')}
        >
          <ErrorPanel
            title={`${label} couldn’t be displayed`}
            error={error}
            onRetry={resetErrorBoundary}
          />
          <p className="text-xs text-fg-muted">The rest of the board keeps working.</p>
        </section>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
