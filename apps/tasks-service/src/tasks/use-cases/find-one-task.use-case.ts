import { Injectable, Logger } from '@nestjs/common'
import { TaskResponseDto } from '../dto/responses'
import { TaskAuthorizationGuard } from '../guards/task-authorization.guard'
import { TaskMapper } from '../mappers/task.mapper'

@Injectable()
export class FindOneTaskUseCase {
  private readonly logger = new Logger(FindOneTaskUseCase.name)

  constructor(
    private readonly authGuard: TaskAuthorizationGuard,
    private readonly taskMapper: TaskMapper,
  ) {}

  async execute(id: string, userId: string): Promise<TaskResponseDto> {
    this.logger.log(`Fetching task ${id} for user: ${userId}`)

    const task = await this.authGuard.findTaskOrFail(id)
    this.authGuard.ensureUserCanView(task, userId)

    this.logger.log(`Task ${id} found`)

    return this.taskMapper.toResponseDto(task)
  }
}
