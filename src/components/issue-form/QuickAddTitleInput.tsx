import { useFormStatus } from 'react-dom'

import { cn } from '@/lib/cn'
import { TITLE_MAX_LENGTH } from '@/lib/issueForm'

type QuickAddTitleInputProps = {
  id: string
  defaultValue: string
  errorId: string | undefined
}

const titleInputClassName = cn(
  'h-8 w-full min-w-0 rounded-md border border-border-strong bg-surface px-2.5 text-sm text-fg',
  'placeholder:text-fg-subtle read-only:bg-surface-muted read-only:text-fg-muted hover:border-fg-subtle',
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus',
  'aria-invalid:border-danger aria-invalid:hover:border-danger',
)

function focusOnMount(input: HTMLInputElement | null) {
  input?.focus()
}

export function QuickAddTitleInput({ id, defaultValue, errorId }: QuickAddTitleInputProps) {
  const { pending } = useFormStatus()

  return (
    <input
      ref={focusOnMount}
      id={id}
      name="title"
      type="text"
      autoComplete="off"
      placeholder="What needs to be done?"
      maxLength={TITLE_MAX_LENGTH}
      defaultValue={defaultValue}
      readOnly={pending}
      aria-required="true"
      aria-invalid={errorId === undefined ? undefined : true}
      aria-describedby={errorId}
      className={titleInputClassName}
    />
  )
}
