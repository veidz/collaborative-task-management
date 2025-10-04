import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { Request } from 'express'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { GetTasksQueryDto } from './dto/get-tasks-query.dto'
import { AssignUsersDto } from './dto/assign-users.dto'
import { UnassignUsersDto } from './dto/unassign-users.dto'
import { TaskResponseDto } from './dto/task-response.dto'
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task with optional assignees' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or user IDs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: Request,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(createTaskDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for current user with filters' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: PaginatedTasksResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async findAll(
    @Query() query: GetTasksQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedTasksResponseDto> {
    return this.tasksService.findAll(query, req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to view this task',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id, req.user.id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update task (replaces assignees if provided)' })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or user IDs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to update this task',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: Request,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, updateTaskDto, req.user.id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task (creator only)' })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    return this.tasksService.remove(id, req.user.id)
  }

  @Put(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign users to task (adds to existing assignees)',
  })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Users assigned successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user IDs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to assign users',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async assignUsers(
    @Param('id') id: string,
    @Body() assignUsersDto: AssignUsersDto,
    @Req() req: Request,
  ): Promise<TaskResponseDto> {
    return this.tasksService.assignUsers(id, assignUsersDto, req.user.id)
  }

  @Put(':id/unassign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unassign users from task' })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Users unassigned successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to unassign users',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async unassignUsers(
    @Param('id') id: string,
    @Body() unassignUsersDto: UnassignUsersDto,
    @Req() req: Request,
  ): Promise<TaskResponseDto> {
    return this.tasksService.unassignUsers(id, unassignUsersDto, req.user.id)
  }
}
