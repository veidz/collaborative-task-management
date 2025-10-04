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
    let url = this.configService.get<string>('AUTH_SERVICE_URL')

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
}
