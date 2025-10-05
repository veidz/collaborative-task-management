import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'

export interface UserDto {
  id: string
  email: string
  username: string
}

@Injectable()
export class AuthServiceClient {
  private readonly logger = new Logger(AuthServiceClient.name)
  private readonly authServiceUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('AUTH_SERVICE_URL')

    if (!url) {
      throw new Error(
        'AUTH_SERVICE_URL is not defined in environment variables',
      )
    }

    this.authServiceUrl = url
  }

  async validateUsers(userIds: string[]): Promise<Map<string, UserDto>> {
    this.logger.log(`Validating ${userIds.length} user IDs`)

    try {
      const response = await firstValueFrom(
        this.httpService.post<UserDto[]>(
          `${this.authServiceUrl}/users/validate`,
          { userIds },
        ),
      )

      const userMap = new Map<string, UserDto>()
      response.data.forEach((user) => userMap.set(user.id, user))

      this.logger.log(`Validated ${userMap.size} users`)
      return userMap
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Failed to validate users: ${error.message}`)
      }
      return new Map()
    }
  }

  async getUserById(userId: string): Promise<UserDto | null> {
    this.logger.log(`Fetching user ${userId}`)

    try {
      const response = await firstValueFrom(
        this.httpService.get<UserDto>(`${this.authServiceUrl}/users/${userId}`),
      )

      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.warn(`User ${userId} not found: ${error.message}`)
      }
      return null
    }
  }

  async getUsersByIds(userIds: string[]): Promise<Map<string, UserDto>> {
    if (userIds.length === 0) return new Map()

    this.logger.log(`Fetching ${userIds.length} users`)

    const uniqueIds = [...new Set(userIds)]
    const userMap = new Map<string, UserDto>()

    await Promise.all(
      uniqueIds.map(async (id) => {
        const user = await this.getUserById(id)
        if (user) {
          userMap.set(user.id, user)
        }
      }),
    )

    this.logger.log(`Fetched ${userMap.size} users`)
    return userMap
  }
}
