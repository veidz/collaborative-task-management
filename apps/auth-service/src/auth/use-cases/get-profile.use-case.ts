import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { UsersRepository } from '../../users/users.repository'
import { ProfileResponseDto } from '../dto/responses'
import { UserMapper } from '../mappers/user.mapper'

@Injectable()
export class GetProfileUseCase {
  private readonly logger = new Logger(GetProfileUseCase.name)

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(userId: string): Promise<ProfileResponseDto> {
    this.logger.log(`Profile request for user: ${userId}`)

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      this.logger.warn(`Profile not found for user: ${userId}`)
      throw new NotFoundException('User not found')
    }

    return this.userMapper.toProfileResponseDto(user)
  }
}
