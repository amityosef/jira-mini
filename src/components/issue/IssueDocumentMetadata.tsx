import { STATUS_THEME_COLORS } from '@/lib/theme'

import type { Issue, IssueStatus } from '@/types'

const DESCRIPTION_LIMIT = 155

type IssueDocumentMetadataProps = {
  issue: Issue
  status: IssueStatus
}

function summarize(issue: Issue): string {
  const singleLine = issue.description.replace(/\s+/g, ' ').trim()
  if (!singleLine) return `${issue.id}: ${issue.title}`
  if (singleLine.length <= DESCRIPTION_LIMIT) return singleLine
  return `${singleLine.slice(0, DESCRIPTION_LIMIT - 1).trimEnd()}…`
}

export function IssueDocumentMetadata({ issue, status }: IssueDocumentMetadataProps) {
  return (
    <>
      <title>{`${issue.id} · ${issue.title} · SprintFlow`}</title>
      <meta name="description" content={summarize(issue)} />
      <meta name="theme-color" content={STATUS_THEME_COLORS[status]} />
    </>
  )
}
