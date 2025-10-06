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
    const unsubscribe = onNotification(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    })

    return unsubscribe
  }, [onNotification, queryClient])

  return <>{children}</>
}
