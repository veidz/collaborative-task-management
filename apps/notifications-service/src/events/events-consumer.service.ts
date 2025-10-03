import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib'
import { NotificationsService } from '../notifications/notifications.service'
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

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL')

    if (!rabbitmqUrl) {
      throw new Error('RABBITMQ_URL is not defined in environment variables')
    }

    try {
      this.logger.log('Connecting to RabbitMQ...')
      this.connection = await connect(rabbitmqUrl)
      this.channel = await this.connection.createChannel()

      await this.channel.assertQueue(this.queueName, { durable: true })

      this.logger.log(
        `RabbitMQ connected. Listening to queue: ${this.queueName}`,
      )

      await this.consumeMessages()
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      throw error
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
    await this.notificationsService.createFromTaskCreated(event)
  }

  private async handleTaskUpdated(event: TaskUpdatedEvent): Promise<void> {
    this.logger.log(`Handling task.updated event for task: ${event.taskId}`)
    await this.notificationsService.createFromTaskUpdated(event)
  }

  private async handleTaskDeleted(event: TaskDeletedEvent): Promise<void> {
    this.logger.log(`Handling task.deleted event for task: ${event.taskId}`)
    await this.notificationsService.createFromTaskDeleted(event)
  }

  private async handleCommentCreated(
    event: CommentCreatedEvent,
  ): Promise<void> {
    this.logger.log(
      `Handling task.comment.created event for comment: ${event.commentId}`,
    )
    await this.notificationsService.createFromCommentCreated(event)
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
