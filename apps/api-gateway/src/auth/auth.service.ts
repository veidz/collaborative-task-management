import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/requests'
import {
  AuthResponseDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
} from './dto/responses'
import { HttpProxyService } from '../common/services/http-proxy.service'
import { ErrorHandlerService } from '../common/services/error-handler.service'

@Injectable()
export class AuthService extends HttpProxyService {
  protected readonly logger = new Logger(AuthService.name)
  protected readonly serviceUrl: string
  protected readonly serviceName = 'Auth Service'

  constructor(
    httpService: HttpService,
    errorHandler: ErrorHandlerService,
    configService: ConfigService,
  ) {
    super(httpService, errorHandler)

    const url = configService.get<string>('services.auth.url')

    if (!url) {
      throw new Error(
        'AUTH_SERVICE_URL is not defined in environment variables',
      )
    }

    this.serviceUrl = url
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(
      `Proxying registration request for email: ${registerDto.email}`,
    )
    const result = await this.post<AuthResponseDto>(
      '/auth/register',
      registerDto,
    )
    this.logger.log(`User registered successfully: ${registerDto.email}`)
    return result
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Proxying login request for email: ${loginDto.email}`)
    const result = await this.post<LoginResponseDto>('/auth/login', loginDto)
    this.logger.log(`User logged in successfully: ${loginDto.email}`)
    return result
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    this.logger.log('Proxying token refresh request')
    const result = await this.post<RefreshTokenResponseDto>(
      '/auth/refresh',
      refreshTokenDto,
    )
    this.logger.log('Token refreshed successfully')
    return result
  }

  async getProfile(userId: string) {
    this.logger.log(`Proxying profile request for user: ${userId}`)
    const result = await this.get('/auth/profile', userId)
    this.logger.log(`Profile retrieved successfully for user: ${userId}`)
    return result
  }

  async getUsers(userId: string) {
    this.logger.log(`Proxying users request for user: ${userId}`)
    const result = await this.get('/users', userId)
    this.logger.log(`Users retrieved successfully for user: ${userId}`)
    return result
  }
}
