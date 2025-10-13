import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Comment } from '../entities/comment.entity'
import { GetCommentsQueryDto, PaginatedCommentsResponseDto } from '../dto'
import { TaskAuthorizationGuard } from '../../tasks/guards/task-authorization.guard'
import { CommentMapper } from '../mappers/comment.mapper'

@Injectable()
export class FindCommentsUseCase {
  private readonly logger = new Logger(FindCommentsUseCase.name)

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly taskAuthGuard: TaskAuthorizationGuard,
    private readonly commentMapper: CommentMapper,
  ) {}

  async execute(
    taskId: string,
    query: GetCommentsQueryDto,
    userId: string,
  ): Promise<PaginatedCommentsResponseDto> {
    this.logger.log(`Fetching comments for task ${taskId}`)

    const task = await this.taskAuthGuard.findTaskOrFail(taskId)
    this.taskAuthGuard.ensureUserCanView(task, userId)

    const { page = 1, limit = 10 } = query
    const skip = (page - 1) * limit

    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { taskId },
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    })

    const commentsWithAuthors =
      await this.commentMapper.toResponseDtoList(comments)

    this.logger.log(`Found ${total} comments for task ${taskId}`)

    return {
      data: commentsWithAuthors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
