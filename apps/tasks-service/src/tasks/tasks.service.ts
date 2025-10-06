import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Task } from './entities/task.entity'
import { TaskAssignment } from './entities/task-assignment.entity'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { GetTasksQueryDto } from './dto/get-tasks-query.dto'
import { AssignUsersDto } from './dto/assign-users.dto'
import { UnassignUsersDto } from './dto/unassign-users.dto'
import { TaskResponseDto } from './dto/task-response.dto'
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto'
import { EventsPublisherService } from '../events/events-publisher.service'
import { AuthServiceClient } from '../common/clients/auth-service.client'
import { TaskStatus } from './enums/task-status.enum'
import { TaskPriority } from './enums/task-priority.enum'

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(TaskAssignment)
    private readonly assignmentsRepository: Repository<TaskAssignment>,
    private readonly eventsPublisher: EventsPublisherService,
    private readonly authServiceClient: AuthServiceClient,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Creating task for user: ${userId}`)

    const task = new Task()
    task.title = createTaskDto.title
    task.description = createTaskDto.description || null
    task.status = createTaskDto.status || TaskStatus.TODO
    task.priority = createTaskDto.priority || TaskPriority.MEDIUM
    task.deadline = createTaskDto.deadline
      ? new Date(createTaskDto.deadline)
      : null
    task.createdBy = userId

    const savedTask = await this.tasksRepository.save(task)

    const assigneeIds: string[] = []

    if (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0) {
      await this.assignUsersInternal(
        savedTask.id,
        createTaskDto.assigneeIds,
        userId,
        false,
      )
      assigneeIds.push(...createTaskDto.assigneeIds)
    }

    const taskWithAssignees = await this.tasksRepository.findOne({
      where: { id: savedTask.id },
      relations: ['assignments'],
    })

    this.logger.log(`Task created: ${savedTask.id}`)

    await this.eventsPublisher.publishTaskCreated({
      taskId: savedTask.id,
      title: savedTask.title,
      description: savedTask.description,
      status: savedTask.status,
      priority: savedTask.priority,
      deadline: savedTask.deadline,
      createdById: savedTask.createdBy,
      assigneeIds,
      createdAt: savedTask.createdAt,
    })

    return this.mapToResponseDto(taskWithAssignees!)
  }

  async findAll(
    query: GetTasksQueryDto,
    userId: string,
  ): Promise<PaginatedTasksResponseDto> {
    this.logger.log(`Fetching tasks for user: ${userId}`)

    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignedToMe,
      assignedTo,
    } = query
    const skip = (page - 1) * limit

    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignments', 'assignment')
      .where('task.createdBy = :userId', { userId })
      .orderBy('task.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status })
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority })
    }

    if (assignedToMe) {
      queryBuilder.andWhere('assignment.userId = :userId', { userId })
    }

    if (assignedTo) {
      queryBuilder.andWhere('assignment.userId = :assignedTo', { assignedTo })
    }

    const [tasks, total] = await queryBuilder.getManyAndCount()

    const totalPages = Math.ceil(total / limit)

    this.logger.log(`Found ${total} tasks for user: ${userId}`)

    return {
      data: await Promise.all(tasks.map((task) => this.mapToResponseDto(task))),
      total,
      page,
      limit,
      totalPages,
    }
  }

  async findOne(id: string, userId: string): Promise<TaskResponseDto> {
    this.logger.log(`Fetching task ${id} for user: ${userId}`)

    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignments'],
    })

    if (!task) {
      this.logger.warn(`Task ${id} not found`)
      throw new NotFoundException('Task not found')
    }

    const isCreator = task.createdBy === userId
    const isAssignee = task.assignments?.some((a) => a.userId === userId)

    if (!isCreator && !isAssignee) {
      this.logger.warn(`User ${userId} is not authorized to view task ${id}`)
      throw new ForbiddenException('You are not authorized to view this task')
    }

    this.logger.log(`Task ${id} found`)

    return this.mapToResponseDto(task)
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Updating task ${id} for user: ${userId}`)

    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignments'],
    })

    if (!task) {
      this.logger.warn(`Task ${id} not found`)
      throw new NotFoundException('Task not found')
    }

    const isCreator = task.createdBy === userId
    const isAssignee = task.assignments?.some((a) => a.userId === userId)

    if (!isCreator && !isAssignee) {
      this.logger.warn(`User ${userId} is not authorized to update task ${id}`)
      throw new ForbiddenException('You are not authorized to update this task')
    }

    const changes: string[] = []
    let assigneeIds: string[] | undefined

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

    if (updateTaskDto.deadline !== undefined) {
      const newDeadline = updateTaskDto.deadline
        ? new Date(updateTaskDto.deadline)
        : null
      const oldDeadline = task.deadline

      if (
        (newDeadline === null && oldDeadline !== null) ||
        (newDeadline !== null && oldDeadline === null) ||
        (newDeadline !== null &&
          oldDeadline !== null &&
          newDeadline.getTime() !== oldDeadline.getTime())
      ) {
        task.deadline = newDeadline
        changes.push('deadline')
      }
    }

    if (updateTaskDto.assigneeIds !== undefined) {
      const currentAssigneeIds = task.assignments?.map((a) => a.userId) || []

      const newAssigneeIds = [...new Set(updateTaskDto.assigneeIds)]

      if (newAssigneeIds.length > 0) {
        const validUsers =
          await this.authServiceClient.validateUsers(newAssigneeIds)
        const invalidIds = newAssigneeIds.filter((id) => !validUsers.has(id))
        if (invalidIds.length > 0) {
          throw new BadRequestException(
            `Invalid user IDs: ${invalidIds.join(', ')}`,
          )
        }
      }

      const sortedCurrent = [...currentAssigneeIds].sort()
      const sortedNew = [...newAssigneeIds].sort()
      const assigneesChanged =
        sortedCurrent.length !== sortedNew.length ||
        sortedCurrent.some((id, index) => id !== sortedNew[index])

      if (assigneesChanged) {
        await this.tasksRepository.manager.transaction(async (manager) => {
          await manager.delete('task_assignments', { taskId: id })

          if (newAssigneeIds.length > 0) {
            const assignments = newAssigneeIds.map((assigneeId) => ({
              taskId: id,
              userId: assigneeId,
              assignedBy: userId,
            }))
            await manager
              .createQueryBuilder()
              .insert()
              .into('task_assignments')
              .values(assignments)
              .execute()
          }
        })

        assigneeIds = newAssigneeIds
        changes.push('assignees')

        this.logger.log(
          `Task ${id} assignees updated: ${currentAssigneeIds.length} -> ${newAssigneeIds.length}`,
        )
      }
    }

    if (changes.length === 0) {
      this.logger.log(`No changes detected for task ${id}`)
      return this.mapToResponseDto(task)
    }

    const updatedTask = await this.tasksRepository.save(task)

    const taskWithAssignees = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignments'],
    })

    this.logger.log(`Task ${id} updated with changes: ${changes.join(', ')}`)

    await this.eventsPublisher.publishTaskUpdated({
      taskId: updatedTask.id,
      title: updateTaskDto.title,
      description: updateTaskDto.description,
      status: updateTaskDto.status,
      priority: updateTaskDto.priority,
      deadline: updateTaskDto.deadline
        ? new Date(updateTaskDto.deadline)
        : undefined,
      updatedById: userId,
      assigneeIds,
      updatedAt: updatedTask.updatedAt,
      changes,
    })

    return this.mapToResponseDto(taskWithAssignees!)
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Deleting task ${id} for user: ${userId}`)

    const task = await this.tasksRepository.findOne({
      where: { id, createdBy: userId },
    })

    if (!task) {
      this.logger.warn(`Task ${id} not found for user: ${userId}`)
      throw new NotFoundException('Task not found')
    }

    await this.tasksRepository.remove(task)

    this.logger.log(`Task ${id} deleted`)

    await this.eventsPublisher.publishTaskDeleted({
      taskId: id,
      deletedById: userId,
      deletedAt: new Date(),
    })
  }

  async assignUsers(
    id: string,
    assignUsersDto: AssignUsersDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Assigning users to task ${id}`)

    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignments'],
    })

    if (!task) {
      this.logger.warn(`Task ${id} not found`)
      throw new NotFoundException('Task not found')
    }

    const isCreator = task.createdBy === userId
    const isAssignee = task.assignments?.some((a) => a.userId === userId)

    if (!isCreator && !isAssignee) {
      this.logger.warn(
        `User ${userId} is not authorized to assign users to task ${id}`,
      )
      throw new ForbiddenException(
        'You are not authorized to assign users to this task',
      )
    }

    const existingUserIds = new Set(
      task.assignments?.map((a) => a.userId) || [],
    )
    const newUserIds = assignUsersDto.userIds.filter(
      (id) => !existingUserIds.has(id),
    )

    if (newUserIds.length > 0) {
      await this.assignUsersInternal(id, newUserIds, userId, true)

      await this.eventsPublisher.publishTaskAssigned({
        taskId: id,
        assignedUserIds: newUserIds,
        assignedBy: userId,
        assignedAt: new Date(),
      })
    }

    const updatedTask = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignments'],
    })

    this.logger.log(`Users assigned to task ${id}`)

    return this.mapToResponseDto(updatedTask!)
  }

  async unassignUsers(
    id: string,
    unassignUsersDto: UnassignUsersDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Unassigning users from task ${id}`)

    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignments'],
    })

    if (!task) {
      this.logger.warn(`Task ${id} not found`)
      throw new NotFoundException('Task not found')
    }

    const isCreator = task.createdBy === userId
    const isAssignee = task.assignments?.some((a) => a.userId === userId)

    if (!isCreator && !isAssignee) {
      this.logger.warn(
        `User ${userId} is not authorized to unassign users from task ${id}`,
      )
      throw new ForbiddenException(
        'You are not authorized to unassign users from this task',
      )
    }

    await this.assignmentsRepository.delete({
      taskId: id,
      userId: In(unassignUsersDto.userIds),
    })

    await this.eventsPublisher.publishTaskUnassigned({
      taskId: id,
      unassignedUserIds: unassignUsersDto.userIds,
      unassignedBy: userId,
      unassignedAt: new Date(),
    })

    const updatedTask = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignments'],
    })

    this.logger.log(`Users unassigned from task ${id}`)

    return this.mapToResponseDto(updatedTask!)
  }

  private async assignUsersInternal(
    taskId: string,
    userIds: string[],
    assignedBy: string,
    checkExisting: boolean = true,
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

    let newUserIds = userIds

    if (checkExisting) {
      const existingAssignments = await this.assignmentsRepository.find({
        where: { taskId },
      })

      const existingUserIds = new Set(existingAssignments.map((a) => a.userId))
      newUserIds = userIds.filter((id) => !existingUserIds.has(id))

      if (newUserIds.length === 0) {
        this.logger.log('All users already assigned')
        return
      }
    }

    const assignments = newUserIds.map((userId) => {
      const assignment = new TaskAssignment()
      assignment.taskId = taskId
      assignment.userId = userId
      assignment.assignedBy = assignedBy
      return assignment
    })

    await this.assignmentsRepository.save(assignments)

    this.logger.log(`Assigned ${newUserIds.length} users to task ${taskId}`)
  }

  private async mapToResponseDto(task: Task): Promise<TaskResponseDto> {
    const assigneeIds = task.assignments?.map((a) => a.userId) || []
    const validUsers =
      assigneeIds.length > 0
        ? await this.authServiceClient.validateUsers(assigneeIds)
        : new Map()

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      createdBy: task.createdBy,
      assignees:
        task.assignments?.map((assignment) => {
          const user = validUsers.get(assignment.userId)
          return {
            id: assignment.userId,
            email: user?.email || '',
            username: user?.username || '',
            assignedAt: assignment.assignedAt,
            assignedBy: assignment.assignedBy,
          }
        }) || [],
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}
