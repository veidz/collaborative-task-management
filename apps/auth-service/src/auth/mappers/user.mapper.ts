import { Injectable } from '@nestjs/common'
import { User } from '../../users/entities/user.entity'
import { AuthResponseDto, ProfileResponseDto } from '../dto/responses'
import { UserResponseDto } from '../../users/dto/responses'

@Injectable()
export class UserMapper {
  toAuthResponseDto(user: User): AuthResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    }
  }

  toProfileResponseDto(user: User): ProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    }
  }

  toUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    }
  }

  toUserResponseDtoList(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toUserResponseDto(user))
  }
}
