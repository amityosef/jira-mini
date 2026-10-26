import { Kbd } from '@/components/ui/Kbd'

import type { ReactNode } from 'react'

type KeyHintProps = {
  symbol: string
  spokenKey: string
  children: ReactNode
}

function KeyHint({ symbol, spokenKey, children }: KeyHintProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Kbd>
        <span aria-hidden="true">{symbol}</span>
        <span className="sr-only">{spokenKey}</span>
      </Kbd>
      {children}
    </span>
  )
}

export function PaletteFooter() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-xs text-fg-muted">
      <KeyHint symbol="↑↓" spokenKey="Up or down arrow">
        to navigate
      </KeyHint>
      <KeyHint symbol="↵" spokenKey="Enter">
        to select
      </KeyHint>
      <KeyHint symbol="esc" spokenKey="Escape">
        to close
      </KeyHint>
    </div>
  )
}
