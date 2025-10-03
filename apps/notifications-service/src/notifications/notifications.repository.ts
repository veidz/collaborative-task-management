import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Notification } from './entities/notification.entity'

@Injectable()
export class NotificationsRepository extends Repository<Notification> {
  constructor(dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager())
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    unreadOnly: boolean = false,
  ): Promise<[Notification[], number]> {
    const skip = (page - 1) * limit

    const queryBuilder = this.createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .orderBy('notification.created_at', 'DESC')
      .skip(skip)
      .take(limit)

    if (unreadOnly) {
      queryBuilder.andWhere('notification.read = :read', { read: false })
    }

    return queryBuilder.getManyAndCount()
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const result = await this.update({ id, userId }, { read: true })

    return (result.affected ?? 0) > 0
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.update({ userId, read: false }, { read: true })

    return result.affected ?? 0
  }

  async countUnread(userId: string): Promise<number> {
    return this.count({
      where: { userId, read: false },
    })
  }
}
