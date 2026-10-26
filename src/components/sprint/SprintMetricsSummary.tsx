import { useQuery, useQueryClient } from '@tanstack/react-query'

import { formatCount, formatPercent } from '@/lib/format'
import { sprintMetricsKeys, sprintMetricsQuery } from '@/lib/queries'

import { ErrorPanel } from '@/components/ui/ErrorPanel'
import { Skeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'

type SprintMetricsSummaryProps = { sprintId: string }

export function SprintMetricsSummary({ sprintId }: SprintMetricsSummaryProps) {
  const queryClient = useQueryClient()
  const metrics = useQuery(sprintMetricsQuery(sprintId))

  function retry() {
    void queryClient.invalidateQueries({ queryKey: sprintMetricsKeys.detail(sprintId) })
  }

  if (metrics.data === undefined) {
    return metrics.status === 'error' ? (
      <ErrorPanel
        title="Sprint progress is unavailable"
        error={metrics.error}
        onRetry={retry}
        isRetrying={metrics.isFetching}
        className="w-full sm:w-80"
      />
    ) : (
      <div role="status" className="flex w-full flex-col gap-2 sm:w-80">
        <span className="sr-only">Loading sprint progress…</span>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    )
  }

  const { completedPoints, totalPoints, completedIssues, totalIssues, daysRemaining } = metrics.data

  return (
    <section aria-label="Sprint progress" className="flex w-full flex-col gap-1.5 sm:w-80">
      <p className="flex items-baseline gap-2 text-sm text-fg">
        <span className="font-semibold tabular-nums">{`${completedPoints} / ${totalPoints} points`}</span>
        <span className="text-fg-muted">{formatPercent(completedPoints, totalPoints)}</span>
        {metrics.isFetching && (
          <span
            role="status"
            className="ms-auto inline-flex items-center gap-1 text-xs text-fg-subtle"
          >
            <Spinner className="size-3" />
            Updating
          </span>
        )}
      </p>
      <progress
        value={completedPoints}
        max={Math.max(totalPoints, 1)}
        aria-label="Completed story points"
        className="h-2 w-full appearance-none overflow-hidden rounded-full bg-surface-active progress-track:bg-surface-active progress-value:rounded-full progress-value:bg-accent"
      />
      <p className="text-xs text-fg-muted">
        {`${completedIssues} of ${formatCount(totalIssues, 'issue')} done · ${formatCount(daysRemaining, 'day')} left`}
      </p>
    </section>
  )
}
