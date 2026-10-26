import { type ReactNode, useEffect, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

import { WorkspaceContext, type WorkspaceContextValue } from '@/context/workspace'
import { readPreferences, writePreferences } from '@/lib/preferences'
import { workspaceQuery } from '@/lib/queries'

import type { Preferences } from '@/types'

type WorkspaceProviderProps = { children: ReactNode }

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { data } = useSuspenseQuery(workspaceQuery())
  const [preferences, setPreferences] = useState(readPreferences)

  useEffect(() => {
    document.documentElement.dir = preferences.direction
  }, [preferences.direction])

  function updatePreferences(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch }
    setPreferences(next)
    writePreferences(next)
  }

  const membersById = new Map(data.members.map((member) => [member.id, member]))
  const value: WorkspaceContextValue = {
    ...data,
    membersById,
    activeSprint: data.sprints.find((sprint) => sprint.state === 'active') ?? null,
    currentUser: membersById.get(data.workspace.currentUserId) ?? null,
    preferences,
    updatePreferences,
  }

  return <WorkspaceContext value={value}>{children}</WorkspaceContext>
}
