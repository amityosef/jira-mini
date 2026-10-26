import { columnFrameClassName } from '@/components/board/BoardColumn'
import { Skeleton } from '@/components/ui/Skeleton'

import { ISSUE_STATUSES } from '@/types'

const CARDS_PER_COLUMN = [3, 4, 3, 2, 3] as const

export function BoardSkeleton() {
  return (
    <div role="status" className="flex min-h-0 flex-1 gap-3 overflow-hidden px-4 pb-4 sm:px-6">
      <span className="sr-only">Loading board…</span>
      {ISSUE_STATUSES.map((status, columnIndex) => (
        <div key={status} aria-hidden="true" className={columnFrameClassName}>
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ms-auto h-4 w-10" />
          </div>
          <div className="flex flex-col gap-2 px-2 pb-2">
            {Array.from({ length: CARDS_PER_COLUMN[columnIndex] ?? 2 }, (_, cardIndex) => (
              <div
                key={cardIndex}
                className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <Skeleton className="ms-auto size-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
