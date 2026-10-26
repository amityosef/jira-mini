import { UserRound } from 'lucide-react'

import { cn } from '@/lib/cn'

import type { AvatarTone, TeamMember } from '@/types'

type AvatarSize = 'sm' | 'md'

type AvatarProps = {
  member: TeamMember | null
  size?: AvatarSize
}

const toneClasses = {
  sky: 'bg-sky-700',
  violet: 'bg-violet-700',
  emerald: 'bg-emerald-700',
  amber: 'bg-amber-700',
  rose: 'bg-rose-700',
  indigo: 'bg-indigo-700',
  teal: 'bg-teal-700',
} as const satisfies Record<AvatarTone, string>

const sizeClasses = {
  sm: 'size-6 text-xs',
  md: 'size-8 text-sm',
} as const satisfies Record<AvatarSize, string>

export function Avatar({ member, size = 'sm' }: AvatarProps) {
  if (!member) {
    return (
      <span
        role="img"
        aria-label="Unassigned"
        title="Unassigned"
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong text-fg-subtle',
          sizeClasses[size],
        )}
      >
        <UserRound aria-hidden="true" className="size-3.5" />
      </span>
    )
  }

  return (
    <span
      role="img"
      aria-label={`Assigned to ${member.name}`}
      title={member.name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        toneClasses[member.avatarTone],
        sizeClasses[size],
      )}
    >
      {member.initials}
    </span>
  )
}
