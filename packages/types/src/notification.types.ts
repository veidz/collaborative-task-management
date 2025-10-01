export enum NotificationType {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_ASSIGNED = 'task_assigned',
  COMMENT_CREATED = 'comment_created',
}

export interface NotificationResponse {
  id: string
  userId: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: Date
}

export interface TaskCreatedEvent {
  taskId: string
  title: string
  assignees: string[]
  createdBy: string
}

export interface TaskUpdatedEvent {
  taskId: string
  title: string
  changes: Record<string, unknown>
  assignees: string[]
  updatedBy: string
}

export interface CommentCreatedEvent {
  commentId: string
  taskId: string
  taskTitle: string
  content: string
  authorId: string
  taskAssignees: string[]
}
