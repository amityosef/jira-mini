export const ISSUE_DRAG_TYPE = 'application/x-sprintflow-issue'

export function carriesIssue(dataTransfer: DataTransfer): boolean {
  return dataTransfer.types.includes(ISSUE_DRAG_TYPE)
}
