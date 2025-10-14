import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UsersRepository } from './users.repository'
import { User } from './entities/user.entity'
import {
  ValidateUsersUseCase,
  FindAllUsersUseCase,
  FindUserByIdUseCase,
} from './use-cases'
import { UserMapper } from '../auth/mappers/user.mapper'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    ValidateUsersUseCase,
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    UserMapper,
  ],
  exports: [UsersService, UsersRepository, TypeOrmModule, UserMapper],
})
export class UsersModule {}
