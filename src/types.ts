export const ISSUE_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done'] as const
export type IssueStatus = (typeof ISSUE_STATUSES)[number]

export const ISSUE_PRIORITIES = ['urgent', 'high', 'medium', 'low', 'none'] as const
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number]

export const ISSUE_TYPES = ['feature', 'bug', 'chore'] as const
export type IssueType = (typeof ISSUE_TYPES)[number]

export const STORY_POINTS = [0, 1, 2, 3, 5, 8, 13] as const
export type StoryPoints = (typeof STORY_POINTS)[number]

export const SPRINT_STATES = ['completed', 'active', 'planned'] as const
export type SprintState = (typeof SPRINT_STATES)[number]

export const AVATAR_TONES = ['sky', 'violet', 'emerald', 'amber', 'rose', 'indigo', 'teal'] as const
export type AvatarTone = (typeof AVATAR_TONES)[number]

export type Issue = {
  id: string
  title: string
  description: string
  status: IssueStatus
  priority: IssuePriority
  type: IssueType
  points: StoryPoints
  assigneeId: string | null
  sprintId: string | null
  labels: string[]
  createdAt: string
  updatedAt: string
}

export type Sprint = {
  id: string
  name: string
  goal: string
  startDate: string
  endDate: string
  state: SprintState
}

export type TeamMember = {
  id: string
  name: string
  initials: string
  role: string
  avatarTone: AvatarTone
}

export type Workspace = {
  id: string
  name: string
  teamName: string
  issuePrefix: string
  currentUserId: string
}

export type WorkspaceSnapshot = {
  workspace: Workspace
  members: TeamMember[]
  sprints: Sprint[]
}

type ActivityEnvelope = {
  id: string
  issueId: string
  actorId: string
  occurredAt: string
}

export type ActivityEvent =
  | (ActivityEnvelope & { kind: 'created' })
  | (ActivityEnvelope & { kind: 'status_changed'; from: IssueStatus; to: IssueStatus })
  | (ActivityEnvelope & { kind: 'commented'; body: string })
  | (ActivityEnvelope & { kind: 'assigned'; assigneeId: string | null })

export type SprintMetrics = {
  sprintId: string
  totalPoints: number
  completedPoints: number
  totalIssues: number
  completedIssues: number
  daysTotal: number
  daysElapsed: number
  daysRemaining: number
  pointsByStatus: Record<IssueStatus, number>
}

export type BoardScope = { kind: 'sprint'; sprintId: string } | { kind: 'backlog' }

export type CreateIssueInput = {
  title: string
  description: string
  status: IssueStatus
  priority: IssuePriority
  type: IssueType
  points: StoryPoints
  assigneeId: string | null
  sprintId: string | null
  labels: string[]
}

export type IssueSyncState = 'synced' | 'creating' | 'moving'

export type BoardIssue = Issue & { syncState: IssueSyncState }

export type BoardColumn = {
  status: IssueStatus
  issues: BoardIssue[]
  totalPoints: number
  wipLimit: number | null
}

export type ApiFailure =
  | { code: 'network'; message: string }
  | { code: 'not-found'; message: string; resource: 'issue' | 'sprint'; id: string }
  | { code: 'wip-limit'; message: string; status: IssueStatus; limit: number }
  | { code: 'duplicate-title'; message: string; title: string }

export type LayoutDirection = 'ltr' | 'rtl'

export type CardDensity = 'comfortable' | 'compact'

export type Preferences = {
  direction: LayoutDirection
  density: CardDensity
}
