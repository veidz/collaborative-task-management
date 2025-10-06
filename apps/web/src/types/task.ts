import type {
  PaginatedResponse,
  TaskStatus,
  TaskPriority,
} from '@packages/types'
export type { TaskStatus, TaskPriority, PaginatedResponse }

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  deadline: string | null
  assigneeIds: string[]
  createdById: string
  createdAt: string
  updatedAt: string
  assignees?: User[]
  createdBy?: User
  comments?: Comment[]
  _count?: {
    comments: number
  }
}

export interface Comment {
  id: string
  content: string
  taskId: string
  authorId: string
  createdAt: string
  author?: User
}

export interface User {
  id: string
  email: string
  username: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string
  assigneeIds?: string[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string
  assigneeIds?: string[]
}

export interface AssignUsersRequest {
  userIds: string[]
}

export interface UnassignUsersRequest {
  userIds: string[]
}

export interface CreateCommentRequest {
  content: string
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  assignedToMe?: boolean
  assignedTo?: string
  page?: number
  limit?: number
}

export interface PaginatedCommentsResponse {
  data: Comment[]
  total: number
  page: number
  limit: number
  totalPages: number
}
