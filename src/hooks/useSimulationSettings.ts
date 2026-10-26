import { useSyncExternalStore } from 'react'

import {
  getSimulationSettings,
  type SimulationSettings,
  subscribeToSimulation,
} from '@/mocks/simulation'

export function useSimulationSettings(): SimulationSettings {
  return useSyncExternalStore(subscribeToSimulation, getSimulationSettings)
}
