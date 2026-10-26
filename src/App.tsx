import { Suspense, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createQueryClient } from '@/lib/queryClient'

import { AppErrorBoundary } from '@/components/layout/AppErrorBoundary'
import { AppSkeleton } from '@/components/layout/AppSkeleton'
import { SprintWorkspace } from '@/components/layout/SprintWorkspace'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { WorkspaceProvider } from '@/components/providers/WorkspaceProvider'

export function App() {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppErrorBoundary>
          <Suspense fallback={<AppSkeleton />}>
            <WorkspaceProvider>
              <SprintWorkspace />
            </WorkspaceProvider>
          </Suspense>
        </AppErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  )
}
