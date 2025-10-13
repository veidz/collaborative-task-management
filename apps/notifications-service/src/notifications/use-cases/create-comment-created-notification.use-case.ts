import { Injectable, Logger } from '@nestjs/common'
import { NotificationsRepository } from '../notifications.repository'
import { Notification, NotificationType } from '../entities/notification.entity'
import { CommentCreatedEvent } from '../../events/interfaces/task-events.interface'

@Injectable()
export class CreateCommentCreatedNotificationUseCase {
  private readonly logger = new Logger(
    CreateCommentCreatedNotificationUseCase.name,
  )

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async execute(event: CommentCreatedEvent): Promise<Notification> {
    this.logger.log(
      `Creating notification for task.comment.created event: ${event.commentId}`,
    )

    const truncatedContent = this.truncateContent(event.content, 50)
    const message = `New comment on task: "${truncatedContent}"`

    const notification = this.notificationsRepository.create({
      userId: event.authorId,
      type: NotificationType.COMMENT_CREATED,
      message,
    })

    const saved = await this.notificationsRepository.save(notification)

    this.logger.log(`Notification created: ${saved.id}`)

    return saved
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content
    }
    return `${content.substring(0, maxLength)}...`
  }
}
