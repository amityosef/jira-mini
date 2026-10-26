import { isInScope, STATUS_LABELS } from '@/lib/workflow'

import { ISSUE_STATUSES } from '@/types'
import type {
  BoardScope,
  CardDensity,
  Issue,
  IssueStatus,
  LayoutDirection,
  Preferences,
  Sprint,
} from '@/types'

export type PaletteCommand =
  | { kind: 'open-issue'; id: string; label: string; issue: Issue }
  | { kind: 'set-status'; id: string; label: string; issue: Issue; status: IssueStatus }
  | {
      kind: 'switch-scope'
      id: string
      label: string
      scope: BoardScope
      description: string
      hint: string
    }
  | { kind: 'create-issue'; id: string; label: string }
  | { kind: 'set-direction'; id: string; label: string; direction: LayoutDirection }
  | { kind: 'set-density'; id: string; label: string; density: CardDensity }

export type PaletteSection = {
  id: string
  title: string
  commands: PaletteCommand[]
}

export type PaletteSource = {
  query: string
  issues: readonly Issue[]
  sprints: readonly Sprint[]
  scope: BoardScope
  contextIssue: Issue | null
  preferences: Preferences
}

type Candidate = { command: PaletteCommand; searchText: string }

type ScopeEntry = {
  scope: BoardScope
  label: string
  description: string
  hint: string
  searchText: string
}

export const MAX_ISSUE_RESULTS = 8
export const RECENT_ISSUE_COUNT = 6

export const MATCH_RANK = {
  none: 0,
  substring: 1,
  wordPrefix: 2,
  idPrefix: 3,
  exactId: 4,
} as const

const WORD_CHARACTER = /[\p{L}\p{N}]/u

export function toSearchTerms(query: string): string[] {
  return query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
}

function startsAtWordBoundary(text: string, term: string): boolean {
  for (let index = text.indexOf(term); index !== -1; index = text.indexOf(term, index + 1)) {
    if (index === 0 || !WORD_CHARACTER.test(text.charAt(index - 1))) return true
  }
  return false
}

function termRank(term: string, issue: Issue): number {
  const id = issue.id.toLocaleLowerCase()
  const idNumber = id.slice(id.lastIndexOf('-') + 1)
  if (term === id || term === idNumber) return MATCH_RANK.exactId
  if (id.startsWith(term) || idNumber.startsWith(term)) return MATCH_RANK.idPrefix
  const title = issue.title.toLocaleLowerCase()
  const labels = issue.labels.map((label) => label.toLocaleLowerCase())
  if (startsAtWordBoundary(title, term) || labels.some((label) => label.startsWith(term))) {
    return MATCH_RANK.wordPrefix
  }
  const isSubstring =
    id.includes(term) || title.includes(term) || labels.some((label) => label.includes(term))
  return isSubstring ? MATCH_RANK.substring : MATCH_RANK.none
}

export function issueMatchRank(query: string, issue: Issue): number {
  const terms = toSearchTerms(query)
  if (terms.length === 0) return MATCH_RANK.none
  return Math.min(...terms.map((term) => termRank(term, issue)))
}

function byMostRecentlyUpdated(first: Issue, second: Issue): number {
  return (
    Date.parse(second.updatedAt) - Date.parse(first.updatedAt) || first.id.localeCompare(second.id)
  )
}

export function searchIssues(query: string, issues: readonly Issue[]): Issue[] {
  return issues
    .map((issue) => ({ issue, rank: issueMatchRank(query, issue) }))
    .filter(({ rank }) => rank > MATCH_RANK.none)
    .toSorted(
      (first, second) =>
        second.rank - first.rank || byMostRecentlyUpdated(first.issue, second.issue),
    )
    .slice(0, MAX_ISSUE_RESULTS)
    .map(({ issue }) => issue)
}

function recentIssues(issues: readonly Issue[], scope: BoardScope): Issue[] {
  return issues
    .filter((issue) => isInScope(issue, scope))
    .toSorted(byMostRecentlyUpdated)
    .slice(0, RECENT_ISSUE_COUNT)
}

