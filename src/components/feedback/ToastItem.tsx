import { useEffect } from 'react'
import { CircleAlert, CircleCheck, Info, type LucideIcon, X } from 'lucide-react'

import type { Toast, ToastTone } from '@/context/toast'
import { cn } from '@/lib/cn'

import { Button } from '@/components/ui/Button'

const AUTO_DISMISS_MS = 5000

const TONE_ICONS = {
  success: CircleCheck,
  info: Info,
  error: CircleAlert,
} as const satisfies Record<ToastTone, LucideIcon>

const toneClasses = {
  success: 'text-success-fg',
  info: 'text-accent-subtle-fg',
  error: 'text-danger-fg',
} as const satisfies Record<ToastTone, string>

type ToastItemProps = {
  toast: Toast
  isPaused: boolean
  onDismiss: (toastId: string) => void
}

export function ToastItem({ toast, isPaused, onDismiss }: ToastItemProps) {
  const Icon = TONE_ICONS[toast.tone]
  const isPersistent = toast.tone === 'error'

  useEffect(() => {
    if (isPaused || isPersistent) return
    const timer = window.setTimeout(() => {
      onDismiss(toast.id)
    }, AUTO_DISMISS_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [isPaused, isPersistent, onDismiss, toast.id])

  return (
    <div className="pointer-events-auto flex min-w-0 items-start gap-3 rounded-lg border border-border bg-surface p-3 text-sm text-fg shadow-lg motion-safe:transition motion-safe:starting:translate-y-2 motion-safe:starting:opacity-0">
      <Icon aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', toneClasses[toast.tone])} />
      <p className="min-w-0 flex-1 break-words">{toast.message}</p>
      {toast.action && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            toast.action?.onAction()
            onDismiss(toast.id)
          }}
        >
          {toast.action.label}
        </Button>
      )}
      <Button
        size="icon-sm"
        variant="ghost"
        className="-me-1"
        aria-label="Dismiss notification"
        onClick={() => {
          onDismiss(toast.id)
        }}
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
    </div>
  )
}
