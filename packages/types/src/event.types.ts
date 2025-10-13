export enum TaskEventPattern {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  COMMENT_CREATED = 'task.comment.created',
}

export interface TaskCreatedEvent {
  taskId: string
  title: string
  description: string | null
  status: string
  priority: string
  deadline: Date | null
  createdById: string
  assigneeIds: string[]
  createdAt: Date
}

export interface TaskUpdatedEvent {
  taskId: string
  title?: string
  description?: string
  status?: string
  priority?: string
  deadline?: Date
  updatedById: string
  assigneeIds?: string[]
  updatedAt: Date
  changes: string[]
}

export interface TaskDeletedEvent {
  taskId: string
  deletedById: string
  deletedAt: Date
}

export interface CommentCreatedEvent {
  commentId: string
  taskId: string
  content: string
  authorId: string
  createdAt: Date
}
