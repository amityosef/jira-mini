import { createSeedDatabase, type MockDatabase } from '@/mocks/seed'
import { isMockDatabase } from '@/mocks/validation'

export const DATABASE_STORAGE_KEY = 'sprintflow:database:v1'

function parseStoredDatabase(raw: string | null): MockDatabase | null {
  if (raw === null) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return isMockDatabase(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveDatabase(database: MockDatabase): void {
  window.localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(database))
}

export function loadDatabase(): MockDatabase {
  const stored = parseStoredDatabase(window.localStorage.getItem(DATABASE_STORAGE_KEY))
  if (stored) return stored
  const seeded = createSeedDatabase()
  saveDatabase(seeded)
  return seeded
}

export function resetDatabase(): MockDatabase {
  const seeded = createSeedDatabase()
  saveDatabase(seeded)
  return seeded
}
