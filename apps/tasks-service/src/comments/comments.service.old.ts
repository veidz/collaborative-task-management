import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Comment } from './entities/comment.entity'
import { Task } from '../tasks/entities/task.entity'
import {
  CreateCommentDto,
  GetCommentsQueryDto,
  CommentResponseDto,
  PaginatedCommentsResponseDto,
} from './dto'
import { EventsPublisherService } from '../events/events-publisher.service'
import { AuthServiceClient } from 'src/common/clients/auth-service.client'

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name)

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly eventsPublisher: EventsPublisherService,
    private readonly authServiceClient: AuthServiceClient,
  ) {}

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentResponseDto> {
    this.logger.log(`Creating comment on task ${taskId} by user: ${userId}`)

    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['assignments'],
    })

    if (!task) {
      this.logger.warn(`Task ${taskId} not found`)
      throw new NotFoundException('Task not found')
    }

    const isCreator = task.createdBy === userId
    const isAssignee = task.assignments?.some((a) => a.userId === userId)

    if (!isCreator && !isAssignee) {
      this.logger.warn(
        `User ${userId} not authorized to comment on task ${taskId}`,
      )
      throw new ForbiddenException(
        'You are not authorized to comment on this task',
      )
    }

    const comment = new Comment()
    comment.content = createCommentDto.content
    comment.taskId = taskId
    comment.authorId = userId

    const savedComment = await this.commentsRepository.save(comment)

    this.logger.log(`Comment created: ${savedComment.id}`)

    await this.eventsPublisher.publishCommentCreated({
      commentId: savedComment.id,
      taskId: savedComment.taskId,
      content: savedComment.content,
      authorId: savedComment.authorId,
      createdAt: savedComment.createdAt,
    })

    const author = await this.authServiceClient.getUserById(userId)

    return {
      ...this.mapToResponseDto(savedComment),
      author: author || undefined,
    }
  }

  async findAll(
    taskId: string,
    query: GetCommentsQueryDto,
    userId: string,
  ): Promise<PaginatedCommentsResponseDto> {
    this.logger.log(`Fetching comments for task ${taskId}`)

    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['assignments'],
    })

    if (!task) {
      this.logger.warn(`Task ${taskId} not found`)
      throw new NotFoundException('Task not found')
    }

    const isCreator = task.createdBy === userId
    const isAssignee = task.assignments?.some((a) => a.userId === userId)

    if (!isCreator && !isAssignee) {
      this.logger.warn(
        `User ${userId} not authorized to view comments on task ${taskId}`,
      )
      throw new NotFoundException('Task not found')
    }

    const { page = 1, limit = 10 } = query
    const skip = (page - 1) * limit

    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { taskId },
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    })

    const authorIds = [...new Set(comments.map((c) => c.authorId))]
    const authors = await this.authServiceClient.getUsersByIds(authorIds)

    const commentsWithAuthors = comments.map((comment) => ({
      ...this.mapToResponseDto(comment),
      author: authors.get(comment.authorId) || undefined,
    }))

    const totalPages = Math.ceil(total / limit)

    this.logger.log(`Found ${total} comments for task ${taskId}`)

    return {
      data: commentsWithAuthors,
      total,
      page,
      limit,
      totalPages,
    }
  }

  private mapToResponseDto(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      taskId: comment.taskId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }
  }
}
