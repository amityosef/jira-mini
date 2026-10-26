import { queryOptions } from '@tanstack/react-query'

import {
  fetchIssueActivity,
  fetchIssueById,
  fetchIssues,
  fetchSprintMetrics,
  fetchWorkspace,
} from '@/mocks/mockApi'

export const issueKeys = {
  all: ['issues'] as const,
  detail: (issueId: string) => ['issue', issueId] as const,
  activity: (issueId: string) => ['issue', issueId, 'activity'] as const,
}

export const sprintMetricsKeys = {
  all: ['sprint-metrics'] as const,
  detail: (sprintId: string) => ['sprint-metrics', sprintId] as const,
}

export const workspaceKeys = {
  all: ['workspace'] as const,
}

export function workspaceQuery() {
  return queryOptions({
    queryKey: workspaceKeys.all,
    queryFn: ({ signal }) => fetchWorkspace({ signal }),
    staleTime: Infinity,
  })
}

export function issuesQuery() {
  return queryOptions({
    queryKey: issueKeys.all,
    queryFn: ({ signal }) => fetchIssues({ signal }),
  })
}

export function issueQuery(issueId: string) {
  return queryOptions({
    queryKey: issueKeys.detail(issueId),
    queryFn: ({ signal }) => fetchIssueById(issueId, { signal }),
    staleTime: 30_000,
  })
}

export function issueActivityQuery(issueId: string) {
  return queryOptions({
    queryKey: issueKeys.activity(issueId),
    queryFn: ({ signal }) => fetchIssueActivity(issueId, { signal }),
    staleTime: 30_000,
  })
}

export function sprintMetricsQuery(sprintId: string) {
  return queryOptions({
    queryKey: sprintMetricsKeys.detail(sprintId),
    queryFn: ({ signal }) => fetchSprintMetrics(sprintId, { signal }),
  })
}
