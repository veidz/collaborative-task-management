import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { connect, Connection, Channel } from 'amqplib'
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
  CommentCreatedEvent,
  TaskEventPattern,
} from './interfaces/task-events.interface'

@Injectable()
export class EventsPublisherService implements OnModuleInit {
  private readonly logger = new Logger(EventsPublisherService.name)
  private connection: Connection | null = null
  private channel: Channel | null = null
  private readonly queueName = 'tasks_queue'

  constructor(private readonly configService: ConfigService) {}

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

      this.logger.log('RabbitMQ client connected successfully')
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      throw error
    }
  }

  async publishTaskCreated(event: TaskCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Publishing task.created event for task: ${event.taskId}`)

      await this.publishMessage(TaskEventPattern.TASK_CREATED, event)

      this.logger.log(
        `task.created event published successfully for task: ${event.taskId}`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to publish task.created event: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      throw error
    }
  }

  async publishTaskUpdated(event: TaskUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Publishing task.updated event for task: ${event.taskId}`)

      await this.publishMessage(TaskEventPattern.TASK_UPDATED, event)

      this.logger.log(
        `task.updated event published successfully for task: ${event.taskId}`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to publish task.updated event: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      throw error
    }
  }

  async publishTaskDeleted(event: TaskDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Publishing task.deleted event for task: ${event.taskId}`)

      await this.publishMessage(TaskEventPattern.TASK_DELETED, event)

      this.logger.log(
        `task.deleted event published successfully for task: ${event.taskId}`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to publish task.deleted event: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      throw error
    }
  }

  async publishCommentCreated(event: CommentCreatedEvent): Promise<void> {
    try {
      this.logger.log(
        `Publishing task.comment.created event for comment: ${event.commentId}`,
      )

      await this.publishMessage(TaskEventPattern.COMMENT_CREATED, event)

      this.logger.log(
        `task.comment.created event published successfully for comment: ${event.commentId}`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to publish task.comment.created event: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      throw error
    }
  }

  private async publishMessage(pattern: string, data: unknown): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized')
    }

    const message = JSON.stringify({ pattern, data })
    const buffer = Buffer.from(message)

    await this.channel.sendToQueue(this.queueName, buffer, {
      persistent: true,
      contentType: 'application/json',
    })
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close()
      await this.connection?.close()
      this.logger.log('RabbitMQ client disconnected')
    } catch (error) {
      this.logger.error(
        `Error closing RabbitMQ connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
