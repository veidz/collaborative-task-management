export enum TaskEventPattern {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  TASK_ASSIGNED = 'task.assigned',
  TASK_UNASSIGNED = 'task.unassigned',
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

export interface TaskAssignedEvent {
  taskId: string
  assignedUserIds: string[]
  assignedBy: string
  assignedAt: Date
}

export interface TaskUnassignedEvent {
  taskId: string
  unassignedUserIds: string[]
  unassignedBy: string
  unassignedAt: Date
}

export interface CommentCreatedEvent {
  commentId: string
  taskId: string
  content: string
  authorId: string
  createdAt: Date
}
