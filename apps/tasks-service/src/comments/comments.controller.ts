import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { Request } from 'express'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { GetCommentsQueryDto } from './dto/get-comments-query.dto'
import { CommentResponseDto } from './dto/comment-response.dto'
import { PaginatedCommentsResponseDto } from './dto/paginated-comments-response.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@ApiTags('Comments')
@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a comment on a task' })
  @ApiParam({
    name: 'taskId',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async create(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(taskId, createCommentDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a task' })
  @ApiParam({
    name: 'taskId',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: PaginatedCommentsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async findAll(
    @Param('taskId') taskId: string,
    @Query() query: GetCommentsQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedCommentsResponseDto> {
    return this.commentsService.findAll(taskId, query, req.user.id)
  }
}
