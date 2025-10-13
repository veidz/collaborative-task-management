import { Injectable } from '@nestjs/common'
import { Notification } from '../entities/notification.entity'
import { NotificationResponseDto } from '../dto/notification-response.dto'

@Injectable()
export class NotificationMapper {
  toResponseDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    }
  }

  toResponseDtoList(notifications: Notification[]): NotificationResponseDto[] {
    return notifications.map((notification) => this.toResponseDto(notification))
  }
}
