import { cn } from '@/lib/cn'

import type { ComponentProps } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'icon' | 'icon-sm'

export type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const focusRingClassName =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'

const baseClassName = cn(
  'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors select-none',
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-progress aria-disabled:opacity-70',
  'motion-reduce:transition-none',
  focusRingClassName,
)

const variantClasses = {
  primary: 'bg-accent text-accent-fg shadow-sm hover:bg-accent-hover active:bg-accent-hover',
  secondary:
    'border border-border-strong bg-surface text-fg shadow-sm hover:bg-surface-hover active:bg-surface-active',
  ghost: 'text-fg-muted hover:bg-surface-hover hover:text-fg active:bg-surface-active',
  danger: 'bg-danger text-accent-fg shadow-sm hover:bg-danger-hover active:bg-danger-hover',
} as const satisfies Record<ButtonVariant, string>

const sizeClasses = {
  sm: 'h-8 gap-1.5 px-2.5 text-sm',
  md: 'h-9 gap-2 px-3.5 text-sm',
  icon: 'size-8',
  'icon-sm': 'size-6',
} as const satisfies Record<ButtonSize, string>

export function Button({
  variant = 'secondary',
  size = 'md',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(baseClassName, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
}
