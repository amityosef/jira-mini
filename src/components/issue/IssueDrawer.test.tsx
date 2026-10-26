import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { issuesQuery, workspaceQuery } from '@/lib/queries'
import { loadDatabase } from '@/mocks/database'
import { updateSimulationSettings } from '@/mocks/simulation'

import { IssueDrawer } from '@/components/issue/IssueDrawer'
import { createTestQueryClient, renderWithProviders } from '@/test/renderWithProviders'

const ISSUE_ID = 'SF-112'
const ISSUE_TITLE = 'Payment intent created twice when “Place order” is double-clicked'

function openDrawer() {
  window.history.replaceState(null, '', `/?issue=${ISSUE_ID}`)
  return renderWithProviders(<IssueDrawer issueId={ISSUE_ID} />)
}

function openDrawerWithWarmBoard() {
  const queryClient = createTestQueryClient()
  const { workspace, members, sprints, issues } = loadDatabase()
  queryClient.setQueryData(workspaceQuery().queryKey, { workspace, members, sprints })
  queryClient.setQueryData(issuesQuery().queryKey, issues)
  window.history.replaceState(null, '', `/?issue=${ISSUE_ID}`)
  return renderWithProviders(<IssueDrawer issueId={ISSUE_ID} />, queryClient)
}

function persistedIssue() {
  return loadDatabase().issues.find((issue) => issue.id === ISSUE_ID)
}

function retryButtonFor(errorTitle: string): HTMLElement {
  const alert = screen.getByText(errorTitle).closest<HTMLElement>('[role="alert"]')
  if (!alert) throw new Error(`No alert contains "${errorTitle}"`)
  return within(alert).getByRole('button', { name: 'Try again' })
}

describe('IssueDrawer', () => {
  it('loads details and activity in parallel and hoists document metadata', async () => {
    openDrawer()

    expect(await screen.findByRole('heading', { level: 2, name: ISSUE_TITLE })).toBeInTheDocument()
    expect(await screen.findByText(/Reproduced on Safari/)).toBeInTheDocument()
    await waitFor(() => {
      expect(document.title).toBe(`${ISSUE_ID} · ${ISSUE_TITLE} · SprintFlow`)
    })
    expect(document.head.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#f59e0b',
    )
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      expect.stringContaining('On slow connections'),
    )
  })

  it('persists a status change made from the drawer', async () => {
    const { user } = openDrawer()
    const select = await screen.findByRole('combobox', { name: 'Status' })
    await waitFor(() => {
      expect(select).toBeEnabled()
    })

    await user.selectOptions(select, 'in_review')

    await waitFor(() => {
      expect(persistedIssue()?.status).toBe('in_review')
    })
    expect(await screen.findByRole('combobox', { name: 'Status' })).toHaveValue('in_review')
  })

  it('shows segmented errors and recovers each section on retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    updateSimulationSettings({ failureRate: 1 })
    const { user } = await act(() => openDrawerWithWarmBoard())

    expect(await screen.findByText('Couldn’t load this issue')).toBeInTheDocument()
    expect(await screen.findByText('Couldn’t load activity')).toBeInTheDocument()

    updateSimulationSettings({ failureRate: 0 })
    await act(() => user.click(retryButtonFor('Couldn’t load this issue')))
    expect(await screen.findByRole('heading', { level: 2, name: ISSUE_TITLE })).toBeInTheDocument()
    expect(screen.getByText('Couldn’t load activity')).toBeInTheDocument()

    await act(() => user.click(retryButtonFor('Couldn’t load activity')))
    expect(await screen.findByText(/Reproduced on Safari/)).toBeInTheDocument()
  })

  it('moves focus into the panel and closes on Escape', async () => {
    const { user } = openDrawer()
    const panel = await screen.findByRole('complementary', { name: `Issue ${ISSUE_ID}` })

    await waitFor(() => {
      expect(panel).toHaveFocus()
    })
    await user.keyboard('{Escape}')

    expect(new URLSearchParams(window.location.search).has('issue')).toBe(false)
  })

  it('deletes the issue after an explicit confirmation', async () => {
    const { user } = openDrawer()
    await screen.findByRole('heading', { level: 2, name: ISSUE_TITLE })

    await user.click(screen.getByRole('button', { name: 'Delete issue' }))
    const confirm = screen.getByRole('button', { name: 'Delete' })
    expect(confirm).toHaveFocus()
    await user.click(confirm)

    await waitFor(() => {
      expect(persistedIssue()).toBeUndefined()
    })
    expect(new URLSearchParams(window.location.search).has('issue')).toBe(false)
  })

  it('returns focus to the trigger when deletion is cancelled', async () => {
    const { user } = openDrawer()
    await screen.findByRole('heading', { level: 2, name: ISSUE_TITLE })
    const trigger = screen.getByRole('button', { name: 'Delete issue' })

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(persistedIssue()).toBeDefined()
  })
})
