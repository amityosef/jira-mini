import { type ReactNode, useState } from 'react'

import { type Toast, type ToastApi, ToastContext, type ToastInput } from '@/context/toast'

import { Toaster } from '@/components/feedback/Toaster'

const MAX_VISIBLE_TOASTS = 4

type ToastProviderProps = { children: ReactNode }

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function notify(toast: ToastInput) {
    const id = crypto.randomUUID()
    setToasts((current) =>
      [...current.filter((existing) => existing.message !== toast.message), { ...toast, id }].slice(
        -MAX_VISIBLE_TOASTS,
      ),
    )
  }

  function dismiss(toastId: string) {
    setToasts((current) => current.filter((toast) => toast.id !== toastId))
  }

  const api: ToastApi = { notify, dismiss }

  return (
    <ToastContext value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  )
}