function keepMatching(
  candidates: readonly Candidate[],
  terms: readonly string[],
): PaletteCommand[] {
  return candidates
    .filter(({ command, searchText }) => {
      const haystack = `${command.label} ${searchText}`.toLocaleLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
    .map(({ command }) => command)
}

function contextCandidates(issue: Issue): Candidate[] {
  return ISSUE_STATUSES.filter((status) => status !== issue.status).map((status): Candidate => {
    const label = `Move ${issue.id} to ${STATUS_LABELS[status]}`
    return {
      command: { kind: 'set-status', id: `set-status:${issue.id}:${status}`, label, issue, status },
      searchText: `${label} change status`,
    }
  })
}

function isSameScope(first: BoardScope, second: BoardScope): boolean {
  if (first.kind === 'backlog' || second.kind === 'backlog') return first.kind === second.kind
  return first.sprintId === second.sprintId
}

function scopeEntries(sprints: readonly Sprint[]): ScopeEntry[] {
  const upcoming = sprints
    .filter((sprint) => sprint.state !== 'completed')
    .toSorted(
      (first, second) =>
        Number(second.state === 'active') - Number(first.state === 'active') ||
        Date.parse(first.startDate) - Date.parse(second.startDate),
    )
  const sprintEntries = upcoming.map((sprint): ScopeEntry => {
    const hint = sprint.state === 'active' ? 'Active sprint' : 'Planned'
    return {
      scope: { kind: 'sprint', sprintId: sprint.id },
      label: sprint.name,
      description: sprint.goal,
      hint,
      searchText: `go to sprint ${sprint.name} ${sprint.goal} ${hint}`,
    }
  })
  const backlogEntry: ScopeEntry = {
    scope: { kind: 'backlog' },
    label: 'Team backlog',
    description: 'Issues that are not planned into a sprint',
    hint: 'Unscheduled',
    searchText: 'go to team backlog unscheduled unplanned',
  }
  return [...sprintEntries, backlogEntry]
}

function scopeCandidates(sprints: readonly Sprint[], current: BoardScope): Candidate[] {
  return scopeEntries(sprints)
    .filter((entry) => !isSameScope(entry.scope, current))
    .map(({ scope, label, description, hint, searchText }): Candidate => {
      const id =
        scope.kind === 'backlog' ? 'switch-scope:backlog' : `switch-scope:${scope.sprintId}`
      return { command: { kind: 'switch-scope', id, label, scope, description, hint }, searchText }
    })
}

function generalCandidates(preferences: Preferences): Candidate[] {
  const nextDirection: LayoutDirection = preferences.direction === 'ltr' ? 'rtl' : 'ltr'
  const nextDensity: CardDensity = preferences.density === 'comfortable' ? 'compact' : 'comfortable'
  return [
    {
      command: { kind: 'create-issue', id: 'create-issue', label: 'Create issue' },
      searchText: 'create new add issue ticket task bug',
    },
    {
      command: {
        kind: 'set-direction',
        id: `set-direction:${nextDirection}`,
        label:
          nextDirection === 'rtl'
            ? 'Switch to right-to-left layout'
            : 'Switch to left-to-right layout',
        direction: nextDirection,
      },
      searchText: 'layout direction rtl ltr bidi right left hebrew arabic',
    },
    {
      command: {
        kind: 'set-density',
        id: `set-density:${nextDensity}`,
        label: nextDensity === 'compact' ? 'Use compact cards' : 'Use comfortable cards',
        density: nextDensity,
      },
      searchText: 'card density compact comfortable spacing',
    },
  ]
}

function issueCommand(issue: Issue): PaletteCommand {
  return {
    kind: 'open-issue',
    id: `open-issue:${issue.id}`,
    label: `${issue.id} ${issue.title}`,
    issue,
  }
}

export function buildPaletteSections({
  query,
  issues,
  sprints,
  scope,
  contextIssue,
  preferences,
}: PaletteSource): PaletteSection[] {
  const terms = toSearchTerms(query)
  const matchingIssues =
    terms.length === 0 ? recentIssues(issues, scope) : searchIssues(query, issues)
  const contextSections: PaletteSection[] = contextIssue
    ? [
        {
          id: 'context',
          title: `Actions for ${contextIssue.id}`,
          commands: keepMatching(contextCandidates(contextIssue), terms),
        },
      ]
    : []

  return [
    ...contextSections,
    { id: 'issues', title: 'Issues', commands: matchingIssues.map(issueCommand) },
    { id: 'go-to', title: 'Go to', commands: keepMatching(scopeCandidates(sprints, scope), terms) },
    {
      id: 'commands',
      title: 'Commands',
      commands: keepMatching(generalCandidates(preferences), terms),
    },
  ].filter((section) => section.commands.length > 0)
}
