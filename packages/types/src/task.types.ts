export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
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
