import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
  Logger,
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger'
import { Request } from 'express'
import { AuthService } from './auth.service'
import {
  AuthResponseDto,
  LoginResponseDto,
  ProfileResponseDto,
  RefreshTokenResponseDto,
} from './dto/responses'
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/requests'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refresh(refreshTokenDto)
  }

  @Get('profile')
  @ApiOperation({
    summary:
      'Get user profile (Internal - called by Gateway with x-user-id header)',
    description:
      'This endpoint is called by the API Gateway which validates JWT and forwards user ID',
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID from validated JWT (set by Gateway)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing user ID header',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getProfile(
    @Headers('x-user-id') userId: string,
    @Req() req: Request,
  ): Promise<ProfileResponseDto> {
    this.logger.log(`All headers received: ${JSON.stringify(req.headers)}`)
    this.logger.log(`x-user-id header value: ${userId}`)

    if (!userId) {
      this.logger.warn('Profile request missing x-user-id header')
      throw new UnauthorizedException('User ID header required')
    }

    this.logger.log(`Profile request received for user: ${userId}`)
    return this.authService.getProfile(userId)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  async logout(): Promise<{ message: string }> {
    // For now, logout is handled on the client side by clearing tokens
    // In the future, we could implement token blacklisting here
    this.logger.log('Logout request received')
    return { message: 'Logged out successfully' }
  }
}
