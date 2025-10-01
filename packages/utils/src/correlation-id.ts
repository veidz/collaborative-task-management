import { randomUUID } from 'crypto'

export const CORRELATION_ID_HEADER = 'x-correlation-id'

export function generateCorrelationId(): string {
  return randomUUID()
}

export function extractCorrelationId(
  headers: Record<string, string | string[] | undefined>,
): string {
  const correlationId = headers[CORRELATION_ID_HEADER]

  if (Array.isArray(correlationId)) {
    return correlationId[0] || generateCorrelationId()
  }

  return correlationId || generateCorrelationId()
}
