import { useId } from 'react'
import { X } from 'lucide-react'

import { useIssueResources } from '@/hooks/useIssueResources'
import { cn } from '@/lib/cn'
import { closeIssue } from '@/lib/navigation'

import { ActivityTimeline } from '@/components/issue/ActivityTimeline'
import { IssueDetails } from '@/components/issue/IssueDetails'
import { ActivitySkeleton, IssueDetailsSkeleton } from '@/components/issue/IssueDrawerSkeletons'
import { Button } from '@/components/ui/Button'
import { QueryBoundary } from '@/components/ui/QueryBoundary'
import { Spinner } from '@/components/ui/Spinner'

type IssueDrawerProps = { issueId: string }

const panelClassName = cn(
  'fixed inset-y-0 end-0 z-40 flex w-full flex-col border-s border-border bg-surface text-fg shadow-2xl sm:max-w-xl',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
  'motion-safe:transition motion-safe:duration-200 motion-safe:ease-out',
  'motion-safe:starting:translate-x-4 motion-safe:starting:opacity-0 rtl:motion-safe:starting:-translate-x-4',
)

function attachIssuePanel(panel: HTMLElement): () => void {
  const { ownerDocument } = panel
  const previouslyFocused = ownerDocument.activeElement
  panel.focus()

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || event.defaultPrevented) return
    event.preventDefault()
    closeIssue()
  }

  panel.addEventListener('keydown', handleKeyDown)
  return () => {
    panel.removeEventListener('keydown', handleKeyDown)
    const isFocusInside = panel.contains(ownerDocument.activeElement)
    if (
      isFocusInside &&
      previouslyFocused instanceof HTMLElement &&
      previouslyFocused.isConnected
    ) {
      previouslyFocused.focus()
    }
  }
}

export function IssueDrawer({ issueId }: IssueDrawerProps) {
  const { issuePromise, activityPromise, retryIssue, retryActivity, isRefreshing } =
    useIssueResources(issueId)
  const activityHeadingId = useId()

  return (
    <aside
      ref={attachIssuePanel}
      tabIndex={-1}
      aria-label={`Issue ${issueId}`}
      className={panelClassName}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <p className="min-w-0 truncate text-sm font-medium text-fg-muted">{issueId}</p>
        <div className="flex shrink-0 items-center gap-2">
          <p role="status" className="flex items-center gap-1.5 text-xs text-fg-muted">
            {isRefreshing && (
              <>
                <Spinner className="size-3.5" />
                Refreshing…
              </>
            )}
          </p>
          <Button variant="ghost" size="icon" aria-label="Close issue details" onClick={closeIssue}>
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-5 py-6">
        <QueryBoundary
          resource={issuePromise}
          errorTitle="Couldn’t load this issue"
          onRetry={retryIssue}
          isRetrying={isRefreshing}
          loadingFallback={<IssueDetailsSkeleton />}
        >
          <IssueDetails issuePromise={issuePromise} />
        </QueryBoundary>
        <section
          aria-labelledby={activityHeadingId}
          className="flex flex-col gap-4 border-t border-border pt-6"
        >
          <h3 id={activityHeadingId} className="text-sm font-semibold text-fg">
            Activity
          </h3>
          <QueryBoundary
            resource={activityPromise}
            errorTitle="Couldn’t load activity"
            onRetry={retryActivity}
            isRetrying={isRefreshing}
            loadingFallback={<ActivitySkeleton />}
          >
            <ActivityTimeline activityPromise={activityPromise} />
          </QueryBoundary>
        </section>
      </div>
    </aside>
  )
}
