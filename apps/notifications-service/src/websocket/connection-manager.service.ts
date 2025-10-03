import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class ConnectionManagerService {
  private readonly logger = new Logger(ConnectionManagerService.name)
  private readonly connections = new Map<string, string>()

  addConnection(userId: string, socketId: string): void {
    this.connections.set(userId, socketId)
    this.logger.log(`User connected: ${userId} (socket: ${socketId})`)
    this.logger.log(`Total connections: ${this.connections.size}`)
  }

  removeConnection(userId: string): void {
    this.connections.delete(userId)
    this.logger.log(`User disconnected: ${userId}`)
    this.logger.log(`Total connections: ${this.connections.size}`)
  }

  getSocketId(userId: string): string | undefined {
    return this.connections.get(userId)
  }

  isUserConnected(userId: string): boolean {
    return this.connections.has(userId)
  }

  getConnectedUsersCount(): number {
    return this.connections.size
  }

  getAllConnectedUserIds(): string[] {
    return Array.from(this.connections.keys())
  }
}
