import type { CardDensity, LayoutDirection, Preferences } from '@/types'

export const PREFERENCES_STORAGE_KEY = 'sprintflow:preferences:v1'

export const DEFAULT_PREFERENCES: Preferences = { direction: 'ltr', density: 'comfortable' }

function parseDirection(value: unknown): LayoutDirection | null {
  return value === 'ltr' || value === 'rtl' ? value : null
}

function parseDensity(value: unknown): CardDensity | null {
  return value === 'comfortable' || value === 'compact' ? value : null
}

export function readPreferences(): Preferences {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? 'null',
    )
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PREFERENCES
    return {
      direction:
        ('direction' in parsed ? parseDirection(parsed.direction) : null) ??
        DEFAULT_PREFERENCES.direction,
      density:
        ('density' in parsed ? parseDensity(parsed.density) : null) ?? DEFAULT_PREFERENCES.density,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function writePreferences(preferences: Preferences): void {
  window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}
