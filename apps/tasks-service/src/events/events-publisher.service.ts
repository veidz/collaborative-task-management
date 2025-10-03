import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'
import {
  TaskCreatedEvent,
  TaskDeletedEvent,
  TaskEventPattern,
  TaskUpdatedEvent,
} from './interfaces/tasks-events.interface'

@Injectable()
export class EventsPublisherService implements OnModuleInit {
  private readonly logger = new Logger(EventsPublisherService.name)
  private client: ClientProxy

  constructor(private readonly configService: ConfigService) {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL')

    if (!rabbitmqUrl) {
      throw new Error('RABBITMQ_URL is not defined in environment variables')
    }

    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'tasks_queue',
        queueOptions: {
          durable: true,
        },
      },
    })
  }

  async onModuleInit() {
    await this.client.connect()
    this.logger.log('RabbitMQ client connected successfully')
  }

  async publishTaskCreated(event: TaskCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Publishing task.created event for task: ${event.taskId}`)

      this.client.emit(TaskEventPattern.TASK_CREATED, event)

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

      this.client.emit(TaskEventPattern.TASK_UPDATED, event)

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

      this.client.emit(TaskEventPattern.TASK_DELETED, event)

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

  async onModuleDestroy() {
    await this.client.close()
    this.logger.log('RabbitMQ client disconnected')
  }
}
