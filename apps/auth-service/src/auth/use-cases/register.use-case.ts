import { Injectable, ConflictException, Logger } from '@nestjs/common'
import { UsersRepository } from '../../users/users.repository'
import { RegisterDto } from '../dto/requests'
import { AuthResponseDto } from '../dto/responses'
import { PasswordHasher } from '../utils/password-hasher'
import { UserMapper } from '../mappers/user.mapper'

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name)

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`)

    await this.validateUserDoesNotExist(registerDto.email, registerDto.username)

    const hashedPassword = await this.passwordHasher.hash(registerDto.password)

    const user = await this.createUser(
      registerDto.email,
      registerDto.username,
      hashedPassword,
    )

    this.logger.log(`User registered successfully: ${user.id}`)

    return this.userMapper.toAuthResponseDto(user)
  }

  private async validateUserDoesNotExist(
    email: string,
    username: string,
  ): Promise<void> {
    const existingUser = await this.usersRepository.findByEmailOrUsername(
      email,
      username,
    )

    if (existingUser) {
      if (existingUser.email === email) {
        this.logger.warn(`Registration failed: Email already exists - ${email}`)
        throw new ConflictException('Email already exists')
      }
      if (existingUser.username === username) {
        this.logger.warn(
          `Registration failed: Username already exists - ${username}`,
        )
        throw new ConflictException('Username already exists')
      }
    }
  }

  private async createUser(
    email: string,
    username: string,
    hashedPassword: string,
  ) {
    const user = this.usersRepository.create({
      email,
      username,
      password: hashedPassword,
    })

    return this.usersRepository.save(user)
  }
}
