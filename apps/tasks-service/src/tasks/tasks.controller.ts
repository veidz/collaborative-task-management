import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { GetTasksQueryDto } from './dto/get-tasks-query.dto'
import { AssignUsersDto } from './dto/assign-users.dto'
import { UnassignUsersDto } from './dto/unassign-users.dto'
import { TaskResponseDto } from './dto/task-response.dto'
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto'

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name)

  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new task',
    description: 'Internal endpoint - Gateway forwards with x-user-id header',
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Missing user ID header' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Headers('x-user-id') userId: string,
  ): Promise<TaskResponseDto> {
    if (!userId) {
      this.logger.warn('Create task request missing x-user-id header')
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Creating task for user: ${userId}`)
    return this.tasksService.create(createTaskDto, userId)
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks with filters',
    description: 'Internal endpoint - Gateway forwards with x-user-id header',
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: PaginatedTasksResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Missing user ID header' })
  async findAll(
    @Query() query: GetTasksQueryDto,
    @Headers('x-user-id') userId: string,
  ): Promise<PaginatedTasksResponseDto> {
    if (!userId) {
      this.logger.warn('Get tasks request missing x-user-id header')
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Getting tasks for user: ${userId}`)
    return this.tasksService.findAll(query, userId)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Internal endpoint - Gateway forwards with x-user-id header',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Missing user ID header' })
  async findOne(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ): Promise<TaskResponseDto> {
    if (!userId) {
      this.logger.warn(`Get task ${id} request missing x-user-id header`)
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Getting task ${id} for user: ${userId}`)
    return this.tasksService.findOne(id, userId)
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update task',
    description: 'Internal endpoint - Gateway forwards with x-user-id header',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Missing user ID header' })
  @ApiResponse({ status: 403, description: 'Forbidden - not task owner' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Headers('x-user-id') userId: string,
  ): Promise<TaskResponseDto> {
    if (!userId) {
      this.logger.warn(`Update task ${id} request missing x-user-id header`)
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Updating task ${id} for user: ${userId}`)
    return this.tasksService.update(id, updateTaskDto, userId)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete task',
    description: 'Internal endpoint - Gateway forwards with x-user-id header',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Missing user ID header' })
  @ApiResponse({ status: 403, description: 'Forbidden - not task owner' })
  async remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ): Promise<void> {
    if (!userId) {
      this.logger.warn(`Delete task ${id} request missing x-user-id header`)
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Deleting task ${id} for user: ${userId}`)
    return this.tasksService.remove(id, userId)
  }

  @Put(':id/assign')
  @ApiOperation({
    summary: 'Assign users to task',
    description: 'Internal endpoint - Gateway forwards with x-user-id header',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Users assigned successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid user IDs' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Missing user ID header' })
  @ApiResponse({ status: 403, description: 'Forbidden - not task owner' })
  async assignUsers(
    @Param('id') id: string,
    @Body() assignUsersDto: AssignUsersDto,
    @Headers('x-user-id') userId: string,
  ): Promise<TaskResponseDto> {
    if (!userId) {
      this.logger.warn(
        `Assign users to task ${id} request missing x-user-id header`,
      )
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Assigning users to task ${id} by user: ${userId}`)
    return this.tasksService.assignUsers(id, assignUsersDto, userId)
  }

  @Put(':id/unassign')
  @ApiOperation({
    summary: 'Unassign users from task',
    description: 'Internal endpoint - Gateway forwards with x-user-id header',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Users unassigned successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid user IDs' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Missing user ID header' })
  @ApiResponse({ status: 403, description: 'Forbidden - not task owner' })
  async unassignUsers(
    @Param('id') id: string,
    @Body() unassignUsersDto: UnassignUsersDto,
    @Headers('x-user-id') userId: string,
  ): Promise<TaskResponseDto> {
    if (!userId) {
      this.logger.warn(
        `Unassign users from task ${id} request missing x-user-id header`,
      )
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Unassigning users from task ${id} by user: ${userId}`)
    return this.tasksService.unassignUsers(id, unassignUsersDto, userId)
  }
}
