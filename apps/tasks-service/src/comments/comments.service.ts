import { Injectable } from '@nestjs/common'
import {
  CreateCommentDto,
  GetCommentsQueryDto,
  CommentResponseDto,
  PaginatedCommentsResponseDto,
} from './dto'
import { CreateCommentUseCase, FindCommentsUseCase } from './use-cases'

@Injectable()
export class CommentsService {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly findCommentsUseCase: FindCommentsUseCase,
  ) {}

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentResponseDto> {
    return this.createCommentUseCase.execute(taskId, createCommentDto, userId)
  }

  async findAll(
    taskId: string,
    query: GetCommentsQueryDto,
    userId: string,
  ): Promise<PaginatedCommentsResponseDto> {
    return this.findCommentsUseCase.execute(taskId, query, userId)
  }
}
