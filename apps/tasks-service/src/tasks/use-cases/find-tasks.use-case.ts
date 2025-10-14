import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task } from '../entities/task.entity'
import { GetTasksQueryDto } from '../dto/requests'
import { PaginatedTasksResponseDto } from '../dto/responses'
import { TaskMapper } from '../mappers/task.mapper'

@Injectable()
export class FindTasksUseCase {
  private readonly logger = new Logger(FindTasksUseCase.name)

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly taskMapper: TaskMapper,
  ) {}

  async execute(
    query: GetTasksQueryDto,
    userId: string,
  ): Promise<PaginatedTasksResponseDto> {
    this.logger.log(`Fetching tasks for user: ${userId}`)

    const { page = 1, limit = 10 } = query
    const skip = (page - 1) * limit

    const queryBuilder = this.buildQuery(query, userId, skip, limit)
    const [tasks, total] = await queryBuilder.getManyAndCount()

    this.logger.log(`Found ${total} tasks for user: ${userId}`)

    return {
      data: await this.taskMapper.toResponseDtoList(tasks),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  private buildQuery(
    query: GetTasksQueryDto,
    userId: string,
    skip: number,
    limit: number,
  ) {
    const { status, priority, assignedToMe, assignedTo } = query

    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignments', 'assignment')
      .where(
        '(task.createdBy = :userId OR EXISTS (SELECT 1 FROM task_assignments ta WHERE ta.task_id = task.id AND ta.user_id = :userId))',
        { userId },
      )
      .orderBy('task.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status })
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority })
    }

    if (assignedToMe) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM task_assignments ta WHERE ta.task_id = task.id AND ta.user_id = :userId)',
        { userId },
      )
    }

    if (assignedTo) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM task_assignments ta WHERE ta.task_id = task.id AND ta.user_id = :assignedTo)',
        { assignedTo },
      )
    }

    return queryBuilder
  }
}
