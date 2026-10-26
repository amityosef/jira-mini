import { type ReactNode, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { ErrorPanel } from '@/components/ui/ErrorPanel'

type QueryBoundaryProps = {
  children: ReactNode
  loadingFallback: ReactNode
  errorTitle: string
  resource: Promise<unknown>
  onRetry: () => void
  isRetrying?: boolean
}

export function QueryBoundary({
  children,
  loadingFallback,
  errorTitle,
  resource,
  onRetry,
  isRetrying = false,
}: QueryBoundaryProps) {
  return (
    <ErrorBoundary
      resetKeys={[resource]}
      fallbackRender={({ error }) => (
        <ErrorPanel title={errorTitle} error={error} onRetry={onRetry} isRetrying={isRetrying} />
      )}
    >
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}
