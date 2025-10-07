import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib'
import { setTimeout } from 'timers/promises'
import { NotificationsService } from '../notifications/notifications.service'
import { NotificationsGateway } from '../websocket/websocket.gateway'
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
  CommentCreatedEvent,
  TaskEventPattern,
} from './interfaces/task-events.interface'

interface RabbitMQMessage {
  pattern: string
  data: unknown
}

@Injectable()
export class EventsConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsConsumerService.name)
  private connection: Connection | null = null
  private channel: Channel | null = null
  private readonly queueName = 'tasks_queue'
  private readonly maxRetries = 10
  private readonly retryDelay = 3000

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL')

    if (!rabbitmqUrl) {
      throw new Error('RABBITMQ_URL is not defined in environment variables')
    }

    await this.connectWithRetry(rabbitmqUrl)
  }

  private async connectWithRetry(
    url: string,
    attempt: number = 1,
  ): Promise<void> {
    try {
      this.logger.log(
        `Connecting to RabbitMQ... (attempt ${attempt}/${this.maxRetries})`,
      )

      this.connection = await connect(url)
      this.channel = await this.connection.createChannel()

      await this.channel.assertQueue(this.queueName, { durable: true })

      this.logger.log(
        `RabbitMQ connected successfully. Listening to queue: ${this.queueName}`,
      )

      await this.consumeMessages()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'

      if (attempt >= this.maxRetries) {
        this.logger.error(
          `Failed to connect to RabbitMQ after ${this.maxRetries} attempts: ${errorMsg}`,
        )
        throw error
      }

      this.logger.warn(
        `Failed to connect to RabbitMQ (attempt ${attempt}/${this.maxRetries}): ${errorMsg}`,
      )
      this.logger.log(`Retrying in ${this.retryDelay / 1000} seconds...`)

      await setTimeout(this.retryDelay)
      await this.connectWithRetry(url, attempt + 1)
    }
  }

  private async consumeMessages() {
    if (!this.channel) {
      throw new Error('Channel not initialized')
    }

    await this.channel.consume(
      this.queueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          return
        }

        try {
          const content = msg.content.toString()
          const message: RabbitMQMessage = JSON.parse(content)

          this.logger.log(`Received message with pattern: ${message.pattern}`)

          await this.handleMessage(message.pattern, message.data)

          this.channel?.ack(msg)
          this.logger.log(`Message acknowledged: ${message.pattern}`)
        } catch (error) {
          this.logger.error(
            `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}`,
          )
          this.channel?.nack(msg, false, false)
        }
      },
      { noAck: false },
    )
  }

  private async handleMessage(pattern: string, data: unknown): Promise<void> {
    switch (pattern) {
      case TaskEventPattern.TASK_CREATED:
        await this.handleTaskCreated(data as TaskCreatedEvent)
        break

      case TaskEventPattern.TASK_UPDATED:
        await this.handleTaskUpdated(data as TaskUpdatedEvent)
        break

      case TaskEventPattern.TASK_DELETED:
        await this.handleTaskDeleted(data as TaskDeletedEvent)
        break

      case TaskEventPattern.COMMENT_CREATED:
        await this.handleCommentCreated(data as CommentCreatedEvent)
        break

      default:
        this.logger.warn(`Unknown event pattern: ${pattern}`)
    }
  }

  private async handleTaskCreated(event: TaskCreatedEvent): Promise<void> {
    this.logger.log(`Handling task.created event for task: ${event.taskId}`)

    const notifications =
      await this.notificationsService.createFromTaskCreated(event)

    for (const notification of notifications) {
      this.notificationsGateway.sendNotificationToUser(notification.userId, {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      })
    }

    this.logger.log(
      `Sent ${notifications.length} notification(s) for task ${event.taskId}`,
    )
  }

  private async handleTaskUpdated(event: TaskUpdatedEvent): Promise<void> {
    this.logger.log(`Handling task.updated event for task: ${event.taskId}`)

    const notification =
      await this.notificationsService.createFromTaskUpdated(event)

    this.notificationsGateway.sendNotificationToUser(event.updatedById, {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    })
  }

  private async handleTaskDeleted(event: TaskDeletedEvent): Promise<void> {
    this.logger.log(`Handling task.deleted event for task: ${event.taskId}`)

    const notification =
      await this.notificationsService.createFromTaskDeleted(event)

    this.notificationsGateway.sendNotificationToUser(event.deletedById, {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    })
  }

  private async handleCommentCreated(
    event: CommentCreatedEvent,
  ): Promise<void> {
    this.logger.log(
      `Handling task.comment.created event for comment: ${event.commentId}`,
    )

    const notification =
      await this.notificationsService.createFromCommentCreated(event)

    this.notificationsGateway.sendNotificationToUser(event.authorId, {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    })
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close()
      await this.connection?.close()
      this.logger.log('RabbitMQ connection closed')
    } catch (error) {
      this.logger.error(
        `Error closing RabbitMQ connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
