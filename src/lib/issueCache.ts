import { issueKeys, issueQuery, issuesQuery, sprintMetricsKeys } from '@/lib/queries'

import type { Issue } from '@/types'
import type { QueryClient } from '@tanstack/react-query'

function upsert(issues: Issue[], issue: Issue): Issue[] {
  return issues.some((candidate) => candidate.id === issue.id)
    ? issues.map((candidate) => (candidate.id === issue.id ? issue : candidate))
    : [...issues, issue]
}

export function writeIssueToCache(queryClient: QueryClient, issue: Issue): void {
  queryClient.setQueryData(issuesQuery().queryKey, (issues) => issues && upsert(issues, issue))
  queryClient.setQueryData(issueQuery(issue.id).queryKey, issue)
}

export function removeIssueFromCache(queryClient: QueryClient, issueId: string): void {
  queryClient.setQueryData(issuesQuery().queryKey, (issues) =>
    issues?.filter((issue) => issue.id !== issueId),
  )
  queryClient.removeQueries({ queryKey: issueKeys.detail(issueId) })
}

export function invalidateIssueDependents(queryClient: QueryClient, issueId: string): void {
  void queryClient.invalidateQueries({ queryKey: sprintMetricsKeys.all })
  void queryClient.invalidateQueries({ queryKey: issueKeys.activity(issueId) })
}
