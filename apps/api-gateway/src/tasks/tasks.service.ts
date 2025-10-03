import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { GetTasksQueryDto } from './dto/get-tasks-query.dto'
import { TaskResponseDto } from './dto/task-response.dto'
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto'

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name)
  private readonly tasksServiceUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('services.tasks.url')

    if (!url) {
      throw new Error(
        'TASKS_SERVICE_URL is not defined in environment variables',
      )
    }

    this.tasksServiceUrl = url
  }

  onModuleInit() {
    this.logger.log(`Tasks service URL configured: ${this.tasksServiceUrl}`)
  }

  async create(
    createTaskDto: CreateTaskDto,
    token: string,
  ): Promise<TaskResponseDto> {
    this.logger.log('Proxying create task request to tasks-service')

    const response = await firstValueFrom(
      this.httpService.post<TaskResponseDto>(
        `${this.tasksServiceUrl}/tasks`,
        createTaskDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    )

    return response.data
  }

  async findAll(
    query: GetTasksQueryDto,
    token: string,
  ): Promise<PaginatedTasksResponseDto> {
    this.logger.log('Proxying get all tasks request to tasks-service')

    const response = await firstValueFrom(
      this.httpService.get<PaginatedTasksResponseDto>(
        `${this.tasksServiceUrl}/tasks`,
        {
          params: query,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    )

    return response.data
  }

  async findById(id: string, token: string): Promise<TaskResponseDto> {
    this.logger.log(`Proxying get task ${id} request to tasks-service`)

    const response = await firstValueFrom(
      this.httpService.get<TaskResponseDto>(
        `${this.tasksServiceUrl}/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    )

    return response.data
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    token: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Proxying update task ${id} request to tasks-service`)

    const response = await firstValueFrom(
      this.httpService.put<TaskResponseDto>(
        `${this.tasksServiceUrl}/tasks/${id}`,
        updateTaskDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    )

    return response.data
  }

  async delete(id: string, token: string): Promise<void> {
    this.logger.log(`Proxying delete task ${id} request to tasks-service`)

    await firstValueFrom(
      this.httpService.delete(`${this.tasksServiceUrl}/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    )
  }
}
