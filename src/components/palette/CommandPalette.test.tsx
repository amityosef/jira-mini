import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { useCommandPalette } from '@/hooks/useCommandPalette'
import { loadDatabase } from '@/mocks/database'

import { CommandPalette } from '@/components/palette/CommandPalette'
import { renderWithProviders } from '@/test/renderWithProviders'

type HarnessProps = {
  onCreateIssue?: () => void
}

function PaletteHarness({ onCreateIssue = () => undefined }: HarnessProps) {
  const { isOpen, contextIssueId, open, close, shortcutRef } = useCommandPalette()
  return (
    <div ref={shortcutRef}>
      <div data-issue-id="SF-112">
        <button type="button">Focusable card</button>
      </div>
      <button
        type="button"
        onClick={() => {
          open('SF-112')
        }}
      >
        Open with context
      </button>
      <output>{isOpen ? 'palette open' : 'palette closed'}</output>
      {isOpen && (
        <CommandPalette
          contextIssueId={contextIssueId}
          onClose={close}
          onCreateIssue={onCreateIssue}
        />
      )}
    </div>
  )
}

async function renderPalette(props: HarnessProps = {}) {
  const view = renderWithProviders(<PaletteHarness {...props} />)
  await screen.findByRole('button', { name: 'Open with context' })
  return view
}

function searchInput() {
  return screen.getByRole('combobox', { name: 'Search issues and commands' })
}

function paletteStatus() {
  return within(screen.getByRole('dialog', { name: 'Command palette' })).getByRole('status')
}

describe('CommandPalette', () => {
  test('opens with Ctrl+K and focuses the search field', async () => {
    const { user } = await renderPalette()
    await user.keyboard('{Control>}k{/Control}')
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toHaveAttribute('open')
    await waitFor(() => {
      expect(searchInput()).toHaveFocus()
    })
    expect(screen.getByText('palette open')).toBeInTheDocument()
  })

  test('toggles closed when the shortcut is pressed again', async () => {
    const { user } = await renderPalette()
    await user.keyboard('{Control>}k{/Control}')
    await screen.findByRole('dialog', { name: 'Command palette' })
    await user.keyboard('{Control>}k{/Control}')
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument()
  })

  test('filters issues as you type and announces the result count', async () => {
    const { user } = await renderPalette()
    await user.keyboard('{Control>}k{/Control}')
    await user.type(searchInput(), 'double')
    expect(await screen.findByRole('option', { name: /SF-112/ })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(1)
    })
    expect(paletteStatus()).toHaveTextContent('1 result')
  })

  test('shows an empty state when nothing matches', async () => {
    const { user } = await renderPalette()
    await user.keyboard('{Control>}k{/Control}')
    await user.type(searchInput(), 'zzqx')
    expect(await screen.findByText('No results for “zzqx”')).toBeInTheDocument()
    expect(paletteStatus()).toHaveTextContent('No results')
  })

  test('moves the active option with the arrow keys', async () => {
    const { user } = await renderPalette()
    await user.keyboard('{Control>}k{/Control}')
    await screen.findAllByRole('option')
    await waitFor(() => {
      expect(searchInput()).toHaveFocus()
    })
    const [first, second] = screen.getAllByRole('option')
    expect(searchInput()).toHaveAttribute('aria-activedescendant', first?.id)
    await user.keyboard('{ArrowDown}')
    expect(searchInput()).toHaveAttribute('aria-activedescendant', second?.id)
    expect(second).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowUp}{ArrowUp}')
    const options = screen.getAllByRole('option')
    expect(searchInput()).toHaveAttribute('aria-activedescendant', options.at(-1)?.id)
  })

  test('opens the matching issue on Enter and closes', async () => {
    const { user } = await renderPalette()
    await user.keyboard('{Control>}k{/Control}')
    await user.type(searchInput(), '112')
    const option = await screen.findByRole('option', { name: /SF-112/ })
    await waitFor(() => {
      expect(searchInput()).toHaveAttribute('aria-activedescendant', option.id)
    })
    await user.keyboard('{Enter}')
    expect(window.location.search).toBe('?issue=SF-112')
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument()
  })

  test('captures the focused card as context when opened with the shortcut', async () => {
    const { user } = await renderPalette()
    await user.click(screen.getByRole('button', { name: 'Focusable card' }))
    await user.keyboard('{Control>}k{/Control}')
    expect(await screen.findByRole('group', { name: 'Actions for SF-112' })).toBeInTheDocument()
  })

  test('runs a status command for the context issue', async () => {
    const { user } = await renderPalette()
    await user.click(screen.getByRole('button', { name: 'Open with context' }))
    await user.click(await screen.findByRole('option', { name: 'Move SF-112 to Done' }))
    expect(screen.getByText('palette closed')).toBeInTheDocument()
    await waitFor(() => {
      expect(loadDatabase().issues.find((issue) => issue.id === 'SF-112')?.status).toBe('done')
    })
  })

  test('hands off to the create dialog', async () => {
    const onCreateIssue = vi.fn()
    const { user } = await renderPalette({ onCreateIssue })
    await user.keyboard('{Control>}k{/Control}')
    await user.type(searchInput(), 'create')
    await user.click(await screen.findByRole('option', { name: 'Create issue' }))
    expect(onCreateIssue).toHaveBeenCalledOnce()
    expect(screen.getByText('palette closed')).toBeInTheDocument()
  })

  test('reports a native close back to its owner', async () => {
    const { user } = await renderPalette()
    await user.keyboard('{Control>}k{/Control}')
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' })
    if (!(dialog instanceof HTMLDialogElement)) throw new Error('Expected a native dialog')
    act(() => {
      dialog.close()
    })
    expect(screen.getByText('palette closed')).toBeInTheDocument()
  })
})
