import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { ErrorHandlerService } from './error-handler.service'

@Injectable()
export abstract class HttpProxyService implements OnModuleInit {
  protected abstract readonly logger: Logger
  protected abstract readonly serviceUrl: string
  protected abstract readonly serviceName: string

  constructor(
    protected readonly httpService: HttpService,
    protected readonly errorHandler: ErrorHandlerService,
  ) {}

  onModuleInit() {
    this.logger.log(`${this.serviceName} URL configured: ${this.serviceUrl}`)
  }

  protected async get<T>(
    path: string,
    userId?: string,
    token?: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const headers = this.buildHeaders(userId, token)
      const response = await firstValueFrom(
        this.httpService.get<T>(`${this.serviceUrl}${path}`, {
          headers,
          params,
        }),
      )
      return response.data
    } catch (error) {
      this.errorHandler.handleError(error, `GET ${path} failed`, !!token)
    }
  }

  protected async post<T>(
    path: string,
    data: unknown,
    userId?: string,
    token?: string,
  ): Promise<T> {
    try {
      const headers = this.buildHeaders(userId, token)
      const response = await firstValueFrom(
        this.httpService.post<T>(`${this.serviceUrl}${path}`, data, {
          headers,
        }),
      )
      return response.data
    } catch (error) {
      this.errorHandler.handleError(error, `POST ${path} failed`, !!token)
    }
  }

  protected async put<T>(
    path: string,
    data: unknown,
    userId?: string,
    token?: string,
  ): Promise<T> {
    try {
      const headers = this.buildHeaders(userId, token)
      const response = await firstValueFrom(
        this.httpService.put<T>(`${this.serviceUrl}${path}`, data, {
          headers,
        }),
      )
      return response.data
    } catch (error) {
      this.errorHandler.handleError(error, `PUT ${path} failed`, !!token)
    }
  }

  protected async delete<T>(
    path: string,
    userId?: string,
    token?: string,
  ): Promise<T> {
    try {
      const headers = this.buildHeaders(userId, token)
      const response = await firstValueFrom(
        this.httpService.delete<T>(`${this.serviceUrl}${path}`, {
          headers,
        }),
      )
      return response.data
    } catch (error) {
      this.errorHandler.handleError(error, `DELETE ${path} failed`, !!token)
    }
  }

  private buildHeaders(
    userId?: string,
    token?: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {}

    if (userId) {
      headers['x-user-id'] = userId
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }
}
