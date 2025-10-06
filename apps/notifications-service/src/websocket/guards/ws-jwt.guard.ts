import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { JwtPayload } from '@packages/types'

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name)

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient()
      const token = this.extractToken(client)

      if (!token) {
        this.logger.warn('No token provided in WebSocket connection')
        throw new WsException('Unauthorized - missing token')
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(token)

      if (!payload.sub || !payload.email || !payload.username) {
        this.logger.warn('Invalid token payload in WebSocket connection')
        throw new WsException('Unauthorized - invalid token')
      }

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      }

      this.logger.log(`WebSocket authenticated for user: ${payload.sub}`)

      return true
    } catch (error) {
      this.logger.error(
        `WebSocket authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      throw new WsException('Unauthorized')
    }
  }

  private extractToken(client: Socket): string | null {
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token
    }

    if (client.handshake.query?.token) {
      return client.handshake.query.token as string
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
