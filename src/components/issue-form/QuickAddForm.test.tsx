import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useBoard } from '@/context/board'
import { loadDatabase } from '@/mocks/database'
import { updateSimulationSettings } from '@/mocks/simulation'

import { QuickAddForm } from '@/components/issue-form/QuickAddForm'
import { renderWithProviders } from '@/test/renderWithProviders'

const SEED_ISSUE = 'Payment intent created twice when “Place order” is double-clicked (synced)'

function BoardProbe() {
  const { issues } = useBoard()
  return (
    <ul aria-label="Board issues">
      {issues.map((issue) => (
        <li key={issue.id}>{`${issue.title} (${issue.syncState})`}</li>
      ))}
    </ul>
  )
}

async function openComposer() {
  const view = renderWithProviders(
    <>
      <QuickAddForm status="todo" />
      <BoardProbe />
    </>,
  )
  await view.user.click(await screen.findByRole('button', { name: 'Add issue to Todo' }))
  await screen.findByText(SEED_ISSUE)
  return { ...view, input: screen.getByRole('textbox', { name: 'New issue title in Todo' }) }
}

describe('QuickAddForm', () => {
  it('moves focus into the composer and back to the toggle on Escape', async () => {
    const { user, input } = await openComposer()
    expect(input).toHaveFocus()

    await user.keyboard('{Escape}')

    expect(await screen.findByRole('button', { name: 'Add issue to Todo' })).toHaveFocus()
  })

  it('links the validation error to the input and keeps what was typed', async () => {
    const { user, input } = await openComposer()

    await user.type(input, 'ab')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Use at least 3 characters.')).toHaveAttribute('role', 'alert')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Use at least 3 characters.')
    expect(input).toHaveValue('ab')
  })

  it('shows the draft card immediately, then clears the input once the server confirms', async () => {
    updateSimulationSettings({ latency: 'fast' })
    const { user, input } = await openComposer()

    await user.type(input, 'Write release notes for 1.4{Enter}')

    expect(await screen.findByText('Write release notes for 1.4 (creating)')).toBeInTheDocument()
    expect(await screen.findByText('Write release notes for 1.4 (synced)')).toBeInTheDocument()
    await waitFor(() => {
      expect(input).toHaveValue('')
    })
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(loadDatabase().issues).toContainEqual(
      expect.objectContaining({
        title: 'Write release notes for 1.4',
        status: 'todo',
        sprintId: 'sprint-24',
        priority: 'none',
        points: 0,
      }),
    )
  })

  it('rolls the draft back and keeps the typed title when the server fails', async () => {
    const { user, input } = await openComposer()
    updateSimulationSettings({ failureRate: 1 })

    await user.type(input, 'Ship the dark mode toggle{Enter}')

    expect(
      await screen.findByText('The server did not respond. Check your connection and try again.'),
    ).toHaveAttribute('role', 'alert')
    expect(input).toHaveValue('Ship the dark mode toggle')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => {
      expect(screen.queryByText(/^Ship the dark mode toggle \(/)).not.toBeInTheDocument()
    })
    expect(loadDatabase().issues.some((issue) => issue.title === 'Ship the dark mode toggle')).toBe(
      false,
    )
  })
})
