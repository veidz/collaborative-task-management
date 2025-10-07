import { Module } from '@nestjs/common'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import { createLoggerConfig } from '@packages/utils'

@Module({
  imports: [PinoLoggerModule.forRoot(createLoggerConfig('tasks-service'))],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
