import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { UsersRepository } from '../../users/users.repository'
import { LoginDto } from '../dto/requests'
import { LoginResponseDto } from '../dto/responses'
import { PasswordHasher } from '../utils/password-hasher'
import { TokenGenerator } from '../utils/token-generator'
import { UserMapper } from '../mappers/user.mapper'

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name)

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`)

    const user = await this.findUserByEmail(loginDto.email)

    await this.validatePassword(
      loginDto.password,
      user.password,
      loginDto.email,
    )

    const accessToken = this.tokenGenerator.generateAccessToken(
      user.id,
      user.email,
      user.username,
    )
    const refreshToken = this.tokenGenerator.generateRefreshToken(
      user.id,
      user.email,
      user.username,
    )

    this.logger.log(`User logged in successfully: ${user.id}`)

    return {
      user: this.userMapper.toAuthResponseDto(user),
      accessToken,
      refreshToken,
    }
  }

  private async findUserByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      this.logger.warn(`Login failed: User not found - ${email}`)
      throw new UnauthorizedException('Invalid credentials')
    }

    return user
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
    email: string,
  ): Promise<void> {
    const isPasswordValid = await this.passwordHasher.compare(
      plainPassword,
      hashedPassword,
    )

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password - ${email}`)
      throw new UnauthorizedException('Invalid credentials')
    }
  }
}
