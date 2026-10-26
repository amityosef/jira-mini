import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { loadDatabase } from '@/mocks/database'
import { updateSimulationSettings } from '@/mocks/simulation'

import { Board } from '@/components/board/Board'
import { renderWithProviders } from '@/test/renderWithProviders'

async function renderBoard() {
  const view = renderWithProviders(<Board />)
  await screen.findByRole('heading', { name: 'In Progress' })
  return view
}

function column(name: string) {
  return screen.getByRole('region', { name })
}

function cardLink(columnName: string, title: RegExp) {
  return within(column(columnName)).getByRole('link', { name: title })
}

function statusOf(issueId: string) {
  return loadDatabase().issues.find((issue) => issue.id === issueId)?.status
}

function createDataTransfer() {
  const store = new Map<string, string>()
  return {
    dropEffect: 'none',
    effectAllowed: 'all',
    get types() {
      return [...store.keys()]
    },
    setData(type: string, value: string) {
      store.set(type, value)
    },
    getData(type: string) {
      return store.get(type) ?? ''
    },
  }
}

describe('Board', () => {
  test('derives column counts, WIP state and points during render', async () => {
    await renderBoard()

    expect(
      within(column('In Progress')).getByText('3 issues of a work-in-progress limit of 4'),
    ).toBeInTheDocument()
    expect(within(column('In Progress')).getByText('18 points')).toBeInTheDocument()
    expect(within(column('Todo')).getByText('4 issues')).toBeInTheDocument()
  })

  test('moves a focused card with Shift+Arrow, keeps focus on it and persists the move', async () => {
    const { user } = await renderBoard()
    cardLink('Todo', /Flaky e2e/).focus()

    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')

    const moved = await within(column('In Progress')).findByRole('link', { name: /Flaky e2e/ })
    await waitFor(() => {
      expect(moved).toHaveFocus()
    })
    await waitFor(() => {
      expect(statusOf('SF-118')).toBe('in_progress')
    })
    expect(await screen.findByText('SF-118 moved to In Progress.')).toBeInTheDocument()
  })

  test('mirrors the arrow keys in right-to-left layouts', async () => {
    window.localStorage.setItem(
      'sprintflow:preferences:v1',
      JSON.stringify({ direction: 'rtl', density: 'comfortable' }),
    )
    const { user } = await renderBoard()
    cardLink('Todo', /Flaky e2e/).focus()

    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')

    await within(column('In Progress')).findByRole('link', { name: /Flaky e2e/ })
  })

  test('shows the move instantly and rolls it back when the server rejects it', async () => {
    const { user } = await renderBoard()
    updateSimulationSettings({ failureRate: 1, latency: 'fast' })
    cardLink('Todo', /Flaky e2e/).focus()

    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')

    expect(await within(column('In Progress')).findByText('Saving…')).toBeInTheDocument()
    const alert = await screen.findByText(/Couldn’t move SF-118 to In Progress/)
    expect(alert.closest('[role="alert"]')).not.toBeNull()
    await waitFor(() => {
      expect(cardLink('Todo', /Flaky e2e/)).toHaveFocus()
    })
    expect(statusOf('SF-118')).toBe('todo')
  })

  test('rolls back a move that breaks the server-side WIP limit', async () => {
    const { user } = await renderBoard()
    cardLink('Todo', /Flaky e2e/).focus()
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
    await waitFor(() => {
      expect(statusOf('SF-118')).toBe('in_progress')
    })

    cardLink('Todo', /Place order/).focus()
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')

    expect(await screen.findByText(/at its work-in-progress limit of 4/)).toBeInTheDocument()
    expect(
      await within(column('Todo')).findByRole('link', { name: /Place order/ }),
    ).toBeInTheDocument()
    expect(statusOf('SF-121')).toBe('todo')
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })

  test('drops a dragged card into another column', async () => {
    await renderBoard()
    const card = cardLink('Todo', /Flaky e2e/).closest('article')
    if (!card) throw new Error('Expected the card element')
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(card, { dataTransfer })
    fireEvent.dragOver(column('In Review'), { dataTransfer })
    fireEvent.drop(column('In Review'), { dataTransfer })

    await within(column('In Review')).findByRole('link', { name: /Flaky e2e/ })
    await waitFor(() => {
      expect(statusOf('SF-118')).toBe('in_review')
    })
  })

  test('contains a crashing column behind its own error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { user } = await renderBoard()

    act(() => {
      updateSimulationSettings({ crashedColumn: 'todo' })
    })

    expect(await screen.findByText('Todo couldn’t be displayed')).toBeInTheDocument()
    expect(column('In Progress')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Todo' })).toBeInTheDocument()
  })
})
