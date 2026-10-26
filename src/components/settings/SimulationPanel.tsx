import { useId, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FlaskConical, RotateCcw } from 'lucide-react'

import { useToast } from '@/context/toast'
import { useSimulationSettings } from '@/hooks/useSimulationSettings'
import { parseStatus, STATUS_LABELS } from '@/lib/workflow'
import { resetDemoData } from '@/mocks/mockApi'
import {
  LATENCY_PROFILE_IDS,
  LATENCY_PROFILES,
  parseLatency,
  updateSimulationSettings,
} from '@/mocks/simulation'

import { popoverClassName } from '@/components/settings/popoverClassName'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'

import { ISSUE_STATUSES } from '@/types'

export function SimulationPanel() {
  const popoverId = useId()
  const headingId = useId()
  const rateId = useId()
  const settings = useSimulationSettings()
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const [isResetting, startResetting] = useTransition()
  const failurePercent = Math.round(settings.failureRate * 100)

  function resetDemo() {
    if (isResetting) return
    startResetting(async () => {
      await resetDemoData()
      await queryClient.invalidateQueries()
      notify({ tone: 'info', message: 'Demo data restored to its original state.' })
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        popoverTarget={popoverId}
        aria-label="Network simulation"
        title="Network simulation"
      >
        <FlaskConical aria-hidden="true" className="size-4" />
      </Button>
      <div
        id={popoverId}
        popover="auto"
        role="dialog"
        aria-labelledby={headingId}
        className={popoverClassName}
      >
        <h2 id={headingId} className="text-sm font-semibold">
          Network simulation
        </h2>
        <p className="mt-1 text-xs text-fg-muted">
          The mock API runs in your browser. Raise the failure rate to watch optimistic updates roll
          back, or crash a column to see its error boundary.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={rateId} className="text-sm font-medium">
                Failure rate
              </label>
              <output htmlFor={rateId} className="text-sm text-fg-muted tabular-nums">
                {`${failurePercent}%`}
              </output>
            </div>
            <input
              id={rateId}
              type="range"
              min={0}
              max={100}
              step={5}
              value={failurePercent}
              aria-valuetext={`${failurePercent}%`}
              onChange={(event) => {
                updateSimulationSettings({ failureRate: Number(event.target.value) / 100 })
              }}
              className="w-full cursor-pointer accent-accent"
            />
          </div>
          <SelectField
            label="Latency"
            value={settings.latency}
            onChange={(event) => {
              const latency = parseLatency(event.target.value)
              if (latency) updateSimulationSettings({ latency })
            }}
          >
            {LATENCY_PROFILE_IDS.map((profile) => (
              <option key={profile} value={profile}>
                {LATENCY_PROFILES[profile].label}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Crash a column"
            hint="Throws during render so only that column’s error boundary takes over."
            value={settings.crashedColumn ?? ''}
            onChange={(event) => {
              updateSimulationSettings({ crashedColumn: parseStatus(event.target.value) })
            }}
          >
            <option value="">None</option>
            {ISSUE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </SelectField>
          <Button onClick={resetDemo} aria-disabled={isResetting || undefined}>
            {isResetting ? <Spinner /> : <RotateCcw aria-hidden="true" className="size-4" />}
            {isResetting ? 'Restoring…' : 'Reset demo data'}
          </Button>
        </div>
      </div>
    </>
  )
}
