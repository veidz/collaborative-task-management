import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { CreateCommentDto } from './dto/create-comment.dto'
import { GetCommentsQueryDto } from './dto/get-comments-query.dto'
import { HttpProxyService } from '../common/services/http-proxy.service'
import { ErrorHandlerService } from '../common/services/error-handler.service'

@Injectable()
export class CommentsService extends HttpProxyService {
  protected readonly logger = new Logger(CommentsService.name)
  protected readonly serviceUrl: string
  protected readonly serviceName = 'Comments Service'

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

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ) {
    this.logger.log(
      `Proxying create comment request for task ${taskId} by user: ${userId}`,
    )
    const result = await this.post(
      `/tasks/${taskId}/comments`,
      createCommentDto,
      userId,
    )
    this.logger.log(`Comment created successfully for task ${taskId}`)
    return result
  }

  async findAll(taskId: string, query: GetCommentsQueryDto, userId: string) {
    this.logger.log(
      `Proxying get comments request for task ${taskId} by user: ${userId}`,
    )
    const result = await this.get(
      `/tasks/${taskId}/comments`,
      userId,
      undefined,
      query as Record<string, unknown>,
    )
    this.logger.log(`Comments retrieved successfully for task ${taskId}`)
    return result
  }
}
