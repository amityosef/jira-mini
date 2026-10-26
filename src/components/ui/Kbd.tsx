import type { ReactNode } from 'react'

type KbdProps = { children: ReactNode }

export function Kbd({ children }: KbdProps) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface-muted px-1 font-sans text-xs font-medium text-fg-muted">
      {children}
    </kbd>
  )
}
