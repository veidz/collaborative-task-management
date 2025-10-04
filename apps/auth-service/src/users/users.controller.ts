import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ValidateUsersDto } from './dto/validate-users.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { UsersService } from './users.service'

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
}
