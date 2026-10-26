import { describe, expect, test } from 'vitest'

import {
  buildPaletteSections,
  issueMatchRank,
  MATCH_RANK,
  MAX_ISSUE_RESULTS,
  type PaletteSection,
  type PaletteSource,
  RECENT_ISSUE_COUNT,
  searchIssues,
} from '@/lib/commands'
import { DEFAULT_PREFERENCES } from '@/lib/preferences'
import { createSeedDatabase } from '@/mocks/seed'

import type { BoardScope, Issue } from '@/types'

const database = createSeedDatabase(new Date('2026-10-26T12:00:00Z'))
const activeSprintScope: BoardScope = { kind: 'sprint', sprintId: 'sprint-24' }

function makeIssue(overrides: Partial<Issue> & Pick<Issue, 'id' | 'title'>): Issue {
  return {
    description: '',
    status: 'todo',
    priority: 'medium',
    type: 'feature',
    points: 1,
    assigneeId: null,
    sprintId: 'sprint-24',
    labels: [],
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    ...overrides,
  }
}

function source(overrides: Partial<PaletteSource> = {}): PaletteSource {
  return {
    query: '',
    issues: database.issues,
    sprints: database.sprints,
    scope: activeSprintScope,
    contextIssue: null,
    preferences: DEFAULT_PREFERENCES,
    ...overrides,
  }
}

function labelsOf(section: PaletteSection | undefined): string[] {
  return section?.commands.map((command) => command.label) ?? []
}

function findIssue(issueId: string): Issue {
  const issue = database.issues.find((candidate) => candidate.id === issueId)
  if (!issue) throw new Error(`Seed issue ${issueId} is missing`)
  return issue
}

describe('issueMatchRank', () => {
  const issue = makeIssue({
    id: 'SF-112',
    title: 'Payment intent created twice when “Place order” is double-clicked',
    labels: ['checkout', 'payments'],
  })

  test.each([
    ['sf-112', MATCH_RANK.exactId],
    ['112', MATCH_RANK.exactId],
    ['SF-11', MATCH_RANK.idPrefix],
    ['11', MATCH_RANK.idPrefix],
    ['place', MATCH_RANK.wordPrefix],
    ['DOUBLE', MATCH_RANK.wordPrefix],
    ['check', MATCH_RANK.wordPrefix],
    ['ment', MATCH_RANK.substring],
    ['zebra', MATCH_RANK.none],
    ['   ', MATCH_RANK.none],
  ])('ranks %j as %i', (query, rank) => {
    expect(issueMatchRank(query, issue)).toBe(rank)
  })

  test('requires every term to match and keeps the weakest rank', () => {
    expect(issueMatchRank('place double', issue)).toBe(MATCH_RANK.wordPrefix)
    expect(issueMatchRank('place ment', issue)).toBe(MATCH_RANK.substring)
    expect(issueMatchRank('place zebra', issue)).toBe(MATCH_RANK.none)
  })
})

describe('searchIssues', () => {
  test('orders exact id, id prefix, word prefix, then substring matches', () => {
    const issues = [
      makeIssue({ id: 'SF-301', title: 'Build v312 hotfix' }),
      makeIssue({ id: 'SF-300', title: 'Release 12 checklist' }),
      makeIssue({ id: 'SF-302', title: 'Unrelated chore' }),
      makeIssue({ id: 'SF-120', title: 'Beta task' }),
      makeIssue({ id: 'SF-12', title: 'Alpha task' }),
    ]
    expect(searchIssues('12', issues).map((issue) => issue.id)).toEqual([
      'SF-12',
      'SF-120',
      'SF-300',
      'SF-301',
    ])
  })

  test('breaks ties by the most recently updated issue', () => {
    const issues = [
      makeIssue({ id: 'SF-1', title: 'Checkout copy', updatedAt: '2026-10-01T09:00:00.000Z' }),
      makeIssue({ id: 'SF-2', title: 'Checkout spacing', updatedAt: '2026-10-20T09:00:00.000Z' }),
    ]
    expect(searchIssues('checkout', issues).map((issue) => issue.id)).toEqual(['SF-2', 'SF-1'])
  })

  test(`returns at most ${MAX_ISSUE_RESULTS} issues`, () => {
    const issues = Array.from({ length: 12 }, (_, index) =>
      makeIssue({ id: `SF-${400 + index}`, title: `Task number ${index}` }),
    )
    expect(searchIssues('task', issues)).toHaveLength(MAX_ISSUE_RESULTS)
  })
})

describe('buildPaletteSections', () => {
  test('suggests the most recently updated issues of the current scope for an empty query', () => {
    const sections = buildPaletteSections(source())
    expect(sections.map((section) => section.title)).toEqual(['Issues', 'Go to', 'Commands'])
    const issueCommands = sections[0]?.commands ?? []
    expect(issueCommands).toHaveLength(RECENT_ISSUE_COUNT)
    for (const command of issueCommands) {
      expect(command.kind === 'open-issue' && command.issue.sprintId).toBe('sprint-24')
    }
  })

  test('offers every upcoming scope except the current one', () => {
    const fromSprint = buildPaletteSections(source())
    expect(labelsOf(fromSprint.find((section) => section.id === 'go-to'))).toEqual([
      'Sprint 25',
      'Sprint 26',
      'Team backlog',
    ])
    const fromBacklog = buildPaletteSections(source({ scope: { kind: 'backlog' } }))
    expect(labelsOf(fromBacklog.find((section) => section.id === 'go-to'))).toEqual([
      'Sprint 24',
      'Sprint 25',
      'Sprint 26',
    ])
  })

  test('puts status actions for the context issue first and filters them by query', () => {
    const contextIssue = findIssue('SF-112')
    const sections = buildPaletteSections(source({ contextIssue }))
    expect(sections[0]?.title).toBe('Actions for SF-112')
    expect(labelsOf(sections[0])).toEqual([
      'Move SF-112 to Backlog',
      'Move SF-112 to Todo',
      'Move SF-112 to In Review',
      'Move SF-112 to Done',
    ])
    const filtered = buildPaletteSections(source({ contextIssue, query: 'done' }))
    expect(labelsOf(filtered[0])).toEqual(['Move SF-112 to Done'])
  })

  test('matches commands and issues together', () => {
    const sections = buildPaletteSections(source({ query: 'rtl' }))
    const issueIds = sections
      .find((section) => section.id === 'issues')
      ?.commands.map((command) => (command.kind === 'open-issue' ? command.issue.id : null))
    expect(issueIds).toEqual(['SF-136'])
    expect(labelsOf(sections.find((section) => section.id === 'commands'))).toEqual([
      'Switch to right-to-left layout',
    ])
  })

  test('labels preference commands with the opposite of the current setting', () => {
    const sections = buildPaletteSections(
      source({ query: 'layout', preferences: { direction: 'rtl', density: 'comfortable' } }),
    )
    expect(labelsOf(sections.find((section) => section.id === 'commands'))).toEqual([
      'Switch to left-to-right layout',
    ])
    const density = buildPaletteSections(
      source({ query: 'density', preferences: { direction: 'ltr', density: 'compact' } }),
    )
    expect(labelsOf(density.find((section) => section.id === 'commands'))).toEqual([
      'Use comfortable cards',
    ])
  })

  test('returns no sections when nothing matches', () => {
    expect(buildPaletteSections(source({ query: 'zzqx-nothing' }))).toEqual([])
  })
})
