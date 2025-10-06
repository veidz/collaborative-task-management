import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto'
import { NotificationResponseDto } from './dto/notification-response.dto'
import { PaginatedNotificationsResponseDto } from './dto/paginated-notifications-response.dto'
import { UnreadCountResponseDto } from './dto/unread-count-response.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserData } from '../common/decorators'

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
    @CurrentUser() user: CurrentUserData,
  ): Promise<PaginatedNotificationsResponseDto> {
    return this.notificationsService.findByUser(
      user.id,
      query.page,
      query.limit,
      query.unreadOnly,
    )
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
  async getUnreadCount(
    @CurrentUser() user: CurrentUserData,
  ): Promise<UnreadCountResponseDto> {
    const count = await this.notificationsService.countUnread(user.id)
    return { count }
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
    @CurrentUser() user: CurrentUserData,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, user.id)
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
  async markAllAsRead(
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ updated: number }> {
    return this.notificationsService.markAllAsRead(user.id)
  }
}
