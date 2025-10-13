import { Injectable, Logger } from '@nestjs/common'
import { NotificationsRepository } from '../notifications.repository'

@Injectable()
export class CountUnreadNotificationsUseCase {
  private readonly logger = new Logger(CountUnreadNotificationsUseCase.name)

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    this.logger.log(`Counting unread notifications for user: ${userId}`)

    const count = await this.notificationsRepository.countUnread(userId)

    this.logger.log(`User ${userId} has ${count} unread notifications`)

    return count
  }
}
