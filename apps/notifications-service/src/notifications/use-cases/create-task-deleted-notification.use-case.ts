import { Injectable, Logger } from '@nestjs/common'
import { NotificationsRepository } from '../notifications.repository'
import { Notification, NotificationType } from '../entities/notification.entity'
import { TaskDeletedEvent } from '../../events/interfaces/task-events.interface'

@Injectable()
export class CreateTaskDeletedNotificationUseCase {
  private readonly logger = new Logger(
    CreateTaskDeletedNotificationUseCase.name,
  )

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async execute(event: TaskDeletedEvent): Promise<Notification> {
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
}
