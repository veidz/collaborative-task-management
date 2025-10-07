export enum NotificationType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_DELETED = 'TASK_DELETED',
  COMMENT_CREATED = 'COMMENT_CREATED',
}

export interface NotificationResponse {
  id: string
  userId: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: Date
}
