import { useSimulationSettings } from '@/hooks/useSimulationSettings'
import { STATUS_LABELS } from '@/lib/workflow'

import type { IssueStatus } from '@/types'

type ChaosProbeProps = { status: IssueStatus }

export function ChaosProbe({ status }: ChaosProbeProps) {
  const { crashedColumn } = useSimulationSettings()
  if (crashedColumn === status) {
    throw new Error(`Simulated render failure in the ${STATUS_LABELS[status]} column.`)
  }
  return null
}
