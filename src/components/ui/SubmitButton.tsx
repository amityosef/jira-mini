import { useFormStatus } from 'react-dom'

import { Button, type ButtonProps } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

type SubmitButtonProps = Omit<ButtonProps, 'type'> & {
  pendingLabel: string
}

export function SubmitButton({
  children,
  pendingLabel,
  onClick,
  variant = 'primary',
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      type="submit"
      variant={variant}
      aria-disabled={pending || undefined}
      onClick={(event) => {
        if (pending) event.preventDefault()
        onClick?.(event)
      }}
    >
      {pending ? (
        <>
          <Spinner />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
