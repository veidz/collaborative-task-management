import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { TaskAssignment } from '../entities/task-assignment.entity'
import { UnassignUsersDto } from '../dto/requests'
import { TaskResponseDto } from '../dto/responses'
import { TaskAuthorizationGuard } from '../guards/task-authorization.guard'
import { TaskMapper } from '../mappers/task.mapper'

@Injectable()
export class UnassignUsersUseCase {
  private readonly logger = new Logger(UnassignUsersUseCase.name)

  constructor(
    @InjectRepository(TaskAssignment)
    private readonly assignmentsRepository: Repository<TaskAssignment>,
    private readonly authGuard: TaskAuthorizationGuard,
    private readonly taskMapper: TaskMapper,
  ) {}

  async execute(
    id: string,
    unassignUsersDto: UnassignUsersDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Unassigning users from task ${id}`)

    const task = await this.authGuard.findTaskOrFail(id)
    this.authGuard.ensureUserCanModify(task, userId)

    await this.assignmentsRepository.delete({
      taskId: id,
      userId: In(unassignUsersDto.userIds),
    })

    const updatedTask = await this.authGuard.findTaskOrFail(id)

    this.logger.log(`Users unassigned from task ${id}`)

    return this.taskMapper.toResponseDto(updatedTask)
  }
}
