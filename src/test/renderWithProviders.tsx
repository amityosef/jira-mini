import { type ReactNode, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BoardProvider } from '@/components/providers/BoardProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { WorkspaceProvider } from '@/components/providers/WorkspaceProvider'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false },
    },
  })
}

export function renderWithProviders(ui: ReactNode, queryClient = createTestQueryClient()) {
  const user = userEvent.setup()
  const view = render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Suspense fallback={<p>Loading workspace…</p>}>
          <WorkspaceProvider>
            <BoardProvider>{ui}</BoardProvider>
          </WorkspaceProvider>
        </Suspense>
      </ToastProvider>
    </QueryClientProvider>,
  )
  return { ...view, user, queryClient }
}
