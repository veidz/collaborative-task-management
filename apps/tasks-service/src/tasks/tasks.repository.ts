import { Injectable } from '@nestjs/common'
import { DataSource, Repository, FindOptionsWhere } from 'typeorm'
import { Task } from './entities/task.entity'
import { TaskStatus } from './enums/task-status.enum'
import { TaskPriority } from './enums/task-priority.enum'

@Injectable()
export class TasksRepository extends Repository<Task> {
  constructor(dataSource: DataSource) {
    super(Task, dataSource.createEntityManager())
  }

  async findAllByUser(
    userId: string,
    status?: TaskStatus,
    priority?: TaskPriority,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Task[], number]> {
    const where: FindOptionsWhere<Task> = { createdById: userId }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    const skip = (page - 1) * limit

    return this.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    })
  }

  async findByIdAndUser(id: string, userId: string): Promise<Task | null> {
    return this.findOne({
      where: { id, createdById: userId },
    })
  }
}
