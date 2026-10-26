import { createPortal } from 'react-dom'

import { cn } from '@/lib/cn'
import { showModalWhileMounted } from '@/lib/dialog'

import type { ComponentProps } from 'react'

type ModalPlacement = 'center' | 'top'
type ModalWidth = 'md' | 'lg'

type ModalDialogProps = Omit<
  ComponentProps<'dialog'>,
  'ref' | 'open' | 'onClose' | 'onCancel' | 'className'
> & {
  onClose: () => void
  placement?: ModalPlacement
  width?: ModalWidth
}

const dialogClassName = cn(
  'w-full rounded-xl border border-border bg-surface p-0 text-fg shadow-2xl',
  'backdrop:bg-zinc-950/50 backdrop:backdrop-blur-xs',
  'motion-safe:transition motion-safe:duration-150 motion-safe:ease-out',
  'motion-safe:starting:translate-y-2 motion-safe:starting:opacity-0',
)

const placementClasses = {
  center: 'm-auto',
  top: 'mx-auto mt-20 mb-auto',
} as const satisfies Record<ModalPlacement, string>

const widthClasses = {
  md: 'max-w-lg',
  lg: 'max-w-xl',
} as const satisfies Record<ModalWidth, string>

export function ModalDialog({
  onClose,
  placement = 'center',
  width = 'md',
  children,
  ...props
}: ModalDialogProps) {
  return createPortal(
    <dialog
      {...props}
      ref={showModalWhileMounted}
      onClose={(event) => {
        if (!event.currentTarget.open) onClose()
      }}
      className={cn(dialogClassName, placementClasses[placement], widthClasses[width])}
    >
      {children}
    </dialog>,
    document.body,
  )
}
