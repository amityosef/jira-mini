import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'

import { STATUS_LABELS } from '@/lib/workflow'

import { QuickAddComposer } from '@/components/issue-form/QuickAddComposer'
import { Button } from '@/components/ui/Button'

import type { IssueStatus } from '@/types'

type QuickAddFormProps = { status: IssueStatus }

export function QuickAddForm({ status }: QuickAddFormProps) {
  const [isComposing, setIsComposing] = useState(false)
  const shouldRestoreFocusRef = useRef(false)

  function collapse() {
    shouldRestoreFocusRef.current = true
    setIsComposing(false)
  }

  if (isComposing) return <QuickAddComposer status={status} onCollapse={collapse} />

  return (
    <Button
      ref={(button) => {
        if (button && shouldRestoreFocusRef.current) {
          shouldRestoreFocusRef.current = false
          button.focus()
        }
      }}
      variant="ghost"
      size="sm"
      className="w-full"
      aria-label={`Add issue to ${STATUS_LABELS[status]}`}
      onClick={() => {
        setIsComposing(true)
      }}
    >
      <Plus aria-hidden="true" className="size-4" />
      Add issue
    </Button>
  )
}
