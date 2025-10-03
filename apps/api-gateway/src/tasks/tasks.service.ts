import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { GetTasksQueryDto } from './dto/get-tasks-query.dto'
import { TaskResponseDto } from './dto/task-response.dto'
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto'
import { CreateCommentDto } from './dto/create-comment.dto'
import { GetCommentsQueryDto } from './dto/get-comments-query.dto'
import { CommentResponseDto } from './dto/comment-response.dto'
import { PaginatedCommentsResponseDto } from './dto/paginated-comment-response.dto'

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

    try {
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

      this.logger.log('Task created successfully via proxy')
      return response.data
    } catch (error) {
      this.handleError(error, 'Failed to create task')
    }
  }

  async findAll(
    query: GetTasksQueryDto,
    token: string,
  ): Promise<PaginatedTasksResponseDto> {
    this.logger.log('Proxying get all tasks request to tasks-service')

    try {
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

      this.logger.log('Tasks retrieved successfully via proxy')
      return response.data
    } catch (error) {
      this.handleError(error, 'Failed to get tasks')
    }
  }

  async findById(id: string, token: string): Promise<TaskResponseDto> {
    this.logger.log(`Proxying get task ${id} request to tasks-service`)

    try {
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

      this.logger.log(`Task ${id} retrieved successfully via proxy`)
      return response.data
    } catch (error) {
      this.handleError(error, `Failed to get task ${id}`)
    }
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    token: string,
  ): Promise<TaskResponseDto> {
    this.logger.log(`Proxying update task ${id} request to tasks-service`)

    try {
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

      this.logger.log(`Task ${id} updated successfully via proxy`)
      return response.data
    } catch (error) {
      this.handleError(error, `Failed to update task ${id}`)
    }
  }

  async delete(id: string, token: string): Promise<void> {
    this.logger.log(`Proxying delete task ${id} request to tasks-service`)

    try {
      await firstValueFrom(
        this.httpService.delete(`${this.tasksServiceUrl}/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      )

      this.logger.log(`Task ${id} deleted successfully via proxy`)
    } catch (error) {
      this.handleError(error, `Failed to delete task ${id}`)
    }
  }

  async createComment(
    taskId: string,
    createCommentDto: CreateCommentDto,
    token: string,
  ): Promise<CommentResponseDto> {
    this.logger.log(
      `Proxying create comment on task ${taskId} request to tasks-service`,
    )

    try {
      const response = await firstValueFrom(
        this.httpService.post<CommentResponseDto>(
          `${this.tasksServiceUrl}/tasks/${taskId}/comments`,
          createCommentDto,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      )

      this.logger.log(
        `Comment created successfully on task ${taskId} via proxy`,
      )
      return response.data
    } catch (error) {
      this.handleError(error, `Failed to create comment on task ${taskId}`)
    }
  }

  async findComments(
    taskId: string,
    query: GetCommentsQueryDto,
    token: string,
  ): Promise<PaginatedCommentsResponseDto> {
    this.logger.log(
      `Proxying get comments for task ${taskId} request to tasks-service`,
    )

    try {
      const response = await firstValueFrom(
        this.httpService.get<PaginatedCommentsResponseDto>(
          `${this.tasksServiceUrl}/tasks/${taskId}/comments`,
          {
            params: query,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      )

      this.logger.log(
        `Comments retrieved successfully for task ${taskId} via proxy`,
      )
      return response.data
    } catch (error) {
      this.handleError(error, `Failed to get comments for task ${taskId}`)
    }
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status
      const responseMessage = error.response?.data?.message || error.message

      this.logger.error(`${message}: ${responseMessage}`)

      if (status === 400) {
        throw new BadRequestException(responseMessage)
      }

      if (status === 404) {
        throw new NotFoundException(responseMessage)
      }

      if (status === 401 || status === 403) {
        throw new BadRequestException('Unauthorized')
      }

      throw new InternalServerErrorException(responseMessage)
    }

    if (error instanceof Error) {
      this.logger.error(`${message}: ${error.message}`)
      throw new InternalServerErrorException(error.message)
    }

    this.logger.error(`${message}: Unknown error`)
    throw new InternalServerErrorException('An unexpected error occurred')
  }
}
