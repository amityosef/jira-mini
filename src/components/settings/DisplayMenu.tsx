import { useId } from 'react'
import { PilcrowLeft, PilcrowRight, Rows2, Rows3, SlidersHorizontal } from 'lucide-react'

import { useWorkspace } from '@/context/workspace'

import { popoverClassName } from '@/components/settings/popoverClassName'
import { Button } from '@/components/ui/Button'
import { type SegmentedOption, SegmentedRadioGroup } from '@/components/ui/SegmentedRadioGroup'

import type { CardDensity, LayoutDirection } from '@/types'

const DIRECTION_OPTIONS: readonly SegmentedOption<LayoutDirection>[] = [
  { value: 'ltr', label: 'Left to right', icon: PilcrowRight },
  { value: 'rtl', label: 'Right to left', icon: PilcrowLeft },
]

const DENSITY_OPTIONS: readonly SegmentedOption<CardDensity>[] = [
  { value: 'comfortable', label: 'Comfortable', icon: Rows2 },
  { value: 'compact', label: 'Compact', icon: Rows3 },
]

export function DisplayMenu() {
  const popoverId = useId()
  const headingId = useId()
  const { preferences, updatePreferences } = useWorkspace()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        popoverTarget={popoverId}
        aria-label="Display options"
        title="Display options"
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
      </Button>
      <div
        id={popoverId}
        popover="auto"
        role="dialog"
        aria-labelledby={headingId}
        className={popoverClassName}
      >
        <h2 id={headingId} className="mb-3 text-sm font-semibold">
          Display
        </h2>
        <div className="flex flex-col gap-4">
          <SegmentedRadioGroup
            legend="Layout direction"
            value={preferences.direction}
            options={DIRECTION_OPTIONS}
            onChange={(direction) => {
              updatePreferences({ direction })
            }}
          />
          <SegmentedRadioGroup
            legend="Card density"
            value={preferences.density}
            options={DENSITY_OPTIONS}
            onChange={(density) => {
              updatePreferences({ density })
            }}
          />
        </div>
      </div>
    </>
  )
}
