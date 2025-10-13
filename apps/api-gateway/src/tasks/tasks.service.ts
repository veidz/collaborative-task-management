import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { GetTasksQueryDto } from './dto/get-tasks-query.dto'
import { AssignUsersDto } from './dto/assign-users.dto'
import { UnassignUsersDto } from './dto/unassign-users.dto'
import { HttpProxyService } from '../common/services/http-proxy.service'
import { ErrorHandlerService } from '../common/services/error-handler.service'

@Injectable()
export class TasksService extends HttpProxyService {
  protected readonly logger = new Logger(TasksService.name)
  protected readonly serviceUrl: string
  protected readonly serviceName = 'Tasks Service'

  constructor(
    httpService: HttpService,
    errorHandler: ErrorHandlerService,
    configService: ConfigService,
  ) {
    super(httpService, errorHandler)

    const url = configService.get<string>('services.tasks.url')

    if (!url) {
      throw new Error(
        'TASKS_SERVICE_URL is not defined in environment variables',
      )
    }

    this.serviceUrl = url
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    this.logger.log(`Proxying create task request for user: ${userId}`)
    const result = await this.post('/tasks', createTaskDto, userId)
    this.logger.log(`Task created successfully for user: ${userId}`)
    return result
  }

  async findAll(query: GetTasksQueryDto, userId: string) {
    this.logger.log(`Proxying get tasks request for user: ${userId}`)
    const result = await this.get(
      '/tasks',
      userId,
      undefined,
      query as Record<string, unknown>,
    )
    this.logger.log(`Tasks retrieved successfully for user: ${userId}`)
    return result
  }

  async findOne(id: string, userId: string) {
    this.logger.log(`Proxying get task ${id} request for user: ${userId}`)
    const result = await this.get(`/tasks/${id}`, userId)
    this.logger.log(`Task ${id} retrieved successfully`)
    return result
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    this.logger.log(`Proxying update task ${id} request for user: ${userId}`)
    const result = await this.put(`/tasks/${id}`, updateTaskDto, userId)
    this.logger.log(`Task ${id} updated successfully`)
    return result
  }

  async remove(id: string, userId: string) {
    this.logger.log(`Proxying delete task ${id} request for user: ${userId}`)
    await this.delete(`/tasks/${id}`, userId)
    this.logger.log(`Task ${id} deleted successfully`)
  }

  async assignUsers(
    id: string,
    assignUsersDto: AssignUsersDto,
    userId: string,
  ) {
    this.logger.log(`Proxying assign users to task ${id} for user: ${userId}`)
    const result = await this.put(`/tasks/${id}/assign`, assignUsersDto, userId)
    this.logger.log(`Users assigned to task ${id} successfully`)
    return result
  }

  async unassignUsers(
    id: string,
    unassignUsersDto: UnassignUsersDto,
    userId: string,
  ) {
    this.logger.log(
      `Proxying unassign users from task ${id} for user: ${userId}`,
    )
    const result = await this.put(
      `/tasks/${id}/unassign`,
      unassignUsersDto,
      userId,
    )
    this.logger.log(`Users unassigned from task ${id} successfully`)
    return result
  }
}
