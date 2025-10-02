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
import { AuthResponseDto } from './dto/auth-response.dto'
import { LoginResponseDto } from './dto/login-response.dto'

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

    const payload = { sub: user.id, email: user.email, username: user.username }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    })

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    })

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
}
