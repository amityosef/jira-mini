import { ArrowRightLeft, CalendarDays, Inbox, Plus, Rows2, Rows3 } from 'lucide-react'

import { assertNever } from '@/lib/assert'
import type { PaletteCommand } from '@/lib/commands'
import { STATUS_LABELS } from '@/lib/workflow'

import { StatusIcon } from '@/components/ui/IssueIcons'

import type { ReactNode } from 'react'

type CommandOptionProps = {
  id: string
  command: PaletteCommand
  isActive: boolean
}

const iconClassName = 'size-4 shrink-0 text-fg-muted'

function OptionLabel({ children }: { children: string }) {
  return (
    <span className="min-w-0 flex-1 truncate" title={children}>
      {children}
    </span>
  )
}

function OptionHint({ children }: { children: ReactNode }) {
  return <span className="hidden shrink-0 text-xs text-fg-subtle sm:inline">{children}</span>
}

function CommandContent({ command }: { command: PaletteCommand }) {
  switch (command.kind) {
    case 'open-issue':
      return (
        <>
          <StatusIcon status={command.issue.status} />
          <span className="shrink-0 text-xs font-medium text-fg-muted tabular-nums">
            {command.issue.id}
          </span>
          <OptionLabel>{command.issue.title}</OptionLabel>
          <OptionHint>{STATUS_LABELS[command.issue.status]}</OptionHint>
        </>
      )
    case 'set-status':
      return (
        <>
          <StatusIcon status={command.status} />
          <OptionLabel>{command.label}</OptionLabel>
        </>
      )
    case 'switch-scope':
      return (
        <>
          {command.scope.kind === 'backlog' ? (
            <Inbox aria-hidden="true" className={iconClassName} />
          ) : (
            <CalendarDays aria-hidden="true" className={iconClassName} />
          )}
          <span className="shrink-0 font-medium">{command.label}</span>
          <span className="min-w-0 flex-1 truncate text-fg-muted" title={command.description}>
            {command.description}
          </span>
          <OptionHint>{command.hint}</OptionHint>
        </>
      )
    case 'create-issue':
      return (
        <>
          <Plus aria-hidden="true" className={iconClassName} />
          <OptionLabel>{command.label}</OptionLabel>
        </>
      )
    case 'set-direction':
      return (
        <>
          <ArrowRightLeft aria-hidden="true" className={iconClassName} />
          <OptionLabel>{command.label}</OptionLabel>
        </>
      )
    case 'set-density':
      return (
        <>
          {command.density === 'compact' ? (
            <Rows3 aria-hidden="true" className={iconClassName} />
          ) : (
            <Rows2 aria-hidden="true" className={iconClassName} />
          )}
          <OptionLabel>{command.label}</OptionLabel>
        </>
      )
    default:
      return assertNever(command)
  }
}

export function CommandOption({ id, command, isActive }: CommandOptionProps) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={isActive}
      data-command-id={command.id}
      className="flex min-w-0 cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm text-fg aria-selected:bg-accent-subtle aria-selected:text-accent-subtle-fg"
    >
      <CommandContent command={command} />
    </div>
  )
}
