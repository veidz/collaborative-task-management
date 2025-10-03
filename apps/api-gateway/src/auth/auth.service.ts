import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { AuthResponseDto } from './dto/auth-response.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto'

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name)
  private readonly authServiceUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('services.auth.url')

    if (!url) {
      throw new Error(
        'AUTH_SERVICE_URL is not defined in environment variables',
      )
    }

    this.authServiceUrl = url
  }

  onModuleInit() {
    this.logger.log(`Auth service URL configured: ${this.authServiceUrl}`)
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(
      `Proxying registration request for email: ${registerDto.email}`,
    )

    try {
      const response = await firstValueFrom(
        this.httpService.post<AuthResponseDto>(
          `${this.authServiceUrl}/auth/register`,
          registerDto,
        ),
      )

      this.logger.log(`User registered successfully: ${registerDto.email}`)
      return response.data
    } catch (error) {
      this.handleError(
        error,
        `Registration failed for email: ${registerDto.email}`,
      )
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Proxying login request for email: ${loginDto.email}`)

    try {
      const response = await firstValueFrom(
        this.httpService.post<LoginResponseDto>(
          `${this.authServiceUrl}/auth/login`,
          loginDto,
        ),
      )

      this.logger.log(`User logged in successfully: ${loginDto.email}`)
      return response.data
    } catch (error) {
      this.handleError(error, `Login failed for email: ${loginDto.email}`, true)
    }
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    this.logger.log('Proxying token refresh request')

    try {
      const response = await firstValueFrom(
        this.httpService.post<RefreshTokenResponseDto>(
          `${this.authServiceUrl}/auth/refresh`,
          refreshTokenDto,
        ),
      )

      this.logger.log('Token refreshed successfully')
      return response.data
    } catch (error) {
      this.handleError(error, 'Token refresh failed', true)
    }
  }

  async getProfile(token: string) {
    this.logger.log('Proxying get profile request')

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      )

      this.logger.log('Profile retrieved successfully')
      return response.data
    } catch (error) {
      this.handleError(error, 'Get profile failed', true)
    }
  }

  private handleError(
    error: unknown,
    message: string,
    throwUnauthorized = false,
  ): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status
      const responseMessage = error.response?.data?.message || error.message

      this.logger.error(`${message}: ${responseMessage}`)

      if (status === 401 || status === 403) {
        if (throwUnauthorized) {
          throw new UnauthorizedException(responseMessage)
        }
        throw new BadRequestException(responseMessage)
      }

      if (status === 400) {
        throw new BadRequestException(responseMessage)
      }

      throw new InternalServerErrorException(responseMessage)
    }

    if (error instanceof Error) {
      this.logger.error(`${message}: ${error.message}`)
      throw new InternalServerErrorException(error.message)
    }

    this.logger.error(`${message}: Unknown error`)
    throw new InternalServerErrorException('An unexpected error occurred')
  }
}
