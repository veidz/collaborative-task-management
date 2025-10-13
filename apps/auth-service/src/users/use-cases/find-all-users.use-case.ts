import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { UserResponseDto } from '../dto/responses'
import { UserMapper } from '../../auth/mappers/user.mapper'

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      select: ['id', 'email', 'username'],
      order: { createdAt: 'DESC' },
    })

    return this.userMapper.toUserResponseDtoList(users)
  }
}
