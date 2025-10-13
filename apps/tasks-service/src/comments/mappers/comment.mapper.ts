import { Injectable } from '@nestjs/common'
import { Comment } from '../entities/comment.entity'
import { CommentResponseDto } from '../dto'
import { AuthServiceClient } from '../../common/clients/auth-service.client'

@Injectable()
export class CommentMapper {
  constructor(private readonly authServiceClient: AuthServiceClient) {}

  async toResponseDto(comment: Comment): Promise<CommentResponseDto> {
    const author = await this.authServiceClient.getUserById(comment.authorId)

    return {
      id: comment.id,
      content: comment.content,
      taskId: comment.taskId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: author || undefined,
    }
  }

  async toResponseDtoList(comments: Comment[]): Promise<CommentResponseDto[]> {
    const authorIds = [...new Set(comments.map((c) => c.authorId))]
    const authors = await this.authServiceClient.getUsersByIds(authorIds)

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      taskId: comment.taskId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: authors.get(comment.authorId) || undefined,
    }))
  }
}
