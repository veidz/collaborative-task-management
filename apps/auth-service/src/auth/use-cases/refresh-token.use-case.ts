import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { UsersRepository } from '../../users/users.repository'
import { RefreshTokenDto } from '../dto/requests'
import { RefreshTokenResponseDto } from '../dto/responses'
import { TokenGenerator } from '../utils/token-generator'

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name)

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    this.logger.log('Token refresh attempt')

    try {
      const payload = this.tokenGenerator.verifyToken(
        refreshTokenDto.refreshToken,
      )

      this.validateTokenType(payload.type)

      const user = await this.findUserById(payload.sub)

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

      this.logger.log(`Token refreshed successfully for user: ${user.id}`)

      return {
        accessToken,
        refreshToken,
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      this.logger.warn(`Token refresh failed: ${errorMessage}`)
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  private validateTokenType(tokenType: string): void {
    if (tokenType !== 'refresh') {
      this.logger.warn('Token refresh failed: Invalid token type')
      throw new UnauthorizedException('Invalid token type')
    }
  }

  private async findUserById(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      this.logger.warn(`Token refresh failed: User not found - ${userId}`)
      throw new UnauthorizedException('Invalid token')
    }

    return user
  }
}
