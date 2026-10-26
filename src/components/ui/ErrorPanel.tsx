import { CircleAlert, RotateCw } from 'lucide-react'

import { describeError } from '@/lib/apiError'
import { cn } from '@/lib/cn'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

type ErrorPanelProps = {
  title: string
  error: unknown
  onRetry?: (() => void) | undefined
  isRetrying?: boolean
  className?: string
}

export function ErrorPanel({
  title,
  error,
  onRetry,
  isRetrying = false,
  className,
}: ErrorPanelProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex min-w-0 flex-col items-start gap-3 rounded-lg border border-danger/25 bg-danger-subtle p-4 text-danger-fg',
        className,
      )}
    >
      <div className="flex min-w-0 gap-2.5">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm break-words">{describeError(error)}</p>
        </div>
      </div>
      {onRetry && (
        <Button size="sm" onClick={onRetry} aria-disabled={isRetrying || undefined}>
          {isRetrying ? <Spinner /> : <RotateCw aria-hidden="true" className="size-4" />}
          {isRetrying ? 'Retrying…' : 'Try again'}
        </Button>
      )}
    </div>
  )
}
