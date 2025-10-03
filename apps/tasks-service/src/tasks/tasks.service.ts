import { Injectable, Logger } from '@nestjs/common'
import { TasksRepository } from './tasks.repository'
import { CreateTaskDto } from './dto/create-task.dto'
import { TaskResponseDto } from './dto/task-response.dto'
import { TaskStatus } from './enums/task-status.enum'
import { TaskPriority } from './enums/task-priority.enum'

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)

  constructor(private readonly tasksRepository: TasksRepository) {}

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

    return {
      id: savedTask.id,
      title: savedTask.title,
      description: savedTask.description,
      status: savedTask.status,
      priority: savedTask.priority,
      deadline: savedTask.deadline,
      createdById: savedTask.createdById,
      createdAt: savedTask.createdAt,
      updatedAt: savedTask.updatedAt,
    }
  }
}
