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
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client'
import { ConfigService } from '@nestjs/config'

interface JwtPayload {
  sub: string
  email: string
  username: string
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(NotificationsWebSocketGateway.name)
  private readonly backendConnections = new Map<string, ClientSocket>()
  private readonly notificationsServiceWsUrl: string

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('services.notifications.url')
    if (!url) {
      throw new Error('NOTIFICATIONS_SERVICE_URL not configured')
    }
    this.notificationsServiceWsUrl = url.replace('http://', 'ws://')
  }

  afterInit() {
    this.logger.log('WebSocket Gateway initialized on /notifications')
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client)

      if (!token) {
        this.logger.warn('Connection rejected: No token')
        client.emit('error', { message: 'Unauthorized - missing token' })
        client.disconnect()
        return
      }

      let payload: JwtPayload
      try {
        payload = await this.jwtService.verifyAsync(token)
      } catch {
        this.logger.warn('Connection rejected: Invalid token')
        client.emit('error', { message: 'Unauthorized - invalid token' })
        client.disconnect()
        return
      }

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      }

      const backendSocket = ioClient(
        `${this.notificationsServiceWsUrl}/notifications`,
        {
          auth: { token },
          transports: ['websocket'],
        },
      )

      this.backendConnections.set(client.id, backendSocket)

      backendSocket.on('connect', () => {
        this.logger.log(
          `Backend connected for client ${client.id} (user: ${payload.sub})`,
        )
      })

      backendSocket.on('connected', (data) => {
        client.emit('connected', data)
      })

      backendSocket.on('notification', (notification) => {
        client.emit('notification', notification)
      })

      backendSocket.on('error', (error) => {
        client.emit('error', error)
      })

      backendSocket.on('disconnect', () => {
        this.logger.log(`Backend disconnected for client ${client.id}`)
      })

      backendSocket.on('connect_error', (error) => {
        this.logger.error(`Backend connection error: ${error.message}`)
        client.emit('error', { message: 'Backend connection failed' })
      })

      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`)
    } catch (error) {
      this.logger.error(
        `Connection error: ${error instanceof Error ? error.message : 'Unknown'}`,
      )
      client.emit('error', { message: 'Connection failed' })
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const backendSocket = this.backendConnections.get(client.id)

    if (backendSocket) {
      backendSocket.disconnect()
      this.backendConnections.delete(client.id)
    }

    this.logger.log(
      `Client disconnected: ${client.id} (user: ${client.data.user?.id || 'unknown'})`,
    )
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket): void {
    const backendSocket = this.backendConnections.get(client.id)
    if (backendSocket) {
      backendSocket.emit('ping')
    }
  }

  private extractToken(client: Socket): string | null {
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token
    }

    const authHeader = client.handshake.headers?.authorization
    if (authHeader && typeof authHeader === 'string') {
      return authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader
    }

    return null
  }
}
