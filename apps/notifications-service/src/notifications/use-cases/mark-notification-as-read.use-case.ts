import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { NotificationsRepository } from '../notifications.repository'
import { NotificationResponseDto } from '../dto/notification-response.dto'
import { NotificationMapper } from '../mappers/notification.mapper'

@Injectable()
export class MarkNotificationAsReadUseCase {
  private readonly logger = new Logger(MarkNotificationAsReadUseCase.name)

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationMapper: NotificationMapper,
  ) {}

  async execute(id: string, userId: string): Promise<NotificationResponseDto> {
    this.logger.log(`Marking notification ${id} as read for user: ${userId}`)

    const updated = await this.notificationsRepository.markAsRead(id, userId)

    if (!updated) {
      this.logger.warn(
        `Notification ${id} not found or not owned by user: ${userId}`,
      )
      throw new NotFoundException('Notification not found')
    }

    const notification = await this.findNotification(id, userId)

    this.logger.log(`Notification ${id} marked as read`)

    return this.notificationMapper.toResponseDto(notification)
  }

  private async findNotification(id: string, userId: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    })

    if (!notification) {
      throw new NotFoundException('Notification not found')
    }

    return notification
  }
}
