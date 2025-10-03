import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Task } from './entities/task.entity'

@Injectable()
export class TasksRepository extends Repository<Task> {
  constructor(dataSource: DataSource) {
    super(Task, dataSource.createEntityManager())
  }
}
