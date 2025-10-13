import { Injectable, Logger } from '@nestjs/common'
import { NotificationsRepository } from '../notifications.repository'
import { Notification, NotificationType } from '../entities/notification.entity'
import { TaskCreatedEvent } from '../../events/interfaces/task-events.interface'

@Injectable()
export class CreateTaskCreatedNotificationsUseCase {
  private readonly logger = new Logger(
    CreateTaskCreatedNotificationsUseCase.name,
  )

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async execute(event: TaskCreatedEvent): Promise<Notification[]> {
    this.logger.log(
      `Creating notifications for task.created event: ${event.taskId}`,
    )

    const notifications: Notification[] = []

    const creatorNotification = await this.createCreatorNotification(event)
    notifications.push(creatorNotification)

    const assigneeNotifications = await this.createAssigneeNotifications(event)
    notifications.push(...assigneeNotifications)

    this.logger.log(
      `Created ${notifications.length} notification(s) for task ${event.taskId}`,
    )

    return notifications
  }

  private async createCreatorNotification(
    event: TaskCreatedEvent,
  ): Promise<Notification> {
    const message = `New task created: "${event.title}"`
    const notification = this.notificationsRepository.create({
      userId: event.createdById,
      type: NotificationType.TASK_CREATED,
      message,
    })

    return this.notificationsRepository.save(notification)
  }

  private async createAssigneeNotifications(
    event: TaskCreatedEvent,
  ): Promise<Notification[]> {
    if (!event.assigneeIds || event.assigneeIds.length === 0) {
      return []
    }

    const notifications: Notification[] = []

    for (const assigneeId of event.assigneeIds) {
      if (assigneeId !== event.createdById) {
        const message = `You were assigned to task: "${event.title}"`
        const notification = this.notificationsRepository.create({
          userId: assigneeId,
          type: NotificationType.TASK_CREATED,
          message,
        })

        notifications.push(
          await this.notificationsRepository.save(notification),
        )
      }
    }

    return notifications
  }
}
