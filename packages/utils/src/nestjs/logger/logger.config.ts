import { Params } from 'nestjs-pino'

export function createLoggerConfig(serviceName?: string): Params {
  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                levelFirst: true,
                translateTime: 'UTC:yyyy-mm-dd HH:MM:ss',
                ignore: 'pid,hostname',
                singleLine: false,
                messageFormat: serviceName
                  ? `[${serviceName}] [{context}] {msg}`
                  : '[{context}] {msg}',
              },
            }
          : undefined,
      serializers: {
        req: (req) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
        }),
      },
      customProps: () => ({
        context: 'HTTP',
        ...(serviceName && { service: serviceName }),
      }),
      autoLogging: true,
      customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} ${res.statusCode}`
      },
      customErrorMessage: (req, res) => {
        return `${req.method} ${req.url} ${res.statusCode}`
      },
    },
  }
}

export const defaultLoggerConfig = createLoggerConfig()
