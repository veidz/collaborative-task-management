import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TaskAssignment } from '../entities/task-assignment.entity'
import { AssignUsersDto } from '../dto/requests'
import { TaskResponseDto } from '../dto/responses'
import { AuthServiceClient } from '../../common/clients/auth-service.client'
import { TaskAuthorizationGuard } from '../guards/task-authorization.guard'
import { TaskMapper } from '../mappers/task.mapper'

@Injectable()
export class AssignUsersUseCase {
  private readonly logger = new Logger(AssignUsersUseCase.name)

  constructor(
    @InjectRepository(TaskAssignment)
    private readonly assignmentsRepository: Repository<TaskAssignment>,
    private readonly authServiceClient: AuthServiceClient,
    private readonly authGuard: TaskAuthorizationGuard,
    private readonly taskMapper: TaskMapper,
  ) {}

  async execute(
    id: string,
    assignUsersDto: AssignUsersDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Assigning users to task ${id}`)

    const task = await this.authGuard.findTaskOrFail(id)
    this.authGuard.ensureUserCanModify(task, userId)

    const newUserIds = this.getNewUserIds(
      task.assignments?.map((a) => a.userId) || [],
      assignUsersDto.userIds,
    )

    if (newUserIds.length > 0) {
      await this.validateAndAssignUsers(id, newUserIds, userId)
    }

    const updatedTask = await this.authGuard.findTaskOrFail(id)

    this.logger.log(`Users assigned to task ${id}`)

    return this.taskMapper.toResponseDto(updatedTask)
  }

  private getNewUserIds(
    existingIds: string[],
    requestedIds: string[],
  ): string[] {
    const existingSet = new Set(existingIds)
    return requestedIds.filter((id) => !existingSet.has(id))
  }

  private async validateAndAssignUsers(
    taskId: string,
    userIds: string[],
    assignedBy: string,
  ): Promise<void> {
    const validUsers = await this.authServiceClient.validateUsers(userIds)

    if (validUsers.size === 0) {
      throw new BadRequestException('No valid user IDs provided')
    }

    const invalidIds = userIds.filter((id) => !validUsers.has(id))

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid user IDs: ${invalidIds.join(', ')}`,
      )
    }

    const assignments = userIds.map((userId) => {
      const assignment = new TaskAssignment()
      assignment.taskId = taskId
      assignment.userId = userId
      assignment.assignedBy = assignedBy
      return assignment
    })

    await this.assignmentsRepository.save(assignments)

    this.logger.log(`Assigned ${userIds.length} users to task ${taskId}`)
  }
}
