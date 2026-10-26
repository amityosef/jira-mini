import { ApiError } from '@/lib/apiError'

import type { IssueStatus } from '@/types'

export const LATENCY_PROFILES = {
  instant: { label: 'Instant', minMs: 0, maxMs: 0 },
  fast: { label: 'Fast · 50–150 ms', minMs: 50, maxMs: 150 },
  realistic: { label: 'Realistic · 200–800 ms', minMs: 200, maxMs: 800 },
  slow: { label: 'Slow · 1.5–3 s', minMs: 1500, maxMs: 3000 },
} as const satisfies Record<string, { label: string; minMs: number; maxMs: number }>

export type LatencyProfile = keyof typeof LATENCY_PROFILES

export const LATENCY_PROFILE_IDS = [
  'instant',
  'fast',
  'realistic',
  'slow',
] as const satisfies readonly LatencyProfile[]

export type SimulationSettings = {
  failureRate: number
  latency: LatencyProfile
  crashedColumn: IssueStatus | null
}

type PersistedSettings = Pick<SimulationSettings, 'failureRate' | 'latency'>

export const SIMULATION_STORAGE_KEY = 'sprintflow:simulation:v1'

export const DEFAULT_SIMULATION: SimulationSettings = {
  failureRate: 0.1,
  latency: 'realistic',
  crashedColumn: null,
}

export function parseLatency(value: unknown): LatencyProfile | null {
  return LATENCY_PROFILE_IDS.find((profile) => profile === value) ?? null
}

function readPersistedSettings(): PersistedSettings {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(SIMULATION_STORAGE_KEY) ?? 'null',
    )
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SIMULATION
    const failureRate = 'failureRate' in parsed ? parsed.failureRate : null
    const latency = 'latency' in parsed ? parseLatency(parsed.latency) : null
    return {
      failureRate:
        typeof failureRate === 'number' && failureRate >= 0 && failureRate <= 1
          ? failureRate
          : DEFAULT_SIMULATION.failureRate,
      latency: latency ?? DEFAULT_SIMULATION.latency,
    }
  } catch {
    return DEFAULT_SIMULATION
  }
}

let settings: SimulationSettings = { ...DEFAULT_SIMULATION, ...readPersistedSettings() }
const listeners = new Set<() => void>()

export function getSimulationSettings(): SimulationSettings {
  return settings
}

export function subscribeToSimulation(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function updateSimulationSettings(patch: Partial<SimulationSettings>): void {
  settings = { ...settings, ...patch }
  const persisted: PersistedSettings = {
    failureRate: settings.failureRate,
    latency: settings.latency,
  }
  window.localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(persisted))
  for (const listener of listeners) listener()
}

function wait(durationMs: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    const abortError = () => new DOMException('The request was cancelled.', 'AbortError')
    if (signal?.aborted) {
      reject(abortError())
      return
    }
    const handleAbort = () => {
      clearTimeout(timer)
      reject(abortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, durationMs)
    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

export async function simulateNetwork(signal?: AbortSignal): Promise<void> {
  const { failureRate, latency } = settings
  const { minMs, maxMs } = LATENCY_PROFILES[latency]
  await wait(minMs + Math.random() * (maxMs - minMs), signal)
  if (Math.random() < failureRate) {
    throw new ApiError({
      code: 'network',
      message: 'The server did not respond. Check your connection and try again.',
    })
  }
}
