import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { UserResponseDto } from './dto/responses'
import { ValidateUsersDto } from './dto/requests'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate user IDs and return user details' })
  @ApiResponse({
    status: 200,
    description: 'Users validated successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user IDs',
  })
  async validateUsers(
    @Body() validateUsersDto: ValidateUsersDto,
  ): Promise<UserResponseDto[]> {
    return this.usersService.validateUsers(validateUsersDto.userIds)
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id)
  }
}
