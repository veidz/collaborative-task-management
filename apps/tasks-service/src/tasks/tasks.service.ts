import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { TasksRepository } from './tasks.repository'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { GetTasksQueryDto } from './dto/get-tasks-query.dto'
import { TaskResponseDto } from './dto/task-response.dto'
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto'
import { TaskStatus } from './enums/task-status.enum'
import { TaskPriority } from './enums/task-priority.enum'
import { Task } from './entities/task.entity'
import { EventsPublisherService } from '../events/events-publisher.service'
import {
  TaskCreatedEvent,
  TaskDeletedEvent,
  TaskUpdatedEvent,
} from 'src/events/interfaces/tasks-events.interface'

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)

  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly eventsPublisher: EventsPublisherService,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Creating task for user: ${userId}`)

    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || TaskStatus.TODO,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
      deadline: createTaskDto.deadline
        ? new Date(createTaskDto.deadline)
        : undefined,
      createdById: userId,
    })

    const savedTask = await this.tasksRepository.save(task)

    this.logger.log(`Task created successfully: ${savedTask.id}`)

    const event: TaskCreatedEvent = {
      taskId: savedTask.id,
      title: savedTask.title,
      description: savedTask.description,
      status: savedTask.status,
      priority: savedTask.priority,
      deadline: savedTask.deadline,
      createdById: savedTask.createdById,
      createdAt: savedTask.createdAt,
    }

    await this.eventsPublisher.publishTaskCreated(event)

    return this.mapToResponseDto(savedTask)
  }

  async findAll(
    query: GetTasksQueryDto,
    userId: string,
  ): Promise<PaginatedTasksResponseDto> {
    this.logger.log(
      `Fetching tasks for user: ${userId} with filters: ${JSON.stringify(query)}`,
    )

    const page = query.page ?? 1
    const limit = query.limit ?? 10

    const [tasks, total] = await this.tasksRepository.findAllByUser(
      userId,
      query.status,
      query.priority,
      page,
      limit,
    )

    const totalPages = Math.ceil(total / limit)

    this.logger.log(`Found ${total} tasks for user: ${userId}`)

    return {
      data: tasks.map((task) => this.mapToResponseDto(task)),
      total,
      page,
      limit,
      totalPages,
    }
  }

  async findById(id: string, userId: string): Promise<TaskResponseDto> {
    this.logger.log(`Fetching task ${id} for user: ${userId}`)

    const task = await this.tasksRepository.findByIdAndUser(id, userId)

    if (!task) {
      this.logger.warn(`Task ${id} not found or not owned by user: ${userId}`)
      throw new NotFoundException('Task not found')
    }

    this.logger.log(`Task ${id} retrieved successfully`)

    return this.mapToResponseDto(task)
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Updating task ${id} for user: ${userId}`)

    const existingTask = await this.tasksRepository.findByIdAndUser(id, userId)

    if (!existingTask) {
      this.logger.warn(`Task ${id} not found or not owned by user: ${userId}`)
      throw new NotFoundException('Task not found')
    }

    const updates: Partial<Task> = {}
    const changes: string[] = []

    if (
      updateTaskDto.title !== undefined &&
      updateTaskDto.title !== existingTask.title
    ) {
      updates.title = updateTaskDto.title
      changes.push('title')
    }

    if (
      updateTaskDto.description !== undefined &&
      updateTaskDto.description !== existingTask.description
    ) {
      updates.description = updateTaskDto.description
      changes.push('description')
    }

    if (
      updateTaskDto.status !== undefined &&
      updateTaskDto.status !== existingTask.status
    ) {
      updates.status = updateTaskDto.status
      changes.push('status')
    }

    if (
      updateTaskDto.priority !== undefined &&
      updateTaskDto.priority !== existingTask.priority
    ) {
      updates.priority = updateTaskDto.priority
      changes.push('priority')
    }

    if (updateTaskDto.deadline !== undefined) {
      const newDeadline = new Date(updateTaskDto.deadline)
      if (newDeadline.getTime() !== existingTask.deadline?.getTime()) {
        updates.deadline = newDeadline
        changes.push('deadline')
      }
    }

    const updatedTask = await this.tasksRepository.updateTask(
      id,
      userId,
      updates,
    )

    if (!updatedTask) {
      this.logger.warn(`Task ${id} not found or not owned by user: ${userId}`)
      throw new NotFoundException('Task not found')
    }

    this.logger.log(`Task ${id} updated successfully`)

    if (changes.length > 0) {
      const event: TaskUpdatedEvent = {
        taskId: updatedTask.id,
        updatedById: userId,
        updatedAt: updatedTask.updatedAt,
        changes,
        ...(updates.title && { title: updates.title }),
        ...(updates.description !== undefined && {
          description: updates.description,
        }),
        ...(updates.status && { status: updates.status }),
        ...(updates.priority && { priority: updates.priority }),
        ...(updates.deadline && { deadline: updates.deadline }),
      }

      await this.eventsPublisher.publishTaskUpdated(event)
    }

    return this.mapToResponseDto(updatedTask)
  }

  async delete(id: string, userId: string): Promise<void> {
    this.logger.log(`Deleting task ${id} for user: ${userId}`)

    const deleted = await this.tasksRepository.deleteTask(id, userId)

    if (!deleted) {
      this.logger.warn(`Task ${id} not found or not owned by user: ${userId}`)
      throw new NotFoundException('Task not found')
    }

    this.logger.log(`Task ${id} deleted successfully`)

    const event: TaskDeletedEvent = {
      taskId: id,
      deletedById: userId,
      deletedAt: new Date(),
    }

    await this.eventsPublisher.publishTaskDeleted(event)
  }

  private mapToResponseDto(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      createdById: task.createdById,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}
