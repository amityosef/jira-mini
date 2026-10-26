import { BACKLOG_SCOPE_PARAM, scopeToParam } from '@/lib/workflow'

import type { BoardScope, Sprint } from '@/types'
import type { MouseEvent } from 'react'

type SearchParam = 'issue' | 'sprint'

export type LocationPatch = Partial<Record<SearchParam, string | null>>

const NAVIGATION_EVENT = 'sprintflow:navigate'

function applyPatch(search: string, patch: LocationPatch): URLSearchParams {
  const params = new URLSearchParams(search)
  for (const [key, value] of Object.entries(patch)) {
    if (value) params.set(key, value)
    else params.delete(key)
  }
  return params
}

export function subscribeToLocation(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAVIGATION_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAVIGATION_EVENT, onChange)
  }
}

export function readLocationSearch(): string {
  return window.location.search
}

export function hrefWith(search: string, patch: LocationPatch): string {
  return `?${applyPatch(search, patch).toString()}`
}

export function navigate(patch: LocationPatch): void {
  const url = new URL(window.location.href)
  url.search = applyPatch(url.search, patch).toString()
  window.history.pushState(null, '', url)
  window.dispatchEvent(new Event(NAVIGATION_EVENT))
}

export function openIssue(issueId: string): void {
  navigate({ issue: issueId })
}

export function closeIssue(): void {
  navigate({ issue: null })
}

export function selectScope(scope: BoardScope): void {
  navigate({ sprint: scopeToParam(scope), issue: null })
}

export function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

export function resolveScope(param: string | null, sprints: readonly Sprint[]): BoardScope {
  if (param === BACKLOG_SCOPE_PARAM) return { kind: 'backlog' }
  const sprint =
    sprints.find((candidate) => candidate.id === param) ??
    sprints.find((candidate) => candidate.state === 'active') ??
    sprints.find((candidate) => candidate.state === 'planned')
  return sprint ? { kind: 'sprint', sprintId: sprint.id } : { kind: 'backlog' }
}
