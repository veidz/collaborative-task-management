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
import { CreateCommentDto } from './dto/create-comment.dto'
import { GetCommentsQueryDto } from './dto/get-comments-query.dto'

@Injectable()
export class CommentsService implements OnModuleInit {
  private readonly logger = new Logger(CommentsService.name)
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
    this.logger.log(`Comments service proxying to: ${this.tasksServiceUrl}`)
  }

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ) {
    this.logger.log(
      `Proxying create comment request for task ${taskId} by user: ${userId}`,
    )

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.tasksServiceUrl}/tasks/${taskId}/comments`,
          createCommentDto,
          {
            headers: { 'x-user-id': userId },
          },
        ),
      )

      this.logger.log(`Comment created successfully for task ${taskId}`)
      return response.data
    } catch (error) {
      this.handleError(error, `Create comment for task ${taskId} failed`)
    }
  }

  async findAll(taskId: string, query: GetCommentsQueryDto, userId: string) {
    this.logger.log(
      `Proxying get comments request for task ${taskId} by user: ${userId}`,
    )

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.tasksServiceUrl}/tasks/${taskId}/comments`,
          {
            params: query,
            headers: { 'x-user-id': userId },
          },
        ),
      )

      this.logger.log(`Comments retrieved successfully for task ${taskId}`)
      this.logger.log(response.data)

      return response.data
    } catch (error) {
      this.handleError(error, `Get comments for task ${taskId} failed`)
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
