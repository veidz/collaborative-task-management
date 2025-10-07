import { useEffect, createElement } from 'react'
import { toast } from 'sonner'
import {
  Bell,
  CheckCircle2,
  Trash2,
  MessageSquare,
  LucideIcon,
} from 'lucide-react'
import { useWebSocket } from './use-websocket'
import { NotificationType } from '@/types/notification'

const getNotificationIcon = (type: NotificationType): LucideIcon => {
  switch (type) {
    case NotificationType.TASK_CREATED:
      return Bell
    case NotificationType.TASK_UPDATED:
      return CheckCircle2
    case NotificationType.TASK_DELETED:
      return Trash2
    case NotificationType.COMMENT_CREATED:
      return MessageSquare
    default:
      return Bell
  }
}

const getNotificationColor = (
  type: NotificationType,
): 'success' | 'info' | 'error' => {
  switch (type) {
    case NotificationType.TASK_CREATED:
      return 'success'
    case NotificationType.TASK_UPDATED:
      return 'info'
    case NotificationType.TASK_DELETED:
      return 'error'
    case NotificationType.COMMENT_CREATED:
      return 'info'
    default:
      return 'info'
  }
}

export function useNotificationToast() {
  const { onNotification } = useWebSocket()

  useEffect(() => {
    console.log('[useNotificationToast] Setting up notification listener')

    const unsubscribe = onNotification((notification) => {
      console.log('[useNotificationToast] Notification received:', notification)

      const Icon = getNotificationIcon(notification.type as NotificationType)
      const color = getNotificationColor(notification.type as NotificationType)

      const toastFn =
        color === 'success'
          ? toast.success
          : color === 'error'
            ? toast.error
            : toast.info

      console.log('[useNotificationToast] Showing toast with color:', color)

      toastFn(notification.message, {
        icon: createElement(Icon, { className: 'h-5 w-5' }),
        description: new Date(notification.createdAt).toLocaleTimeString(),
        action: {
          label: 'View',
          onClick: () => {
            console.log('Navigate to notification:', notification)
          },
        },
      })
    })

    return () => {
      console.log('[useNotificationToast] Cleaning up notification listener')
      unsubscribe()
    }
  }, [onNotification])
}
