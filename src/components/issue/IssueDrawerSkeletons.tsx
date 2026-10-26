import { cn } from '@/lib/cn'

import { Skeleton } from '@/components/ui/Skeleton'

const PROPERTY_PLACEHOLDERS = ['priority', 'points', 'assignee', 'sprint', 'labels', 'created']
const ACTIVITY_PLACEHOLDERS = ['latest', 'earlier', 'earliest']
const descriptionLineClasses = ['w-full', 'w-11/12', 'w-2/3']

export function IssueDetailsSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Loading issue details…</span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-4/5" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {PROPERTY_PLACEHOLDERS.map((placeholder) => (
          <div key={placeholder} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        {descriptionLineClasses.map((width) => (
          <Skeleton key={width} className={cn('h-4', width)} />
        ))}
      </div>
    </div>
  )
}

export function ActivitySkeleton() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <span className="sr-only">Loading activity…</span>
      {ACTIVITY_PLACEHOLDERS.map((placeholder) => (
        <div key={placeholder} className="flex gap-3">
          <div
            aria-hidden="true"
            className="size-6 shrink-0 rounded-full bg-surface-active motion-safe:animate-pulse"
          />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
