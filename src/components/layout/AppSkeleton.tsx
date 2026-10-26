import { BoardSkeleton } from '@/components/board/BoardSkeleton'
import { Skeleton } from '@/components/ui/Skeleton'

export function AppSkeleton() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5 sm:px-6"
      >
        <Skeleton className="size-6" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="ms-auto h-8 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div aria-hidden="true" className="flex flex-col gap-2 px-4 pt-5 pb-4 sm:px-6">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <BoardSkeleton />
    </div>
  )
}
