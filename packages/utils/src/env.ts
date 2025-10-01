export function getEnvOrThrow(key: string): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`)
  }

  return value
}

export function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

export function getEnvAsNumber(key: string, defaultValue: number): number {
  const value = process.env[key]

  if (!value) {
    return defaultValue
  }

  const parsed = parseInt(value, 10)

  if (isNaN(parsed)) {
    return defaultValue
  }

  return parsed
}
