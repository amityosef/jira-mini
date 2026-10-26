import type { IssueStatus } from '@/types'

export const STATUS_THEME_COLORS = {
  backlog: '#a1a1aa',
  todo: '#0ea5e9',
  in_progress: '#f59e0b',
  in_review: '#8b5cf6',
  done: '#10b981',
} as const satisfies Record<IssueStatus, string>

export const CANVAS_THEME_COLORS = {
  light: '#fafafa',
  dark: '#09090b',
} as const
