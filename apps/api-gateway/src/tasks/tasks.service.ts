import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { GetTasksQueryDto } from './dto/get-tasks-query.dto'
import { AssignUsersDto } from './dto/assign-users.dto'
import { UnassignUsersDto } from './dto/unassign-users.dto'

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

  async create(createTaskDto: CreateTaskDto, userId: string) {
    this.logger.log(`Proxying create task request for user: ${userId}`)

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.tasksServiceUrl}/tasks`, createTaskDto, {
          headers: { 'x-user-id': userId },
        }),
      )

      this.logger.log(`Task created successfully for user: ${userId}`)
      return response.data
    } catch (error) {
      this.handleError(error, 'Create task failed')
    }
  }

  async findAll(query: GetTasksQueryDto, userId: string) {
    this.logger.log(`Proxying get tasks request for user: ${userId}`)

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/tasks`, {
          params: query,
          headers: { 'x-user-id': userId },
        }),
      )

      this.logger.log(`Tasks retrieved successfully for user: ${userId}`)
      return response.data
    } catch (error) {
      this.handleError(error, 'Get tasks failed')
    }
  }

  async findOne(id: string, userId: string) {
    this.logger.log(`Proxying get task ${id} request for user: ${userId}`)

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/tasks/${id}`, {
          headers: { 'x-user-id': userId },
        }),
      )

      this.logger.log(`Task ${id} retrieved successfully`)
      return response.data
    } catch (error) {
      this.handleError(error, `Get task ${id} failed`)
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    this.logger.log(`Proxying update task ${id} request for user: ${userId}`)

    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.tasksServiceUrl}/tasks/${id}`,
          updateTaskDto,
          {
            headers: { 'x-user-id': userId },
          },
        ),
      )

      this.logger.log(`Task ${id} updated successfully`)
      return response.data
    } catch (error) {
      this.handleError(error, `Update task ${id} failed`)
    }
  }

  async remove(id: string, userId: string) {
    this.logger.log(`Proxying delete task ${id} request for user: ${userId}`)

    try {
      await firstValueFrom(
        this.httpService.delete(`${this.tasksServiceUrl}/tasks/${id}`, {
          headers: { 'x-user-id': userId },
        }),
      )

      this.logger.log(`Task ${id} deleted successfully`)
      return
    } catch (error) {
      this.handleError(error, `Delete task ${id} failed`)
    }
  }

  async assignUsers(
    id: string,
    assignUsersDto: AssignUsersDto,
    userId: string,
  ) {
    this.logger.log(`Proxying assign users to task ${id} for user: ${userId}`)

    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.tasksServiceUrl}/tasks/${id}/assign`,
          assignUsersDto,
          {
            headers: { 'x-user-id': userId },
          },
        ),
      )

      this.logger.log(`Users assigned to task ${id} successfully`)
      return response.data
    } catch (error) {
      this.handleError(error, `Assign users to task ${id} failed`)
    }
  }

  async unassignUsers(
    id: string,
    unassignUsersDto: UnassignUsersDto,
    userId: string,
  ) {
    this.logger.log(
      `Proxying unassign users from task ${id} for user: ${userId}`,
    )

    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.tasksServiceUrl}/tasks/${id}/unassign`,
          unassignUsersDto,
          {
            headers: { 'x-user-id': userId },
          },
        ),
      )

      this.logger.log(`Users unassigned from task ${id} successfully`)
      return response.data
    } catch (error) {
      this.handleError(error, `Unassign users from task ${id} failed`)
    }
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status
      const responseMessage = error.response?.data?.message || error.message

      this.logger.error(`${message}: ${responseMessage}`)

      if (status === 404) {
        throw new NotFoundException(responseMessage)
      }

      if (status === 403) {
        throw new ForbiddenException(responseMessage)
      }

      if (status === 400) {
        throw new BadRequestException(responseMessage)
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
