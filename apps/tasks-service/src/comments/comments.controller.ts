import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger'
import { CommentsService } from './comments.service'
import {
  CreateCommentDto,
  GetCommentsQueryDto,
  CommentResponseDto,
  PaginatedCommentsResponseDto,
} from './dto'

@ApiTags('Comments')
@Controller('tasks/:taskId/comments')
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name)

  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a comment on a task',
    description: 'Internal endpoint - Gateway forwards with x-user-id header',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing user ID header',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async create(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Headers('x-user-id') userId: string,
  ): Promise<CommentResponseDto> {
    if (!userId) {
      this.logger.warn(
        `Create comment for task ${taskId} missing x-user-id header`,
      )
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Creating comment on task ${taskId} by user: ${userId}`)
    return this.commentsService.create(taskId, createCommentDto, userId)
  }

  @Get()
  @ApiOperation({
    summary: 'Get all comments for a task',
    description: 'Internal endpoint - Gateway forwards with x-user-id header',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: PaginatedCommentsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing user ID header',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async findAll(
    @Param('taskId') taskId: string,
    @Query() query: GetCommentsQueryDto,
    @Headers('x-user-id') userId: string,
  ): Promise<PaginatedCommentsResponseDto> {
    if (!userId) {
      this.logger.warn(
        `Get comments for task ${taskId} missing x-user-id header`,
      )
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Getting comments for task ${taskId} by user: ${userId}`)
    return this.commentsService.findAll(taskId, query, userId)
  }
}
