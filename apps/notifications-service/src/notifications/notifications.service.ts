import { Injectable } from '@nestjs/common'
import { Notification } from './entities/notification.entity'
import { NotificationResponseDto } from './dto/notification-response.dto'
import { PaginatedNotificationsResponseDto } from './dto/paginated-notifications-response.dto'
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
  CommentCreatedEvent,
} from '../events/interfaces/task-events.interface'
import {
  CreateTaskCreatedNotificationsUseCase,
  CreateTaskUpdatedNotificationUseCase,
  CreateTaskDeletedNotificationUseCase,
  CreateCommentCreatedNotificationUseCase,
  FindNotificationsByUserUseCase,
  MarkNotificationAsReadUseCase,
  MarkAllNotificationsAsReadUseCase,
  CountUnreadNotificationsUseCase,
} from './use-cases'

@Injectable()
export class NotificationsService {
  constructor(
    private readonly createTaskCreatedNotificationsUseCase: CreateTaskCreatedNotificationsUseCase,
    private readonly createTaskUpdatedNotificationUseCase: CreateTaskUpdatedNotificationUseCase,
    private readonly createTaskDeletedNotificationUseCase: CreateTaskDeletedNotificationUseCase,
    private readonly createCommentCreatedNotificationUseCase: CreateCommentCreatedNotificationUseCase,
    private readonly findNotificationsByUserUseCase: FindNotificationsByUserUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase,
    private readonly countUnreadNotificationsUseCase: CountUnreadNotificationsUseCase,
  ) {}

  async createFromTaskCreated(
    event: TaskCreatedEvent,
  ): Promise<Notification[]> {
    return this.createTaskCreatedNotificationsUseCase.execute(event)
  }

  async createFromTaskUpdated(event: TaskUpdatedEvent): Promise<Notification> {
    return this.createTaskUpdatedNotificationUseCase.execute(event)
  }

  async createFromTaskDeleted(event: TaskDeletedEvent): Promise<Notification> {
    return this.createTaskDeletedNotificationUseCase.execute(event)
  }

  async createFromCommentCreated(
    event: CommentCreatedEvent,
  ): Promise<Notification> {
    return this.createCommentCreatedNotificationUseCase.execute(event)
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    unreadOnly: boolean = false,
  ): Promise<PaginatedNotificationsResponseDto> {
    return this.findNotificationsByUserUseCase.execute(
      userId,
      page,
      limit,
      unreadOnly,
    )
  }

  async markAsRead(
    id: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    return this.markNotificationAsReadUseCase.execute(id, userId)
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    return this.markAllNotificationsAsReadUseCase.execute(userId)
  }

  async countUnread(userId: string): Promise<number> {
    return this.countUnreadNotificationsUseCase.execute(userId)
  }
}
