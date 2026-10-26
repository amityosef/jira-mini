import { ErrorBoundary } from 'react-error-boundary'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'

import { ErrorPanel } from '@/components/ui/ErrorPanel'

import type { ReactNode } from 'react'

type AppErrorBoundaryProps = { children: ReactNode }

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <main className="grid min-h-dvh place-items-center p-6">
          <div className="flex w-full max-w-md flex-col gap-3">
            <h1 className="text-lg font-semibold text-fg">SprintFlow couldn’t start</h1>
            <ErrorPanel
              title="The workspace failed to load"
              error={error}
              onRetry={resetErrorBoundary}
            />
          </div>
        </main>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
