import { Module } from '@nestjs/common'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'

const CORRELATION_ID_HEADER = 'x-correlation-id'

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  singleLine: true,
                },
              }
            : undefined,
        customProps: (req: {
          headers: Record<string, string | string[] | undefined>
        }) => {
          return {
            correlationId: req.headers[CORRELATION_ID_HEADER],
          }
        },
        serializers: {
          req: (req: {
            id: string
            method: string
            url: string
            headers?: Record<string, string | string[] | undefined>
          }) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            correlationId: req.headers?.[CORRELATION_ID_HEADER],
          }),
          res: (res: { statusCode: number }) => ({
            statusCode: res.statusCode,
          }),
        },
        level: process.env.LOG_LEVEL || 'info',
        formatters: {
          level: (label: string) => {
            return { level: label }
          },
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
