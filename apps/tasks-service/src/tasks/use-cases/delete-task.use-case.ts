import { Injectable, Logger } from '@nestjs/common'
import { EventsPublisherService } from '../../events/events-publisher.service'
import { TaskAuthorizationGuard } from '../guards/task-authorization.guard'

@Injectable()
export class DeleteTaskUseCase {
  private readonly logger = new Logger(DeleteTaskUseCase.name)

  constructor(
    private readonly authGuard: TaskAuthorizationGuard,
    private readonly eventsPublisher: EventsPublisherService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    this.logger.log(`Deleting task ${id} for user: ${userId}`)

    const task = await this.authGuard.findTaskOrFail(id)
    this.authGuard.ensureUserIsCreator(task, userId)

    await this.eventsPublisher.publishTaskDeleted({
      taskId: id,
      deletedById: userId,
      deletedAt: new Date(),
    })

    this.logger.log(`Task ${id} deleted`)
  }
}
