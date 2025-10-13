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

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    // Use Cases
    ValidateUsersUseCase,
    FindAllUsersUseCase,
    FindUserByIdUseCase,
  ],
  exports: [UsersService, UsersRepository, TypeOrmModule],
})
export class UsersModule {}
