import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/cn'

type SpinnerProps = { className?: string }

export function Spinner({ className }: SpinnerProps) {
  return (
    <LoaderCircle
      aria-hidden="true"
      className={cn('size-4 shrink-0 motion-safe:animate-spin', className)}
    />
  )
}
