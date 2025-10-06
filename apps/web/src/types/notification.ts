import { NotificationType } from '@packages/types'

export { NotificationType }

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: Date | string
}
