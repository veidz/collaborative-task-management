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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { AssignUsersDto } from './dto/assign-users.dto'
import { UnassignUsersDto } from './dto/unassign-users.dto'

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request) {
    return this.tasksService.create(createTaskDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: GetTasksQueryDto, @Req() req: Request) {
    return this.tasksService.findAll(query, req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    return this.tasksService.findOne(id, req.user.id)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: Request,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.tasksService.remove(id, req.user.id)
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign users to task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Users assigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user IDs' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async assignUsers(
    @Param('id') id: string,
    @Body() assignUsersDto: AssignUsersDto,
    @Req() req: Request,
  ) {
    return this.tasksService.assignUsers(id, assignUsersDto, req.user.id)
  }

  @Put(':id/unassign')
  @ApiOperation({ summary: 'Unassign users from task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Users unassigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user IDs' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async unassignUsers(
    @Param('id') id: string,
    @Body() unassignUsersDto: UnassignUsersDto,
    @Req() req: Request,
  ) {
    return this.tasksService.unassignUsers(id, unassignUsersDto, req.user.id)
  }
}
