import { io, Socket } from 'socket.io-client'

export interface NotificationPayload {
  id: string
  userId: string
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'COMMENT_CREATED'
  message: string
  read: boolean
  createdAt: Date
}

interface ServerToClientEvents {
  connected: (data: { message: string; userId: string }) => void
  notification: (notification: NotificationPayload) => void
  error: (error: { message: string }) => void
}

interface ClientToServerEvents {
  ping: () => void
}

export class WebSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  connect(token: string): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket?.connected) {
      return this.socket
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

    this.socket = io(`${wsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    })

    this.setupEventHandlers()

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.reconnectAttempts = 0
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket
  }

  private setupEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected via API Gateway')
      this.reconnectAttempts = 0
    })

    this.socket.on('connected', (data) => {
      console.log('[WebSocket] Connection acknowledged:', data)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached')
        this.disconnect()
      }
    })

    this.socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error)
    })
  }
}

export const websocketService = new WebSocketService()
