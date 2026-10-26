import { describe, expect, test } from 'vitest'

import { ApiError } from '@/lib/apiError'
import { DATABASE_STORAGE_KEY, loadDatabase } from '@/mocks/database'
import {
  createIssue,
  deleteIssue,
  fetchIssueActivity,
  fetchIssues,
  fetchSprintMetrics,
  updateIssueStatus,
} from '@/mocks/mockApi'
import { updateSimulationSettings } from '@/mocks/simulation'

import type { CreateIssueInput } from '@/types'

const newIssue: CreateIssueInput = {
  title: 'Add a skeleton for the order summary',
  description: '',
  status: 'todo',
  priority: 'medium',
  type: 'feature',
  points: 2,
  assigneeId: null,
  sprintId: 'sprint-24',
  labels: ['checkout'],
}

describe('mock backend', () => {
  test('seeds realistic issues across active, planned and unscheduled work', async () => {
    const issues = await fetchIssues()
    const sprintIds = new Set(issues.map((issue) => issue.sprintId))

    expect(issues.length).toBeGreaterThanOrEqual(25)
    expect(sprintIds).toContain('sprint-24')
    expect(sprintIds).toContain('sprint-25')
    expect(sprintIds).toContain(null)
  })

  test('moves an issue and records the transition in its activity', async () => {
    const updated = await updateIssueStatus('SF-118', 'in_progress')
    const activity = await fetchIssueActivity('SF-118')

    expect(updated.status).toBe('in_progress')
    expect(activity[0]).toMatchObject({ kind: 'status_changed', from: 'todo', to: 'in_progress' })
  })

  test('rejects a move that would exceed the work-in-progress limit', async () => {
    await updateIssueStatus('SF-118', 'in_progress')

    await expect(updateIssueStatus('SF-121', 'in_progress')).rejects.toThrow(
      'In Progress is at its work-in-progress limit of 4.',
    )
    expect(loadDatabase().issues.find((issue) => issue.id === 'SF-121')?.status).toBe('todo')
  })

  test('creates issues with sequential ids and rejects duplicate titles in the same sprint', async () => {
    const created = await createIssue(newIssue)

    expect(created.id).toBe('SF-151')
    await expect(
      createIssue({ ...newIssue, title: `  ${newIssue.title.toUpperCase()} ` }),
    ).rejects.toThrow(ApiError)
    await expect(createIssue({ ...newIssue, sprintId: 'sprint-25' })).resolves.toMatchObject({
      id: 'SF-152',
    })
  })

  test('deletes an issue together with its activity', async () => {
    await deleteIssue('SF-112')

    expect(loadDatabase().issues.some((issue) => issue.id === 'SF-112')).toBe(false)
    await expect(fetchIssueActivity('SF-112')).rejects.toThrow('SF-112 no longer exists')
  })

  test('computes sprint metrics on the server side', async () => {
    const metrics = await fetchSprintMetrics('sprint-24')

    expect(metrics.totalIssues).toBe(16)
    expect(metrics.completedPoints).toBe(metrics.pointsByStatus.done)
    expect(metrics.daysElapsed + metrics.daysRemaining).toBe(metrics.daysTotal)
  })

  test('fails every request when the failure rate is 100%', async () => {
    updateSimulationSettings({ failureRate: 1 })

    await expect(fetchIssues()).rejects.toMatchObject({ failure: { code: 'network' } })
  })

  test('cancels an in-flight request when its signal aborts', async () => {
    updateSimulationSettings({ latency: 'slow' })
    const controller = new AbortController()
    const request = fetchIssues({ signal: controller.signal })
    controller.abort()

    await expect(request).rejects.toThrow('The request was cancelled.')
  })

  test('reseeds instead of trusting corrupted storage', () => {
    window.localStorage.setItem(
      DATABASE_STORAGE_KEY,
      JSON.stringify({ version: 1, issues: 'oops' }),
    )

    expect(loadDatabase().issues.length).toBeGreaterThanOrEqual(25)
  })
})
