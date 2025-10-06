export enum NotificationType {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_ASSIGNED = 'task_assigned',
  TASK_DELETED = 'task_deleted',
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
