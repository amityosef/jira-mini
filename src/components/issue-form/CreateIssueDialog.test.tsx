import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { loadDatabase } from '@/mocks/database'
import { updateSimulationSettings } from '@/mocks/simulation'

import { CreateIssueDialog } from '@/components/issue-form/CreateIssueDialog'
import { renderWithProviders } from '@/test/renderWithProviders'

const EXISTING_TITLE = 'Payment intent created twice when “Place order” is double-clicked'

async function renderDialog() {
  const onClose = vi.fn()
  const view = renderWithProviders(<CreateIssueDialog onClose={onClose} />)
  const title = await screen.findByRole('textbox', { name: 'Title' })
  return { ...view, onClose, title }
}

describe('CreateIssueDialog', () => {
  it('is a labelled dialog that defaults to the current sprint', async () => {
    await renderDialog()

    const dialog = screen.getByRole('dialog', { name: 'New issue' })
    expect(dialog).toHaveAccessibleDescription('Capture the problem, its impact and who owns it.')
    expect(screen.getByRole('combobox', { name: 'Sprint' })).toHaveValue('sprint-24')
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('todo')
  })

  it('links validation errors to their fields and keeps every submitted value', async () => {
    const { user, title, onClose } = await renderDialog()

    await user.type(title, 'ab')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Priority' }), 'urgent')
    await user.type(screen.getByRole('textbox', { name: 'Labels' }), 'Dark Mode')
    await user.click(screen.getByRole('button', { name: 'Create issue' }))

    expect(
      await screen.findByText('Check the title and labels, then try again.'),
    ).toBeInTheDocument()
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Use at least 3 characters.')
    expect(title).toHaveValue('ab')
    const labels = screen.getByRole('textbox', { name: 'Labels' })
    expect(labels).toHaveAttribute('aria-invalid', 'true')
    expect(labels).toHaveAccessibleDescription(/can only use lowercase letters/)
    expect(labels).toHaveValue('Dark Mode')
    expect(screen.getByRole('combobox', { name: 'Priority' })).toHaveValue('urgent')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows the server duplicate-title rejection on the title field', async () => {
    const { user, title, onClose } = await renderDialog()

    await user.click(title)
    await user.paste(EXISTING_TITLE)
    await user.click(screen.getByRole('button', { name: 'Create issue' }))

    expect(
      await screen.findByText('An issue with this title already exists in the same sprint.'),
    ).toBeInTheDocument()
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveValue(EXISTING_TITLE)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps the values and explains the failure when the server is unreachable', async () => {
    const { user, title, onClose } = await renderDialog()
    updateSimulationSettings({ failureRate: 1 })

    await user.click(title)
    await user.paste('Add a status page link to the footer')
    await user.click(screen.getByRole('button', { name: 'Create issue' }))

    expect(await screen.findByText('Couldn’t create the issue')).toBeInTheDocument()
    expect(
      screen.getByText('The server did not respond. Check your connection and try again.'),
    ).toBeInTheDocument()
    expect(title).toHaveValue('Add a status page link to the footer')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('creates the issue and closes on success', async () => {
    const { user, title, onClose } = await renderDialog()

    await user.click(title)
    await user.paste('Add a status page link to the footer')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Assignee' }), 'usr-amara')
    await user.type(screen.getByRole('textbox', { name: 'Labels' }), 'ux, Footer')
    await user.click(screen.getByRole('button', { name: 'Create issue' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
    expect(loadDatabase().issues).toContainEqual(
      expect.objectContaining({
        title: 'Add a status page link to the footer',
        assigneeId: 'usr-amara',
        status: 'todo',
        priority: 'medium',
        points: 3,
        sprintId: 'sprint-24',
        labels: ['ux', 'footer'],
      }),
    )
  })

  it('closes from both the Cancel and the icon button', async () => {
    const { user, onClose } = await renderDialog()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
