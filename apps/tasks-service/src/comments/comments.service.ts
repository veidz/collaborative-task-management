import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CommentsRepository } from './comments.repository'
import { TasksRepository } from '../tasks/tasks.repository'
import { CreateCommentDto } from './dto/create-comment.dto'
import { GetCommentsQueryDto } from './dto/get-comments-query.dto'
import { CommentResponseDto } from './dto/comment-response.dto'
import { PaginatedCommentsResponseDto } from './dto/paginated-comments-response.dto'
import { Comment } from './entities/comment.entity'
import { EventsPublisherService } from '../events/events-publisher.service'
import { CommentCreatedEvent } from 'src/events/interfaces/task-events.interface'

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name)

  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly tasksRepository: TasksRepository,
    private readonly eventsPublisher: EventsPublisherService,
  ) {}

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentResponseDto> {
    this.logger.log(`Creating comment on task ${taskId} by user: ${userId}`)

    const task = await this.tasksRepository.findByIdAndUser(taskId, userId)

    if (!task) {
      this.logger.warn(
        `Task ${taskId} not found or not owned by user: ${userId}`,
      )
      throw new NotFoundException('Task not found')
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      taskId,
      authorId: userId,
    })

    const savedComment = await this.commentsRepository.save(comment)

    this.logger.log(`Comment created successfully: ${savedComment.id}`)

    const event: CommentCreatedEvent = {
      commentId: savedComment.id,
      content: savedComment.content,
      taskId: savedComment.taskId,
      authorId: savedComment.authorId,
      createdAt: savedComment.createdAt,
    }

    await this.eventsPublisher.publishCommentCreated(event)

    return this.mapToResponseDto(savedComment)
  }

  async findByTask(
    taskId: string,
    query: GetCommentsQueryDto,
    userId: string,
  ): Promise<PaginatedCommentsResponseDto> {
    this.logger.log(`Fetching comments for task ${taskId} by user: ${userId}`)

    const task = await this.tasksRepository.findByIdAndUser(taskId, userId)

    if (!task) {
      this.logger.warn(
        `Task ${taskId} not found or not owned by user: ${userId}`,
      )
      throw new NotFoundException('Task not found')
    }

    const page = query.page ?? 1
    const limit = query.limit ?? 10

    const [comments, total] = await this.commentsRepository.findByTask(
      taskId,
      page,
      limit,
    )

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
