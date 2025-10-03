export interface TaskCreatedEvent {
  taskId: string
  title: string
  description: string | null
  status: string
  priority: string
  deadline: Date | null
  createdById: string
  createdAt: Date
}

export interface TaskUpdatedEvent {
  taskId: string
  title?: string
  description?: string | null
  status?: string
  priority?: string
  deadline?: Date | null
  updatedById: string
  updatedAt: Date
  changes: string[]
}

export interface TaskDeletedEvent {
  taskId: string
  deletedById: string
  deletedAt: Date
}

export enum TaskEventPattern {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
}
