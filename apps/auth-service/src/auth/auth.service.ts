import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersRepository } from '../users/users.repository'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { AuthResponseDto } from './dto/auth-response.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { RefreshResponseDto } from './dto/refresh-response.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`)

    const existingUser = await this.usersRepository.findByEmailOrUsername(
      registerDto.email,
      registerDto.username,
    )

    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        this.logger.warn(
          `Registration failed: Email already exists - ${registerDto.email}`,
        )
        throw new ConflictException('Email already exists')
      }
      if (existingUser.username === registerDto.username) {
        this.logger.warn(
          `Registration failed: Username already exists - ${registerDto.username}`,
        )
        throw new ConflictException('Username already exists')
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10)

    const user = this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      password: hashedPassword,
    })

    const savedUser = await this.usersRepository.save(user)

    this.logger.log(`User registered successfully: ${savedUser.id}`)

    return {
      id: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
      createdAt: savedUser.createdAt,
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`)

    const user = await this.usersRepository.findByEmail(loginDto.email)

    if (!user) {
      this.logger.warn(`Login failed: User not found - ${loginDto.email}`)
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    )

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password - ${loginDto.email}`)
      throw new UnauthorizedException('Invalid credentials')
    }

    const accessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.username,
    )
    const refreshToken = this.generateRefreshToken(
      user.id,
      user.email,
      user.username,
    )

    this.logger.log(`User logged in successfully: ${user.id}`)

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    }
  }

  async refresh(refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    this.logger.log('Token refresh attempt')

    try {
      const payload = this.jwtService.verify(refreshDto.refreshToken)

      if (payload.type !== 'refresh') {
        this.logger.warn('Token refresh failed: Invalid token type')
        throw new UnauthorizedException('Invalid token type')
      }

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      })

      if (!user) {
        this.logger.warn(
          `Token refresh failed: User not found - ${payload.sub}`,
        )
        throw new UnauthorizedException('Invalid token')
      }

      const accessToken = this.generateAccessToken(
        user.id,
        user.email,
        user.username,
      )
      const refreshToken = this.generateRefreshToken(
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

  private generateAccessToken(
    userId: string,
    email: string,
    username: string,
  ): string {
    const payload = {
      sub: userId,
      email,
      username,
      type: 'access',
    }

    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    })
  }

  private generateRefreshToken(
    userId: string,
    email: string,
    username: string,
  ): string {
    const payload = {
      sub: userId,
      email,
      username,
      type: 'refresh',
    }

    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    })
  }
}
