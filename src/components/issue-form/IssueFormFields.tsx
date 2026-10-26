import { useWorkspace } from '@/context/workspace'
import { formatPoints } from '@/lib/format'
import {
  DESCRIPTION_MAX_LENGTH,
  type FieldErrors,
  type IssueFormValues,
  TITLE_MAX_LENGTH,
} from '@/lib/issueForm'
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '@/lib/workflow'

import { SelectField, TextAreaField, TextField } from '@/components/ui/Field'

import { ISSUE_PRIORITIES, ISSUE_STATUSES, ISSUE_TYPES, STORY_POINTS } from '@/types'

type IssueFormFieldsProps = {
  values: IssueFormValues
  fieldErrors: FieldErrors
}

export function IssueFormFields({ values, fieldErrors }: IssueFormFieldsProps) {
  const { members, sprints } = useWorkspace()
  const selectableSprints = sprints.filter(
    (sprint) => sprint.state !== 'completed' || sprint.id === values.sprintId,
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        className="sm:col-span-2"
        label="Title"
        name="title"
        autoComplete="off"
        maxLength={TITLE_MAX_LENGTH}
        aria-required="true"
        defaultValue={values.title}
        error={fieldErrors.title}
      />
      <TextAreaField
        className="sm:col-span-2"
        label="Description"
        name="description"
        rows={4}
        maxLength={DESCRIPTION_MAX_LENGTH}
        hint="Optional. Describe the impact and how to reproduce it."
        defaultValue={values.description}
        error={fieldErrors.description}
      />
      <SelectField
        key={`status-${values.status}`}
        label="Status"
        name="status"
        defaultValue={values.status}
        error={fieldErrors.status}
      >
        {ISSUE_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </SelectField>
      <SelectField
        key={`priority-${values.priority}`}
        label="Priority"
        name="priority"
        defaultValue={values.priority}
        error={fieldErrors.priority}
      >
        {ISSUE_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </SelectField>
      <SelectField
        key={`type-${values.type}`}
        label="Type"
        name="type"
        defaultValue={values.type}
        error={fieldErrors.type}
      >
        {ISSUE_TYPES.map((type) => (
          <option key={type} value={type}>
            {TYPE_LABELS[type]}
          </option>
        ))}
      </SelectField>
      <SelectField
        key={`points-${values.points}`}
        label="Estimate"
        name="points"
        defaultValue={values.points}
        error={fieldErrors.points}
      >
        {STORY_POINTS.map((points) => (
          <option key={points} value={String(points)}>
            {points === 0 ? 'Unestimated' : formatPoints(points)}
          </option>
        ))}
      </SelectField>
      <SelectField
        key={`assignee-${values.assigneeId}`}
        label="Assignee"
        name="assigneeId"
        defaultValue={values.assigneeId}
      >
        <option value="">Unassigned</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </SelectField>
      <SelectField
        key={`sprint-${values.sprintId}`}
        label="Sprint"
        name="sprintId"
        defaultValue={values.sprintId}
      >
        <option value="">No sprint (team backlog)</option>
        {selectableSprints.map((sprint) => (
          <option key={sprint.id} value={sprint.id}>
            {sprint.state === 'active' ? `${sprint.name} (active)` : sprint.name}
          </option>
        ))}
      </SelectField>
      <TextField
        className="sm:col-span-2"
        label="Labels"
        name="labels"
        autoComplete="off"
        hint="Comma-separated, e.g. checkout, a11y"
        defaultValue={values.labels}
        error={fieldErrors.labels}
      />
    </div>
  )
}
