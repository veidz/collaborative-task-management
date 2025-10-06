export interface ServerToClientEvents {
  notification: (data: NotificationPayload) => void
  connected: (data: { message: string; userId: string }) => void
  error: (data: { message: string }) => void
}

export interface ClientToServerEvents {
  ping: () => void
}

export interface NotificationPayload {
  id: string
  userId: string
  type: string
  message: string
  read: boolean
  createdAt: Date
}
