import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { AuthResponseDto } from './dto/auth-response.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { RefreshResponseDto } from './dto/refresh-response.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly authServiceUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://auth-service:3002'
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

      this.logger.log(`Registration successful for email: ${registerDto.email}`)
      return response.data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(
        `Registration failed for email: ${registerDto.email} - ${errorMessage}`,
      )
      throw error
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

      this.logger.log(`Login successful for email: ${loginDto.email}`)
      return response.data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(
        `Login failed for email: ${loginDto.email} - ${errorMessage}`,
      )
      throw error
    }
  }

  async refresh(refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    this.logger.log('Proxying token refresh request')

    try {
      const response = await firstValueFrom(
        this.httpService.post<RefreshResponseDto>(
          `${this.authServiceUrl}/auth/refresh`,
          refreshDto,
        ),
      )

      this.logger.log('Token refresh successful')
      return response.data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Token refresh failed - ${errorMessage}`)
      throw error
    }
  }
}
