export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export interface CreateTaskDto {
  title: string
  description?: string
  deadline?: Date
  priority: TaskPriority
  status: TaskStatus
  assignees: string[]
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  deadline?: Date
  priority?: TaskPriority
  status?: TaskStatus
  assignees?: string[]
}

export interface QueryTasksDto {
  page?: number
  limit?: number
  status?: TaskStatus
  priority?: TaskPriority
  assignee?: string
  search?: string
}

export interface TaskResponse {
  id: string
  title: string
  description?: string
  deadline?: Date
  priority: TaskPriority
  status: TaskStatus
  assignees: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TaskListResponse {
  data: TaskResponse[]
  total: number
  page: number
  limit: number
}

export interface CreateCommentDto {
  content: string
}

export interface CommentResponse {
  id: string
  content: string
  taskId: string
  authorId: string
  createdAt: Date
}
