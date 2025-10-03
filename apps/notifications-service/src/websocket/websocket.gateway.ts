import { Logger } from '@nestjs/common'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConnectionManagerService } from './connection-manager.service'
import {
  ServerToClientEvents,
  ClientToServerEvents,
  NotificationPayload,
} from './interfaces/websocket-events.interface'
import { JwtPayload } from '../common/strategies/jwt.strategy'

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>

  private readonly logger = new Logger(NotificationsGateway.name)

  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized')
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client)

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`)
        client.emit('error', { message: 'Unauthorized - missing token' })
        client.disconnect()
        return
      }

      let payload: JwtPayload
      try {
        payload = await this.jwtService.verifyAsync(token)
      } catch (error) {
        this.logger.warn(
          `Connection rejected: Invalid token - ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
        client.emit('error', { message: 'Unauthorized - invalid token' })
        client.disconnect()
        return
      }

      if (!payload.sub || !payload.email || !payload.username) {
        this.logger.warn(`Connection rejected: Invalid token payload`)
        client.emit('error', {
          message: 'Unauthorized - invalid token payload',
        })
        client.disconnect()
        return
      }

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      }

      const userId = payload.sub

      this.connectionManager.addConnection(userId, client.id)

      client.emit('connected', {
        message: 'Connected to notifications service',
        userId,
      })

      this.logger.log(`Client connected: ${client.id} (user: ${userId})`)
    } catch (error) {
      this.logger.error(
        `Error handling connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      client.emit('error', { message: 'Connection failed' })
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.id

    if (userId) {
      this.connectionManager.removeConnection(userId)
    }

    this.logger.log(
      `Client disconnected: ${client.id} (user: ${userId || 'unknown'})`,
    )
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket): void {
    this.logger.debug(`Ping received from: ${client.id}`)
    client.emit('notification', {
      id: 'ping',
      userId: client.data.user?.id,
      type: 'PING',
      message: 'pong',
      read: true,
      createdAt: new Date(),
    })
  }

  sendNotificationToUser(
    userId: string,
    notification: NotificationPayload,
  ): boolean {
    const socketId = this.connectionManager.getSocketId(userId)

    if (!socketId) {
      this.logger.warn(
        `User ${userId} not connected, skipping WebSocket notification`,
      )
      return false
    }

    this.server.to(socketId).emit('notification', notification)
    this.logger.log(`Notification sent to user ${userId} via WebSocket`)

    return true
  }

  broadcastToAll(notification: NotificationPayload): void {
    this.server.emit('notification', notification)
    this.logger.log('Notification broadcasted to all connected users')
  }

  getConnectedUsersCount(): number {
    return this.connectionManager.getConnectedUsersCount()
  }

  private extractToken(client: Socket): string | null {
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token
    }

    const authHeader = client.handshake.headers?.authorization
    if (authHeader && typeof authHeader === 'string') {
      if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7)
      }
      return authHeader
    }

    return null
  }
}
