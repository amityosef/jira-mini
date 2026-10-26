import { useBoard } from '@/context/board'
import { assertNever } from '@/lib/assert'

import { BoardColumn } from '@/components/board/BoardColumn'
import { BoardSkeleton } from '@/components/board/BoardSkeleton'
import { ColumnErrorBoundary } from '@/components/board/ColumnErrorBoundary'
import { ErrorPanel } from '@/components/ui/ErrorPanel'

export function Board() {
  const { view, retry } = useBoard()

  switch (view.status) {
    case 'loading':
      return <BoardSkeleton />
    case 'error':
      return (
        <div className="px-4 sm:px-6">
          <ErrorPanel
            title="Couldn’t load the board"
            error={view.error}
            onRetry={retry}
            isRetrying={view.isRetrying}
            className="max-w-lg"
          />
        </div>
      )
    case 'ready':
      return (
        <div className="relative flex min-h-0 flex-1 snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 sm:scroll-px-6 sm:px-6">
          {view.columns.map((column) => (
            <ColumnErrorBoundary key={column.status} status={column.status}>
              <BoardColumn column={column} />
            </ColumnErrorBoundary>
          ))}
        </div>
      )
    default:
      return assertNever(view)
  }
}
