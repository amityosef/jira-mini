import { type ComponentProps, type ReactNode, useId } from 'react'

import { cn } from '@/lib/cn'

type FieldChrome = {
  label: string
  error?: string | undefined
  hint?: string | undefined
}

const controlClassName = cn(
  'w-full min-w-0 rounded-md border border-border-strong bg-surface text-sm text-fg shadow-sm',
  'placeholder:text-fg-subtle hover:border-fg-subtle disabled:opacity-50',
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus',
  'aria-invalid:border-danger aria-invalid:hover:border-danger',
)

function useFieldWiring(error: string | undefined, hint: string | undefined) {
  const controlId = useId()
  const errorId = `${controlId}-error`
  const hintId = `${controlId}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')
  return {
    controlId,
    errorId,
    hintId,
    controlProps: {
      id: controlId,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy || undefined,
    },
  }
}

type FieldFrameProps = FieldChrome & {
  controlId: string
  errorId: string
  hintId: string
  className?: string | undefined
  children: ReactNode
}

const editableClassName = 'read-only:bg-surface-muted read-only:text-fg-muted'

function FieldFrame({
  label,
  error,
  hint,
  controlId,
  errorId,
  hintId,
  className,
  children,
}: FieldFrameProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={controlId} className="text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm break-words text-danger-fg">
          {error}
        </p>
      )}
    </div>
  )
}

export function TextField({
  label,
  error,
  hint,
  className,
  ...props
}: ComponentProps<'input'> & FieldChrome) {
  const { controlProps, ...wiring } = useFieldWiring(error, hint)
  return (
    <FieldFrame label={label} error={error} hint={hint} className={className} {...wiring}>
      <input
        {...props}
        {...controlProps}
        className={cn(controlClassName, editableClassName, 'h-9 px-3')}
      />
    </FieldFrame>
  )
}

export function TextAreaField({
  label,
  error,
  hint,
  className,
  ...props
}: ComponentProps<'textarea'> & FieldChrome) {
  const { controlProps, ...wiring } = useFieldWiring(error, hint)
  return (
    <FieldFrame label={label} error={error} hint={hint} className={className} {...wiring}>
      <textarea
        {...props}
        {...controlProps}
        className={cn(controlClassName, editableClassName, 'min-h-24 resize-y px-3 py-2')}
      />
    </FieldFrame>
  )
}

export function SelectField({
  label,
  error,
  hint,
  className,
  children,
  ...props
}: ComponentProps<'select'> & FieldChrome) {
  const { controlProps, ...wiring } = useFieldWiring(error, hint)
  return (
    <FieldFrame label={label} error={error} hint={hint} className={className} {...wiring}>
      <select
        {...props}
        {...controlProps}
        className={cn(controlClassName, 'h-9 cursor-pointer px-2.5')}
      >
        {children}
      </select>
    </FieldFrame>
  )
}
