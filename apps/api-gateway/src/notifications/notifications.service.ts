import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto'
import { NotificationResponseDto } from './dto/notification-response.dto'
import { PaginatedNotificationsResponseDto } from './dto/paginated-notifications-response.dto'
import { UnreadCountResponseDto } from './dto/unread-count-response.dto'
import { HttpProxyService } from '../common/services/http-proxy.service'
import { ErrorHandlerService } from '../common/services/error-handler.service'

@Injectable()
export class NotificationsService extends HttpProxyService {
  protected readonly logger = new Logger(NotificationsService.name)
  protected readonly serviceUrl: string
  protected readonly serviceName = 'Notifications Service'

  constructor(
    httpService: HttpService,
    errorHandler: ErrorHandlerService,
    configService: ConfigService,
  ) {
    super(httpService, errorHandler)

    const url = configService.get<string>('services.notifications.url')

    if (!url) {
      throw new Error(
        'NOTIFICATIONS_SERVICE_URL is not defined in environment variables',
      )
    }

    this.serviceUrl = url
  }

  async findAll(
    query: GetNotificationsQueryDto,
    token: string,
  ): Promise<PaginatedNotificationsResponseDto> {
    this.logger.log(
      'Proxying get all notifications request to notifications-service',
    )
    const result = await this.get<PaginatedNotificationsResponseDto>(
      '/notifications',
      undefined,
      token,
      query as Record<string, unknown>,
    )
    this.logger.log('Notifications retrieved successfully via proxy')
    return result
  }

  async getUnreadCount(token: string): Promise<UnreadCountResponseDto> {
    this.logger.log(
      'Proxying get unread count request to notifications-service',
    )
    const result = await this.get<UnreadCountResponseDto>(
      '/notifications/unread-count',
      undefined,
      token,
    )
    this.logger.log('Unread count retrieved successfully via proxy')
    return result
  }

  async markAsRead(
    id: string,
    token: string,
  ): Promise<NotificationResponseDto> {
    this.logger.log(
      `Proxying mark notification ${id} as read request to notifications-service`,
    )
    const result = await this.put<NotificationResponseDto>(
      `/notifications/${id}/read`,
      {},
      undefined,
      token,
    )
    this.logger.log(`Notification ${id} marked as read successfully via proxy`)
    return result
  }

  async markAllAsRead(token: string): Promise<{ updated: number }> {
    this.logger.log(
      'Proxying mark all notifications as read request to notifications-service',
    )
    const result = await this.put<{ updated: number }>(
      '/notifications/read-all',
      {},
      undefined,
      token,
    )
    this.logger.log('All notifications marked as read successfully via proxy')
    return result
  }
}
