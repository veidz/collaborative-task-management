import { Injectable, Logger } from '@nestjs/common'
import { NotificationsRepository } from '../notifications.repository'
import { Notification, NotificationType } from '../entities/notification.entity'
import { TaskUpdatedEvent } from '../../events/interfaces/task-events.interface'

@Injectable()
export class CreateTaskUpdatedNotificationUseCase {
  private readonly logger = new Logger(
    CreateTaskUpdatedNotificationUseCase.name,
  )

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async execute(event: TaskUpdatedEvent): Promise<Notification> {
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
}
