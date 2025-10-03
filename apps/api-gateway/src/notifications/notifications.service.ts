import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto'
import { NotificationResponseDto } from './dto/notification-response.dto'
import { PaginatedNotificationsResponseDto } from './dto/paginated-notifications-response.dto'
import { UnreadCountResponseDto } from './dto/unread-count-response.dto'

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name)
  private readonly notificationsServiceUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('services.notifications.url')

    if (!url) {
      throw new Error(
        'NOTIFICATIONS_SERVICE_URL is not defined in environment variables',
      )
    }

    this.notificationsServiceUrl = url
  }

  onModuleInit() {
    this.logger.log(
      `Notifications service URL configured: ${this.notificationsServiceUrl}`,
    )
  }

  async findAll(
    query: GetNotificationsQueryDto,
    token: string,
  ): Promise<PaginatedNotificationsResponseDto> {
    this.logger.log(
      'Proxying get all notifications request to notifications-service',
    )

    try {
      const response = await firstValueFrom(
        this.httpService.get<PaginatedNotificationsResponseDto>(
          `${this.notificationsServiceUrl}/notifications`,
          {
            params: query,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      )

      this.logger.log('Notifications retrieved successfully via proxy')
      return response.data
    } catch (error) {
      this.handleError(error, 'Failed to get notifications')
    }
  }

  async getUnreadCount(token: string): Promise<UnreadCountResponseDto> {
    this.logger.log(
      'Proxying get unread count request to notifications-service',
    )

    try {
      const response = await firstValueFrom(
        this.httpService.get<UnreadCountResponseDto>(
          `${this.notificationsServiceUrl}/notifications/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      )

      this.logger.log('Unread count retrieved successfully via proxy')
      return response.data
    } catch (error) {
      this.handleError(error, 'Failed to get unread count')
    }
  }

  async markAsRead(
    id: string,
    token: string,
  ): Promise<NotificationResponseDto> {
    this.logger.log(
      `Proxying mark notification ${id} as read request to notifications-service`,
    )

    try {
      const response = await firstValueFrom(
        this.httpService.put<NotificationResponseDto>(
          `${this.notificationsServiceUrl}/notifications/${id}/read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      )

      this.logger.log(
        `Notification ${id} marked as read successfully via proxy`,
      )
      return response.data
    } catch (error) {
      this.handleError(error, `Failed to mark notification ${id} as read`)
    }
  }

  async markAllAsRead(token: string): Promise<{ updated: number }> {
    this.logger.log(
      'Proxying mark all notifications as read request to notifications-service',
    )

    try {
      const response = await firstValueFrom(
        this.httpService.put<{ updated: number }>(
          `${this.notificationsServiceUrl}/notifications/read-all`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      )

      this.logger.log('All notifications marked as read successfully via proxy')
      return response.data
    } catch (error) {
      this.handleError(error, 'Failed to mark all notifications as read')
    }
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status
      const responseMessage = error.response?.data?.message || error.message

      this.logger.error(`${message}: ${responseMessage}`)

      if (status === 400) {
        throw new BadRequestException(responseMessage)
      }

      if (status === 404) {
        throw new NotFoundException(responseMessage)
      }

      if (status === 401 || status === 403) {
        throw new BadRequestException('Unauthorized')
      }

      throw new InternalServerErrorException(responseMessage)
    }

    if (error instanceof Error) {
      this.logger.error(`${message}: ${error.message}`)
      throw new InternalServerErrorException(error.message)
    }

    this.logger.error(`${message}: Unknown error`)
    throw new InternalServerErrorException('An unexpected error occurred')
  }
}
