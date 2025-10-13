import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task } from '../entities/task.entity'

@Injectable()
export class TaskAuthorizationGuard {
  private readonly logger = new Logger(TaskAuthorizationGuard.name)

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async findTaskOrFail(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignments'],
    })

    if (!task) {
      this.logger.warn(`Task ${id} not found`)
      throw new NotFoundException('Task not found')
    }

    return task
  }

  ensureUserCanView(task: Task, userId: string): void {
    if (!this.canUserAccessTask(task, userId)) {
      this.logger.warn(
        `User ${userId} is not authorized to view task ${task.id}`,
      )
      throw new ForbiddenException('You are not authorized to view this task')
    }
  }

  ensureUserCanModify(task: Task, userId: string): void {
    if (!this.canUserAccessTask(task, userId)) {
      this.logger.warn(
        `User ${userId} is not authorized to modify task ${task.id}`,
      )
      throw new ForbiddenException('You are not authorized to modify this task')
    }
  }

  ensureUserIsCreator(task: Task, userId: string): void {
    if (task.createdBy !== userId) {
      this.logger.warn(`User ${userId} is not the creator of task ${task.id}`)
      throw new ForbiddenException(
        'Only the task creator can perform this action',
      )
    }
  }

  canUserAccessTask(task: Task, userId: string): boolean {
    const isCreator = task.createdBy === userId
    const isAssignee = task.assignments?.some((a) => a.userId === userId)
    return isCreator || isAssignee
  }
}
