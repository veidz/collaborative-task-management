import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task } from '../entities/task.entity'
import { TaskAssignment } from '../entities/task-assignment.entity'
import { UpdateTaskDto } from '../dto/requests'
import { TaskResponseDto } from '../dto/responses'
import { EventsPublisherService } from '../../events/events-publisher.service'
import { AuthServiceClient } from '../../common/clients/auth-service.client'
import { TaskAuthorizationGuard } from '../guards/task-authorization.guard'
import { TaskMapper } from '../mappers/task.mapper'

interface TaskChanges {
  changes: string[]
  assigneeIds?: string[]
}

@Injectable()
export class UpdateTaskUseCase {
  private readonly logger = new Logger(UpdateTaskUseCase.name)

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly authServiceClient: AuthServiceClient,
    private readonly authGuard: TaskAuthorizationGuard,
    private readonly eventsPublisher: EventsPublisherService,
    private readonly taskMapper: TaskMapper,
  ) {}

  async execute(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Updating task ${id} for user: ${userId}`)
    this.logger.log(
      `Update DTO assigneeIds: ${JSON.stringify(updateTaskDto.assigneeIds)}`,
    )

    const task = await this.authGuard.findTaskOrFail(id)
    this.authGuard.ensureUserCanModify(task, userId)

    const currentAssignees = task.assignments?.map((a) => a.userId) || []
    this.logger.log(`Current assignees: ${JSON.stringify(currentAssignees)}`)

    const { changes, assigneeIds } = await this.applyUpdates(
      task,
      updateTaskDto,
      userId,
    )

    if (changes.length === 0) {
      this.logger.log(`No changes detected for task ${id}`)
      return this.taskMapper.toResponseDto(task)
    }

    task.assignments = []

    const updatedTask = await this.tasksRepository.save(task)
    const taskWithAssignees = await this.fetchTaskWithAssignees(id)

    await this.publishUpdateEvent(
      updatedTask,
      updateTaskDto,
      userId,
      changes,
      assigneeIds,
    )

    this.logger.log(`Task ${id} updated with changes: ${changes.join(', ')}`)

    return this.taskMapper.toResponseDto(taskWithAssignees!)
  }

  private async applyUpdates(
    task: Task,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskChanges> {
    const changes: string[] = []

    this.applyBasicUpdates(task, updateTaskDto, changes)

    const assigneeIds = await this.applyAssigneeUpdates(
      task.id,
      task.assignments?.map((a) => a.userId) || [],
      updateTaskDto.assigneeIds,
      userId,
      changes,
    )

    return { changes, assigneeIds }
  }

  private applyBasicUpdates(
    task: Task,
    updateTaskDto: UpdateTaskDto,
    changes: string[],
  ): void {
    if (
      updateTaskDto.title !== undefined &&
      updateTaskDto.title !== task.title
    ) {
      task.title = updateTaskDto.title
      changes.push('title')
    }

    if (
      updateTaskDto.description !== undefined &&
      updateTaskDto.description !== task.description
    ) {
      task.description = updateTaskDto.description || null
      changes.push('description')
    }

    if (
      updateTaskDto.status !== undefined &&
      updateTaskDto.status !== task.status
    ) {
      task.status = updateTaskDto.status
      changes.push('status')
    }

    if (
      updateTaskDto.priority !== undefined &&
      updateTaskDto.priority !== task.priority
    ) {
      task.priority = updateTaskDto.priority
      changes.push('priority')
    }

    if (this.hasDeadlineChanged(task.deadline, updateTaskDto.deadline)) {
      task.deadline = updateTaskDto.deadline
        ? new Date(updateTaskDto.deadline)
        : null
      changes.push('deadline')
    }
  }

  private hasDeadlineChanged(
    currentDeadline: Date | null,
    newDeadline: string | undefined,
  ): boolean {
    if (newDeadline === undefined) {
      return false
    }

    const newDate = newDeadline ? new Date(newDeadline) : null

    if (newDate === null && currentDeadline !== null) return true
    if (newDate !== null && currentDeadline === null) return true
    if (newDate !== null && currentDeadline !== null) {
      return newDate.getTime() !== currentDeadline.getTime()
    }

    return false
  }

  private async applyAssigneeUpdates(
    taskId: string,
    currentAssigneeIds: string[],
    newAssigneeIds: string[] | undefined,
    userId: string,
    changes: string[],
  ): Promise<string[] | undefined> {
    this.logger.log(
      `applyAssigneeUpdates - taskId: ${taskId}, current: ${JSON.stringify(currentAssigneeIds)}, new: ${JSON.stringify(newAssigneeIds)}`,
    )

    if (newAssigneeIds === undefined) {
      this.logger.log('newAssigneeIds is undefined, skipping update')
      return undefined
    }

    const uniqueNewIds = [...new Set(newAssigneeIds)]
    this.logger.log(`uniqueNewIds: ${JSON.stringify(uniqueNewIds)}`)

    if (uniqueNewIds.length > 0) {
      await this.validateUserIds(uniqueNewIds)
    }

    if (this.hasAssigneesChanged(currentAssigneeIds, uniqueNewIds)) {
      this.logger.log(
        `Assignees changed! Updating from [${currentAssigneeIds.join(', ')}] to [${uniqueNewIds.join(', ')}]`,
      )
      await this.updateAssignments(taskId, uniqueNewIds, userId)
      changes.push('assignees')

      this.logger.log(
        `Task ${taskId} assignees updated: ${currentAssigneeIds.length} -> ${uniqueNewIds.length}`,
      )

      return uniqueNewIds
    }

    return undefined
  }

  private hasAssigneesChanged(current: string[], updated: string[]): boolean {
    const sortedCurrent = [...current].sort()
    const sortedUpdated = [...updated].sort()

    return (
      sortedCurrent.length !== sortedUpdated.length ||
      sortedCurrent.some((id, index) => id !== sortedUpdated[index])
    )
  }

  private async validateUserIds(userIds: string[]): Promise<void> {
    const validUsers = await this.authServiceClient.validateUsers(userIds)
    const invalidIds = userIds.filter((id) => !validUsers.has(id))

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid user IDs: ${invalidIds.join(', ')}`,
      )
    }
  }

  private async updateAssignments(
    taskId: string,
    newAssigneeIds: string[],
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `updateAssignments - Deleting all assignments for task ${taskId}`,
    )

    await this.tasksRepository.manager.transaction(async (manager) => {
      const deleteResult = await manager
        .createQueryBuilder()
        .delete()
        .from(TaskAssignment)
        .where('task_id = :taskId', { taskId })
        .execute()

      this.logger.log(
        `Deleted ${deleteResult.affected || 0} assignments for task ${taskId}`,
      )

      if (newAssigneeIds.length > 0) {
        const assignments = newAssigneeIds.map((assigneeId) => ({
          taskId,
          userId: assigneeId,
          assignedBy: userId,
        }))

        this.logger.log(
          `Inserting ${assignments.length} new assignments for task ${taskId}`,
        )

        await manager
          .createQueryBuilder()
          .insert()
          .into(TaskAssignment)
          .values(assignments)
          .execute()
      }
    })
  }

  private async fetchTaskWithAssignees(taskId: string): Promise<Task | null> {
    return this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['assignments'],
    })
  }

  private async publishUpdateEvent(
    task: Task,
    updateTaskDto: UpdateTaskDto,
    userId: string,
    changes: string[],
    assigneeIds?: string[],
  ): Promise<void> {
    await this.eventsPublisher.publishTaskUpdated({
      taskId: task.id,
      title: updateTaskDto.title,
      description: updateTaskDto.description ?? undefined,
      status: updateTaskDto.status,
      priority: updateTaskDto.priority,
      deadline: updateTaskDto.deadline
        ? new Date(updateTaskDto.deadline)
        : undefined,
      updatedById: userId,
      assigneeIds,
      updatedAt: task.updatedAt,
      changes,
    })
  }
}
