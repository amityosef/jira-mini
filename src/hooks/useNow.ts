import { useSyncExternalStore } from 'react'

const TICK_MS = 30_000

const listeners = new Set<() => void>()
let now = Date.now()
let ticker: ReturnType<typeof setInterval> | null = null

function tick() {
  now = Date.now()
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (ticker === null) {
    now = Date.now()
    ticker = setInterval(tick, TICK_MS)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && ticker !== null) {
      clearInterval(ticker)
      ticker = null
    }
  }
}

function getSnapshot(): number {
  return now
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot)
}
