import { Injectable, Logger } from '@nestjs/common'
import { NotificationsRepository } from './notifications.repository'
import { Notification, NotificationType } from './entities/notification.entity'
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

  async createFromTaskCreated(event: TaskCreatedEvent): Promise<Notification> {
    this.logger.log(
      `Creating notification for task.created event: ${event.taskId}`,
    )

    const message = `New task created: "${event.title}"`

    const notification = this.notificationsRepository.create({
      userId: event.createdById,
      type: NotificationType.TASK_CREATED,
      message,
    })

    const saved = await this.notificationsRepository.save(notification)

    this.logger.log(`Notification created: ${saved.id}`)

    return saved
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
  ): Promise<[Notification[], number]> {
    this.logger.log(`Fetching notifications for user: ${userId}`)
    return this.notificationsRepository.findByUser(
      userId,
      page,
      limit,
      unreadOnly,
    )
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    this.logger.log(`Marking notification ${id} as read for user: ${userId}`)
    return this.notificationsRepository.markAsRead(id, userId)
  }

  async markAllAsRead(userId: string): Promise<number> {
    this.logger.log(`Marking all notifications as read for user: ${userId}`)
    return this.notificationsRepository.markAllAsRead(userId)
  }

  async countUnread(userId: string): Promise<number> {
    this.logger.log(`Counting unread notifications for user: ${userId}`)
    return this.notificationsRepository.countUnread(userId)
  }
}
