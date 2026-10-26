import { createContext, use } from 'react'

import type { Preferences, Sprint, TeamMember, Workspace } from '@/types'

export type WorkspaceContextValue = {
  workspace: Workspace
  members: TeamMember[]
  membersById: ReadonlyMap<string, TeamMember>
  sprints: Sprint[]
  activeSprint: Sprint | null
  currentUser: TeamMember | null
  preferences: Preferences
  updatePreferences: (patch: Partial<Preferences>) => void
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace(): WorkspaceContextValue {
  const workspace = use(WorkspaceContext)
  if (!workspace) throw new Error('useWorkspace must be called inside <WorkspaceProvider>.')
  return workspace
}
