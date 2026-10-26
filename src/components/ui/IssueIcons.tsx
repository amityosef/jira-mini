import {
  Bug,
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleEllipsis,
  type LucideIcon,
  Minus,
  OctagonAlert,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Sparkles,
  Wrench,
} from 'lucide-react'

import { cn } from '@/lib/cn'

import type { IssuePriority, IssueStatus, IssueType } from '@/types'

type IconProps = { className?: string }

const STATUS_ICONS = {
  backlog: CircleDashed,
  todo: Circle,
  in_progress: CircleDot,
  in_review: CircleEllipsis,
  done: CircleCheck,
} as const satisfies Record<IssueStatus, LucideIcon>

const statusColorClasses = {
  backlog: 'text-status-backlog',
  todo: 'text-status-todo',
  in_progress: 'text-status-in-progress',
  in_review: 'text-status-in-review',
  done: 'text-status-done',
} as const satisfies Record<IssueStatus, string>

const PRIORITY_ICONS = {
  urgent: OctagonAlert,
  high: SignalHigh,
  medium: SignalMedium,
  low: SignalLow,
  none: Minus,
} as const satisfies Record<IssuePriority, LucideIcon>

const priorityColorClasses = {
  urgent: 'text-priority-urgent',
  high: 'text-priority-high',
  medium: 'text-priority-medium',
  low: 'text-priority-low',
  none: 'text-priority-none',
} as const satisfies Record<IssuePriority, string>

const TYPE_ICONS = {
  feature: Sparkles,
  bug: Bug,
  chore: Wrench,
} as const satisfies Record<IssueType, LucideIcon>

export function StatusIcon({ status, className }: IconProps & { status: IssueStatus }) {
  const Icon = STATUS_ICONS[status]
  return (
    <Icon
      aria-hidden="true"
      className={cn('size-4 shrink-0', statusColorClasses[status], className)}
    />
  )
}

export function PriorityIcon({ priority, className }: IconProps & { priority: IssuePriority }) {
  const Icon = PRIORITY_ICONS[priority]
  return (
    <Icon
      aria-hidden="true"
      className={cn('size-4 shrink-0', priorityColorClasses[priority], className)}
    />
  )
}

export function TypeIcon({ type, className }: IconProps & { type: IssueType }) {
  const Icon = TYPE_ICONS[type]
  return <Icon aria-hidden="true" className={cn('size-4 shrink-0 text-fg-muted', className)} />
}
