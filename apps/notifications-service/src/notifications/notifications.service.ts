import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { NotificationsRepository } from './notifications.repository'
import { Notification, NotificationType } from './entities/notification.entity'
import { NotificationResponseDto } from './dto/notification-response.dto'
import { PaginatedNotificationsResponseDto } from './dto/paginated-notifications-response.dto'
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
  CommentCreatedEvent,
} from '../events/interfaces/task-events.interface'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async createFromTaskCreated(
    event: TaskCreatedEvent,
  ): Promise<Notification[]> {
    this.logger.log(
      `Creating notifications for task.created event: ${event.taskId}`,
    )

    const notifications: Notification[] = []

    const creatorMessage = `New task created: "${event.title}"`
    const creatorNotification = this.notificationsRepository.create({
      userId: event.createdById,
      type: NotificationType.TASK_CREATED,
      message: creatorMessage,
    })
    notifications.push(
      await this.notificationsRepository.save(creatorNotification),
    )

    if (event.assigneeIds && event.assigneeIds.length > 0) {
      for (const assigneeId of event.assigneeIds) {
        if (assigneeId !== event.createdById) {
          const assigneeMessage = `You were assigned to task: "${event.title}"`
          const assigneeNotification = this.notificationsRepository.create({
            userId: assigneeId,
            type: NotificationType.TASK_CREATED,
            message: assigneeMessage,
          })
          notifications.push(
            await this.notificationsRepository.save(assigneeNotification),
          )
        }
      }
    }

    this.logger.log(
      `Created ${notifications.length} notification(s) for task ${event.taskId}`,
    )

    return notifications
  }

  async createFromTaskUpdated(event: TaskUpdatedEvent): Promise<Notification> {
    this.logger.log(
      `Creating notification for task.updated event: ${event.taskId}`,
    )

    const changesText = event.changes.join(', ')
    const message = `Task updated (${changesText})`

    const notification = this.notificationsRepository.create({
      userId: event.updatedById,
      type: NotificationType.TASK_UPDATED,
      message,
    })

    const saved = await this.notificationsRepository.save(notification)

    this.logger.log(`Notification created: ${saved.id}`)

    return saved
  }

  async createFromTaskDeleted(event: TaskDeletedEvent): Promise<Notification> {
    this.logger.log(
      `Creating notification for task.deleted event: ${event.taskId}`,
    )

    const message = `Task deleted: ${event.taskId}`

    const notification = this.notificationsRepository.create({
      userId: event.deletedById,
      type: NotificationType.TASK_DELETED,
      message,
    })

    const saved = await this.notificationsRepository.save(notification)

    this.logger.log(`Notification created: ${saved.id}`)

    return saved
  }

  async createFromCommentCreated(
    event: CommentCreatedEvent,
  ): Promise<Notification> {
    this.logger.log(
      `Creating notification for task.comment.created event: ${event.commentId}`,
    )

    const message = `New comment on task: "${event.content.substring(0, 50)}${event.content.length > 50 ? '...' : ''}"`

    const notification = this.notificationsRepository.create({
      userId: event.authorId,
      type: NotificationType.COMMENT_CREATED,
      message,
    })

    const saved = await this.notificationsRepository.save(notification)

    this.logger.log(`Notification created: ${saved.id}`)

    return saved
  }

  async findByUser(
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
      data: notifications.map((notification) =>
        this.mapToResponseDto(notification),
      ),
      total,
      page,
      limit,
      totalPages,
    }
  }

  async markAsRead(
    id: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    this.logger.log(`Marking notification ${id} as read for user: ${userId}`)

    const updated = await this.notificationsRepository.markAsRead(id, userId)

    if (!updated) {
      this.logger.warn(
        `Notification ${id} not found or not owned by user: ${userId}`,
      )
      throw new NotFoundException('Notification not found')
    }

    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    })

    if (!notification) {
      throw new NotFoundException('Notification not found')
    }

    this.logger.log(`Notification ${id} marked as read`)

    return this.mapToResponseDto(notification)
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    this.logger.log(`Marking all notifications as read for user: ${userId}`)

    const updated = await this.notificationsRepository.markAllAsRead(userId)

    this.logger.log(
      `Marked ${updated} notifications as read for user: ${userId}`,
    )

    return { updated }
  }

  async countUnread(userId: string): Promise<number> {
    this.logger.log(`Counting unread notifications for user: ${userId}`)

    const count = await this.notificationsRepository.countUnread(userId)

    this.logger.log(`User ${userId} has ${count} unread notifications`)

    return count
  }

  private mapToResponseDto(
    notification: Notification,
  ): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    }
  }
}
