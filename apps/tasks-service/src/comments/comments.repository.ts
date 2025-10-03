import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Comment } from './entities/comment.entity'

@Injectable()
export class CommentsRepository extends Repository<Comment> {
  constructor(dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager())
  }

  async findByTask(
    taskId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Comment[], number]> {
    const skip = (page - 1) * limit

    return this.findAndCount({
      where: { taskId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    })
  }
}
