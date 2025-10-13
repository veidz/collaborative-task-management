import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { UserResponseDto } from '../dto/responses'
import { UserMapper } from '../../auth/mappers/user.mapper'

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'username'],
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return this.userMapper.toUserResponseDto(user)
  }
}
