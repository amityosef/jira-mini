import { useState } from 'react'

import type { Toast } from '@/context/toast'

import { ToastItem } from '@/components/feedback/ToastItem'

type ToasterProps = {
  toasts: Toast[]
  onDismiss: (toastId: string) => void
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  const [isPaused, setIsPaused] = useState(false)
  const politeToasts = toasts.filter((toast) => toast.tone !== 'error')
  const urgentToasts = toasts.filter((toast) => toast.tone === 'error')

  const pauseWhileInteracting = (region: HTMLElement) => {
    const pause = () => {
      setIsPaused(true)
    }
    const resume = (event: PointerEvent | FocusEvent) => {
      const isMovingWithin =
        event.relatedTarget instanceof Node && region.contains(event.relatedTarget)
      if (!isMovingWithin) setIsPaused(false)
    }
    region.addEventListener('pointerenter', pause)
    region.addEventListener('pointerleave', resume)
    region.addEventListener('focusin', pause)
    region.addEventListener('focusout', resume)
    return () => {
      region.removeEventListener('pointerenter', pause)
      region.removeEventListener('pointerleave', resume)
      region.removeEventListener('focusin', pause)
      region.removeEventListener('focusout', resume)
    }
  }

  return (
    <section
      ref={pauseWhileInteracting}
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:start-auto sm:end-4 sm:w-96"
    >
      <div role="alert" className="flex flex-col gap-2">
        {urgentToasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} isPaused={isPaused} onDismiss={onDismiss} />
        ))}
      </div>
      <div role="status" aria-live="polite" className="flex flex-col gap-2">
        {politeToasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} isPaused={isPaused} onDismiss={onDismiss} />
        ))}
      </div>
    </section>
  )
}
