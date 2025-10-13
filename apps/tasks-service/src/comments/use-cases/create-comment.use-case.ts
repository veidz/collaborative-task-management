import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Comment } from '../entities/comment.entity'
import { CreateCommentDto, CommentResponseDto } from '../dto'
import { EventsPublisherService } from '../../events/events-publisher.service'
import { TaskAuthorizationGuard } from '../../tasks/guards/task-authorization.guard'
import { CommentMapper } from '../mappers/comment.mapper'

@Injectable()
export class CreateCommentUseCase {
  private readonly logger = new Logger(CreateCommentUseCase.name)

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly taskAuthGuard: TaskAuthorizationGuard,
    private readonly eventsPublisher: EventsPublisherService,
    private readonly commentMapper: CommentMapper,
  ) {}

  async execute(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentResponseDto> {
    this.logger.log(`Creating comment on task ${taskId} by user: ${userId}`)

    const task = await this.taskAuthGuard.findTaskOrFail(taskId)
    this.taskAuthGuard.ensureUserCanView(task, userId)

    const comment = await this.createComment(taskId, createCommentDto, userId)
    await this.publishEvent(comment)

    this.logger.log(`Comment created: ${comment.id}`)

    return this.commentMapper.toResponseDto(comment)
  }

  private async createComment(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = new Comment()
    comment.content = createCommentDto.content
    comment.taskId = taskId
    comment.authorId = userId

    return this.commentsRepository.save(comment)
  }

  private async publishEvent(comment: Comment): Promise<void> {
    await this.eventsPublisher.publishCommentCreated({
      commentId: comment.id,
      taskId: comment.taskId,
      content: comment.content,
      authorId: comment.authorId,
      createdAt: comment.createdAt,
    })
  }
}
