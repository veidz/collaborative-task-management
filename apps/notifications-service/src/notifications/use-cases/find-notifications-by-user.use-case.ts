import { Injectable, Logger } from '@nestjs/common'
import { NotificationsRepository } from '../notifications.repository'
import { PaginatedNotificationsResponseDto } from '../dto/paginated-notifications-response.dto'
import { NotificationMapper } from '../mappers/notification.mapper'

@Injectable()
export class FindNotificationsByUserUseCase {
  private readonly logger = new Logger(FindNotificationsByUserUseCase.name)

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationMapper: NotificationMapper,
  ) {}

  async execute(
    userId: string,
    page: number = 1,
    limit: number = 10,
    unreadOnly: boolean = false,
  ): Promise<PaginatedNotificationsResponseDto> {
    this.logger.log(`Fetching notifications for user: ${userId}`)

    const [notifications, total] =
      await this.notificationsRepository.findByUser(
        userId,
        page,
        limit,
        unreadOnly,
      )

    const totalPages = Math.ceil(total / limit)

    this.logger.log(`Found ${total} notifications for user: ${userId}`)

    return {
      data: this.notificationMapper.toResponseDtoList(notifications),
      total,
      page,
      limit,
      totalPages,
    }
  }
}
