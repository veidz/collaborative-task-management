import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { Request } from 'express'
import { NotificationsService } from './notifications.service'
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto'
import { NotificationResponseDto } from './dto/notification-response.dto'
import { PaginatedNotificationsResponseDto } from './dto/paginated-notifications-response.dto'
import { UnreadCountResponseDto } from './dto/unread-count-response.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: PaginatedNotificationsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async findAll(
    @Query() query: GetNotificationsQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedNotificationsResponseDto> {
    const token = this.extractToken(req)
    return this.notificationsService.findAll(query, token)
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    type: UnreadCountResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getUnreadCount(@Req() req: Request): Promise<UnreadCountResponseDto> {
    const token = this.extractToken(req)
    return this.notificationsService.getUnreadCount(token)
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({
    name: 'id',
    description: 'Notification UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found or not owned by user',
  })
  async markAsRead(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<NotificationResponseDto> {
    const token = this.extractToken(req)
    return this.notificationsService.markAsRead(id, token)
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async markAllAsRead(@Req() req: Request): Promise<{ updated: number }> {
    const token = this.extractToken(req)
    return this.notificationsService.markAllAsRead(token)
  }

  private extractToken(req: Request): string {
    const authHeader = req.headers.authorization
    return authHeader?.replace('Bearer ', '') || ''
  }
}
