import { use, useId } from 'react'

import { useBoard } from '@/context/board'
import { TYPE_LABELS } from '@/lib/workflow'

import { DeleteIssueForm } from '@/components/issue/DeleteIssueForm'
import { IssueDocumentMetadata } from '@/components/issue/IssueDocumentMetadata'
import { IssueProperties } from '@/components/issue/IssueProperties'
import { IssueStatusForm } from '@/components/issue/IssueStatusForm'
import { TypeIcon } from '@/components/ui/IssueIcons'

import type { Issue } from '@/types'

type IssueDetailsProps = { issuePromise: Promise<Issue> }

export function IssueDetails({ issuePromise }: IssueDetailsProps) {
  const { issuesById } = useBoard()
  const titleId = useId()
  const descriptionHeadingId = useId()
  const issue = use(issuePromise)
  const boardIssue = issuesById.get(issue.id)
  const liveStatus = boardIssue?.status ?? issue.status

  return (
    <article aria-labelledby={titleId} className="flex min-w-0 flex-col gap-6">
      <IssueDocumentMetadata issue={issue} status={liveStatus} />
      <header className="flex min-w-0 flex-col gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-fg-muted">
          <TypeIcon type={issue.type} className="size-3.5" />
          {TYPE_LABELS[issue.type]}
        </p>
        <h2 id={titleId} className="text-xl leading-snug font-semibold break-words text-fg">
          {issue.title}
        </h2>
      </header>
      <IssueStatusForm issueId={issue.id} status={liveStatus} isDisabled={!boardIssue} />
      <IssueProperties issue={issue} />
      <section aria-labelledby={descriptionHeadingId} className="flex min-w-0 flex-col gap-2">
        <h3 id={descriptionHeadingId} className="text-sm font-semibold text-fg">
          Description
        </h3>
        {issue.description ? (
          <p className="text-sm leading-relaxed break-words whitespace-pre-line text-fg">
            {issue.description}
          </p>
        ) : (
          <p className="text-sm text-fg-subtle">No description yet.</p>
        )}
      </section>
      <DeleteIssueForm issueId={issue.id} />
    </article>
  )
}
