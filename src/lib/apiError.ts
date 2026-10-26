import { assertNever } from '@/lib/assert'

import type { ApiFailure } from '@/types'

export class ApiError extends Error {
  readonly failure: ApiFailure

  constructor(failure: ApiFailure) {
    super(failure.message)
    this.name = 'ApiError'
    this.failure = failure
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isRetryableFailure(failure: ApiFailure): boolean {
  switch (failure.code) {
    case 'network':
      return true
    case 'not-found':
    case 'wip-limit':
    case 'duplicate-title':
      return false
    default:
      return assertNever(failure)
  }
}

export function isRetryableError(error: unknown): boolean {
  return !isApiError(error) || isRetryableFailure(error.failure)
}

export function describeError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}
