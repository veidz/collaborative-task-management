import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common'
import { AxiosError } from 'axios'

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name)

  handleError(
    error: unknown,
    message: string,
    throwUnauthorized = false,
  ): never {
    if (error instanceof AxiosError) {
      return this.handleAxiosError(error, message, throwUnauthorized)
    }

    if (error instanceof Error) {
      this.logger.error(`${message}: ${error.message}`)
      throw new InternalServerErrorException(error.message)
    }

    this.logger.error(`${message}: Unknown error`)
    throw new InternalServerErrorException('An unexpected error occurred')
  }

  private handleAxiosError(
    error: AxiosError,
    message: string,
    throwUnauthorized: boolean,
  ): never {
    const status = error.response?.status
    const responseData = error.response?.data as
      | { message?: string }
      | undefined
    const responseMessage = responseData?.message || error.message

    this.logger.error(`${message}: ${responseMessage}`)

    switch (status) {
      case 401:
      case 403:
        if (throwUnauthorized) {
          throw new UnauthorizedException(responseMessage)
        }
        throw new ForbiddenException(responseMessage)

      case 404:
        throw new NotFoundException(responseMessage)

      case 400:
        throw new BadRequestException(responseMessage)

      default:
        throw new InternalServerErrorException(responseMessage)
    }
  }
}
