import { ReactNode, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNotificationToast } from '@/hooks/use-notification-toast'
import { useWebSocket } from '@/hooks/use-websocket'

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const queryClient = useQueryClient()
  const { onNotification } = useWebSocket()

  useNotificationToast()

  useEffect(() => {
    console.log('[NotificationProvider] Setting up query invalidation listener')

    const unsubscribe = onNotification((notification) => {
      console.log(
        '[NotificationProvider] Notification received, updating cache optimistically:',
        notification.id,
      )

      queryClient.setQueryData<{ count: number }>(
        ['notifications', 'unread-count'],
        (old) => {
          const newCount = (old?.count ?? 0) + 1
          console.log(
            '[NotificationProvider] Updating unread count:',
            old?.count,
            '->',
            newCount,
          )
          return { count: newCount }
        },
      )

      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })

    return () => {
      console.log(
        '[NotificationProvider] Cleaning up query invalidation listener',
      )
      unsubscribe()
    }
  }, [onNotification, queryClient])

  return <>{children}</>
}
