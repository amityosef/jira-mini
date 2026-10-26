import { useBoard } from '@/context/board'
import { useWorkspace } from '@/context/workspace'
import { CANVAS_THEME_COLORS } from '@/lib/theme'

export function AppMetadata() {
  const { scope } = useBoard()
  const { sprints, workspace } = useWorkspace()
  const scopeName =
    scope.kind === 'backlog'
      ? 'Team backlog'
      : (sprints.find((sprint) => sprint.id === scope.sprintId)?.name ?? 'Board')

  return (
    <>
      <title>{`${scopeName} · ${workspace.teamName} · SprintFlow`}</title>
      <meta
        name="description"
        content={`${scopeName} for ${workspace.teamName}: plan, track and ship work on the SprintFlow board.`}
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: light)"
        content={CANVAS_THEME_COLORS.light}
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content={CANVAS_THEME_COLORS.dark}
      />
    </>
  )
}
