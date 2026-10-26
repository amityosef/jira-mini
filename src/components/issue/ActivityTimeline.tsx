import { use } from 'react'

import { useWorkspace } from '@/context/workspace'
import { useNow } from '@/hooks/useNow'

import { ActivityEntry } from '@/components/issue/ActivityEntry'

import type { ActivityEvent } from '@/types'

type ActivityTimelineProps = { activityPromise: Promise<ActivityEvent[]> }

export function ActivityTimeline({ activityPromise }: ActivityTimelineProps) {
  const { membersById } = useWorkspace()
  const now = useNow()
  const events = use(activityPromise)

  if (events.length === 0) {
    return <p className="text-sm text-fg-subtle">No activity yet.</p>
  }

  return (
    <ol className="flex flex-col gap-4">
      {events.map((event) => (
        <ActivityEntry key={event.id} event={event} membersById={membersById} now={now} />
      ))}
    </ol>
  )
}
