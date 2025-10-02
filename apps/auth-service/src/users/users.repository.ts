import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager())
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } })
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } })
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    return this.findOne({
      where: [{ email }, { username }],
    })
  }
}
