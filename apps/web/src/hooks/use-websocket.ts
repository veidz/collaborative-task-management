import { useEffect, useState, useCallback } from 'react'
import { Socket } from 'socket.io-client'
import { websocketService } from '@/lib/websocket'
import { useAuthStore } from '@/stores/auth-store'
import { NotificationPayload } from '@packages/types'

interface ServerToClientEvents {
  connected: (data: { message: string; userId: string }) => void
  notification: (notification: NotificationPayload) => void
  error: (error: { message: string }) => void
}

interface ClientToServerEvents {
  ping: () => void
}

export function useWebSocket() {
  const { accessToken, isAuthenticated } = useAuthStore()
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      websocketService.disconnect()
      setIsConnected(false)
      setSocket(null)
      return
    }

    const socketInstance = websocketService.connect(accessToken)
    setSocket(socketInstance)

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socketInstance.on('connect', handleConnect)
    socketInstance.on('disconnect', handleDisconnect)

    setIsConnected(socketInstance.connected)

    return () => {
      socketInstance.off('connect', handleConnect)
      socketInstance.off('disconnect', handleDisconnect)
    }
  }, [isAuthenticated, accessToken])

  const onNotification = useCallback(
    (callback: (notification: NotificationPayload) => void) => {
      if (!socket) {
        console.log('[useWebSocket] onNotification called but socket is null')
        return () => {}
      }

      console.log('[useWebSocket] Subscribing to notification event')

      const wrappedCallback = (notification: NotificationPayload) => {
        console.log('[useWebSocket] Notification event received:', notification)
        callback(notification)
      }

      socket.on('notification', wrappedCallback)

      return () => {
        console.log('[useWebSocket] Unsubscribing from notification event')
        socket.off('notification', wrappedCallback)
      }
    },
    [socket],
  )

  return {
    isConnected,
    socket,
    onNotification,
  }
}
