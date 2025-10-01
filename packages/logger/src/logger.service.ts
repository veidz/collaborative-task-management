import { Injectable, Scope } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends PinoLogger {
  log(message: string, context?: string) {
    this.info({ context }, message)
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message)
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context }, message)
  }

  debug(message: string, context?: string) {
    this.logger.debug({ context }, message)
  }

  verbose(message: string, context?: string) {
    this.logger.trace({ context }, message)
  }
}
