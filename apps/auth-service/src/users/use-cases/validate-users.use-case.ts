import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { User } from '../entities/user.entity'
import { UserResponseDto } from '../dto/responses'
import { UserMapper } from '../../auth/mappers/user.mapper'

@Injectable()
export class ValidateUsersUseCase {
  private readonly logger = new Logger(ValidateUsersUseCase.name)

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(userIds: string[]): Promise<UserResponseDto[]> {
    this.logger.log(`Validating ${userIds.length} users`)

    const users = await this.usersRepository.find({
      where: { id: In(userIds) },
      select: ['id', 'email', 'username'],
    })

    this.logger.log(`Found ${users.length} valid users`)

    return this.userMapper.toUserResponseDtoList(users)
  }
}
