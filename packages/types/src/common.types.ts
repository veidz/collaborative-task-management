export interface ApiError {
  statusCode: number
  message: string
  error: string
  timestamp: string
  path: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
