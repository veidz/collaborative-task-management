import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task } from '../entities/task.entity'
import { TaskAssignment } from '../entities/task-assignment.entity'
import { TaskStatus } from '../enums/task-status.enum'
import { TaskPriority } from '../enums/task-priority.enum'
import { CreateTaskDto } from '../dto/requests'
import { TaskResponseDto } from '../dto/responses'
import { EventsPublisherService } from '../../events/events-publisher.service'
import { AuthServiceClient } from '../../common/clients/auth-service.client'
import { TaskMapper } from '../mappers/task.mapper'
import { BadRequestException } from '@nestjs/common'

@Injectable()
export class CreateTaskUseCase {
  private readonly logger = new Logger(CreateTaskUseCase.name)

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(TaskAssignment)
    private readonly assignmentsRepository: Repository<TaskAssignment>,
    private readonly eventsPublisher: EventsPublisherService,
    private readonly authServiceClient: AuthServiceClient,
    private readonly taskMapper: TaskMapper,
  ) {}

  async execute(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Creating task for user: ${userId}`)

    const task = await this.createTask(createTaskDto, userId)
    const assigneeIds = await this.assignUsers(
      task.id,
      createTaskDto.assigneeIds || [],
      userId,
    )
    const taskWithAssignees = await this.fetchTaskWithAssignees(task.id)

    await this.publishTaskCreatedEvent(task, assigneeIds)

    this.logger.log(`Task created: ${task.id}`)

    return this.taskMapper.toResponseDto(taskWithAssignees!)
  }

  private async createTask(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = new Task()
    task.title = createTaskDto.title
    task.description = createTaskDto.description || null
    task.status = createTaskDto.status || TaskStatus.TODO
    task.priority = createTaskDto.priority || TaskPriority.MEDIUM
    task.deadline = createTaskDto.deadline
      ? new Date(createTaskDto.deadline)
      : null
    task.createdBy = userId

    return this.tasksRepository.save(task)
  }

  private async assignUsers(
    taskId: string,
    assigneeIds: string[],
    assignedBy: string,
  ): Promise<string[]> {
    if (!assigneeIds || assigneeIds.length === 0) {
      return []
    }

    await this.validateUserIds(assigneeIds)

    const assignments = assigneeIds.map((userId) => {
      const assignment = new TaskAssignment()
      assignment.taskId = taskId
      assignment.userId = userId
      assignment.assignedBy = assignedBy
      return assignment
    })

    await this.assignmentsRepository.save(assignments)

    return assigneeIds
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

  private async fetchTaskWithAssignees(taskId: string): Promise<Task | null> {
    return this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['assignments'],
    })
  }

  private async publishTaskCreatedEvent(
    task: Task,
    assigneeIds: string[],
  ): Promise<void> {
    await this.eventsPublisher.publishTaskCreated({
      taskId: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      createdById: task.createdBy,
      assigneeIds,
      createdAt: task.createdAt,
    })
  }
}
