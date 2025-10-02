import { Injectable, ConflictException, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UsersRepository } from '../users/users.repository'
import { RegisterDto } from './dto/register.dto'
import { AuthResponseDto } from './dto/auth-response.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(private readonly usersRepository: UsersRepository) {}

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
}
