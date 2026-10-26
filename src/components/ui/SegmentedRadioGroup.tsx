import { useId } from 'react'

import { cn } from '@/lib/cn'

import type { LucideIcon } from 'lucide-react'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  icon: LucideIcon
}

type SegmentedRadioGroupProps<T extends string> = {
  legend: string
  value: T
  options: readonly SegmentedOption<T>[]
  onChange: (value: T) => void
}

const segmentClassName = cn(
  'flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-fg-muted',
  'hover:text-fg has-checked:bg-surface has-checked:text-fg has-checked:shadow-sm',
  'has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-focus',
)

export function SegmentedRadioGroup<T extends string>({
  legend,
  value,
  options,
  onChange,
}: SegmentedRadioGroupProps<T>) {
  const name = useId()

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-medium text-fg-muted">{legend}</legend>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-muted p-1">
        {options.map((option) => {
          const Icon = option.icon
          return (
            <label key={option.value} className={segmentClassName}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => {
                  onChange(option.value)
                }}
                className="sr-only"
              />
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{option.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
