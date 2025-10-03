import { Module } from '@nestjs/common'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import { loggerConfig } from './logger.config'

@Module({
  imports: [PinoLoggerModule.forRoot(loggerConfig)],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
