import { CircleAlert } from 'lucide-react'

type FormErrorSummaryProps = {
  title: string
  message: string
}

export function FormErrorSummary({ title, message }: FormErrorSummaryProps) {
  return (
    <div
      role="alert"
      className="flex min-w-0 gap-2.5 rounded-lg border border-danger/25 bg-danger-subtle p-3 text-sm text-danger-fg"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 break-words">{message}</p>
      </div>
    </div>
  )
}
