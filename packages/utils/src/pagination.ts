import type { PaginationMeta } from '@packages/types'

export interface PaginationOptions {
  page?: number
  limit?: number
}

export function getPaginationParams(options: PaginationOptions) {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 10))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
