import { Injectable, Logger } from '@nestjs/common'
import { NotificationsRepository } from '../notifications.repository'

@Injectable()
export class MarkAllNotificationsAsReadUseCase {
  private readonly logger = new Logger(MarkAllNotificationsAsReadUseCase.name)

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async execute(userId: string): Promise<{ updated: number }> {
    this.logger.log(`Marking all notifications as read for user: ${userId}`)

    const updated = await this.notificationsRepository.markAllAsRead(userId)

    this.logger.log(
      `Marked ${updated} notifications as read for user: ${userId}`,
    )

    return { updated }
  }
}
