import { Injectable } from '@nestjs/common'
import { UserResponseDto } from './dto/responses'
import {
  ValidateUsersUseCase,
  FindAllUsersUseCase,
  FindUserByIdUseCase,
} from './use-cases'

@Injectable()
export class UsersService {
  constructor(
    private readonly validateUsersUseCase: ValidateUsersUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async validateUsers(userIds: string[]): Promise<UserResponseDto[]> {
    return this.validateUsersUseCase.execute(userIds)
  }

  async findAll(): Promise<UserResponseDto[]> {
    return this.findAllUsersUseCase.execute()
  }

  async findById(id: string): Promise<UserResponseDto> {
    return this.findUserByIdUseCase.execute(id)
  }
}
