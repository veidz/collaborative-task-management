import { registerAs } from '@nestjs/config'

export default registerAs('services', () => ({
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  },
  tasks: {
    url: process.env.TASKS_SERVICE_URL || 'http://localhost:3003',
  },
  notifications: {
    url: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004',
  },
}))
