import { useEffect, useState, useTransition } from 'react'
import {
  hashKey,
  type QueryCacheNotifyEvent,
  type QueryClient,
  useQueryClient,
} from '@tanstack/react-query'

import { issueActivityQuery, issueKeys, issueQuery } from '@/lib/queries'

import type { ActivityEvent, Issue } from '@/types'

export type IssueResources = {
  issuePromise: Promise<Issue>
  activityPromise: Promise<ActivityEvent[]>
  retryIssue: () => void
  retryActivity: () => void
  isRefreshing: boolean
}

function markHandled<T>(promise: Promise<T>): Promise<T> {
  void promise.catch(() => undefined)
  return promise
}

function loadIssue(queryClient: QueryClient, issueId: string): Promise<Issue> {
  return markHandled(queryClient.query(issueQuery(issueId)))
}

function loadActivity(queryClient: QueryClient, issueId: string): Promise<ActivityEvent[]> {
  return markHandled(queryClient.query(issueActivityQuery(issueId)))
}

function isExternalChange(event: QueryCacheNotifyEvent): boolean {
  if (event.type !== 'updated') return false
  const { action } = event
  return action.type === 'invalidate' || (action.type === 'success' && action.manual === true)
}

export function useIssueResources(issueId: string): IssueResources {
  const queryClient = useQueryClient()
  const [issuePromise, setIssuePromise] = useState(() => loadIssue(queryClient, issueId))
  const [activityPromise, setActivityPromise] = useState(() => loadActivity(queryClient, issueId))
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    const issueHash = hashKey(issueKeys.detail(issueId))
    const activityHash = hashKey(issueKeys.activity(issueId))
    return queryClient.getQueryCache().subscribe((event) => {
      if (!isExternalChange(event)) return
      if (event.query.queryHash === issueHash) {
        startRefresh(() => {
          setIssuePromise(loadIssue(queryClient, issueId))
        })
      } else if (event.query.queryHash === activityHash) {
        startRefresh(() => {
          setActivityPromise(loadActivity(queryClient, issueId))
        })
      }
    })
  }, [queryClient, issueId])

  function retryIssue() {
    startRefresh(() => {
      setIssuePromise(loadIssue(queryClient, issueId))
    })
  }

  function retryActivity() {
    startRefresh(() => {
      setActivityPromise(loadActivity(queryClient, issueId))
    })
  }

  return { issuePromise, activityPromise, retryIssue, retryActivity, isRefreshing }
}
