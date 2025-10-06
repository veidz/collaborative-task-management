import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { User } from './entities/user.entity'
import { UserResponseDto } from './dto/responses'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async validateUsers(userIds: string[]): Promise<UserResponseDto[]> {
    this.logger.log(`Validating ${userIds.length} users`)

    const users = await this.usersRepository.find({
      where: { id: In(userIds) },
      select: ['id', 'email', 'username'],
    })

    this.logger.log(`Found ${users.length} valid users`)

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
    }))
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      select: ['id', 'email', 'username'],
      order: { createdAt: 'DESC' },
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
    }))
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'username'],
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    }
  }
}
