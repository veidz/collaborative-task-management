import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Comment } from './entities/comment.entity'
import { Task } from '../tasks/entities/task.entity'
import { CreateCommentDto } from './dto/create-comment.dto'
import { GetCommentsQueryDto } from './dto/get-comments-query.dto'
import { CommentResponseDto } from './dto/comment-response.dto'
import { PaginatedCommentsResponseDto } from './dto/paginated-comments-response.dto'
import { EventsPublisherService } from '../events/events-publisher.service'

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name)

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly eventsPublisher: EventsPublisherService,
  ) {}

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentResponseDto> {
    this.logger.log(`Creating comment on task ${taskId} by user: ${userId}`)

    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
    })

    if (!task) {
      this.logger.warn(`Task ${taskId} not found`)
      throw new NotFoundException('Task not found')
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

    return this.mapToResponseDto(savedComment)
  }

  async findAll(
    taskId: string,
    query: GetCommentsQueryDto,
    userId: string,
  ): Promise<PaginatedCommentsResponseDto> {
    this.logger.log(`Fetching comments for task ${taskId}`)

    const task = await this.tasksRepository.findOne({
      where: { id: taskId, createdBy: userId },
    })

    if (!task) {
      this.logger.warn(`Task ${taskId} not found for user: ${userId}`)
      throw new NotFoundException('Task not found')
    }

    const { page = 1, limit = 10 } = query
    const skip = (page - 1) * limit

    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { taskId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(total / limit)

    this.logger.log(`Found ${total} comments for task ${taskId}`)

    return {
      data: comments.map((comment) => this.mapToResponseDto(comment)),
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
      authorId: comment.authorId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }
  }
}
