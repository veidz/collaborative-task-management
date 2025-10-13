import { Injectable } from '@nestjs/common'
import {
  AssignUsersDto,
  CreateTaskDto,
  GetTasksQueryDto,
  UnassignUsersDto,
  UpdateTaskDto,
} from './dto/requests'
import { PaginatedTasksResponseDto, TaskResponseDto } from './dto/responses'
import {
  CreateTaskUseCase,
  FindTasksUseCase,
  FindOneTaskUseCase,
  UpdateTaskUseCase,
  DeleteTaskUseCase,
  AssignUsersUseCase,
  UnassignUsersUseCase,
} from './use-cases'

@Injectable()
export class TasksService {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly findTasksUseCase: FindTasksUseCase,
    private readonly findOneTaskUseCase: FindOneTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly assignUsersUseCase: AssignUsersUseCase,
    private readonly unassignUsersUseCase: UnassignUsersUseCase,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    return this.createTaskUseCase.execute(createTaskDto, userId)
  }

  async findAll(
    query: GetTasksQueryDto,
    userId: string,
  ): Promise<PaginatedTasksResponseDto> {
    return this.findTasksUseCase.execute(query, userId)
  }

  async findOne(id: string, userId: string): Promise<TaskResponseDto> {
    return this.findOneTaskUseCase.execute(id, userId)
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    return this.updateTaskUseCase.execute(id, updateTaskDto, userId)
  }

  async remove(id: string, userId: string): Promise<void> {
    return this.deleteTaskUseCase.execute(id, userId)
  }

  async assignUsers(
    id: string,
    assignUsersDto: AssignUsersDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    return this.assignUsersUseCase.execute(id, assignUsersDto, userId)
  }

  async unassignUsers(
    id: string,
    unassignUsersDto: UnassignUsersDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    return this.unassignUsersUseCase.execute(id, unassignUsersDto, userId)
  }
}
