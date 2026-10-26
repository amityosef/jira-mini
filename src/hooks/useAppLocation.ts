import { useSyncExternalStore } from 'react'

import { readLocationSearch, subscribeToLocation } from '@/lib/navigation'

export function useAppLocation() {
  const search = useSyncExternalStore(subscribeToLocation, readLocationSearch)
  const params = new URLSearchParams(search)
  return {
    search,
    issueId: params.get('issue'),
    scopeParam: params.get('sprint'),
  }
}
