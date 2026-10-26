import { createContext, use } from 'react'

export type ToastTone = 'success' | 'info' | 'error'

export type ToastAction = {
  label: string
  onAction: () => void
}

export type ToastInput = {
  tone: ToastTone
  message: string
  action?: ToastAction | undefined
}

export type Toast = ToastInput & { id: string }

export type ToastApi = {
  notify: (toast: ToastInput) => void
  dismiss: (toastId: string) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const toasts = use(ToastContext)
  if (!toasts) throw new Error('useToast must be called inside <ToastProvider>.')
  return toasts
}
