export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Task {
  id: string
  title: string
  description: string
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
  description: string
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

export interface CreateCommentRequest {
  content: string
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  search?: string
}
