import { Injectable } from '@nestjs/common'
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/requests'
import {
  AuthResponseDto,
  LoginResponseDto,
  ProfileResponseDto,
  RefreshTokenResponseDto,
} from './dto/responses'
import {
  RegisterUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  GetProfileUseCase,
} from './use-cases'

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(registerDto)
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(loginDto)
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.refreshTokenUseCase.execute(refreshTokenDto)
  }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    return this.getProfileUseCase.execute(userId)
  }
}
