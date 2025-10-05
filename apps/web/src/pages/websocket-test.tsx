import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import { NotificationPayload } from '@/lib/websocket'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wifi, WifiOff, Bell, Trash2, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function WebSocketTestPage() {
  const { isConnected, onNotification } = useWebSocket()
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onNotification((notification) => {
      console.log('Notification received:', notification)
      setNotifications((prev) => [notification, ...prev])
    })

    return unsubscribe
  }, [onNotification])

  const triggerTestNotification = async () => {
    try {
      setError(null)
      setIsCreatingTask(true)

      const response = await apiClient.post('/tasks', {
        title: `Test Notification ${new Date().toLocaleTimeString()}`,
        description: 'This task was created to test WebSocket notifications',
        status: 'TODO',
        priority: 'MEDIUM',
      })

      console.log('Test task created:', response.data)
    } catch (error) {
      console.error('Failed to create test task:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to create test task',
      )
    } finally {
      setIsCreatingTask(false)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'TASK_CREATED':
        return 'bg-green-500'
      case 'TASK_UPDATED':
        return 'bg-blue-500'
      case 'TASK_DELETED':
        return 'bg-red-500'
      case 'COMMENT_CREATED':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className='container mx-auto max-w-4xl p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>WebSocket Test</h1>
        <p className='text-muted-foreground'>
          Test real-time notifications via API Gateway
        </p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Connection Status</span>
              <Badge
                variant={isConnected ? 'default' : 'destructive'}
                className='gap-1.5'
              >
                {isConnected ? (
                  <>
                    <Wifi className='h-3 w-3' />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className='h-3 w-3' />
                    Disconnected
                  </>
                )}
              </Badge>
            </CardTitle>
            <CardDescription>
              WebSocket connection to API Gateway
              (ws://localhost:3001/notifications)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Endpoint:</span>
                <code className='rounded bg-muted px-2 py-1'>
                  ws://localhost:3001/notifications
                </code>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Status:</span>
                <span
                  className={isConnected ? 'text-green-600' : 'text-red-600'}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Notifications</CardTitle>
            <CardDescription>
              Create a test task to trigger a notification
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant='destructive' className='mb-4'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={triggerTestNotification}
              disabled={!isConnected || isCreatingTask}
              className='w-full'
            >
              <Bell className='mr-2 h-4 w-4' />
              {isCreatingTask
                ? 'Creating Task...'
                : 'Trigger Test Notification'}
            </Button>

            <p className='mt-4 text-xs text-muted-foreground'>
              This will create a test task which triggers a TASK_CREATED
              notification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Received Notifications ({notifications.length})</span>
              {notifications.length > 0 && (
                <Button variant='ghost' size='sm' onClick={clearNotifications}>
                  <Trash2 className='mr-2 h-3 w-3' />
                  Clear
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Real-time notifications received via WebSocket
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <Bell className='mb-2 h-8 w-8 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>
                  No notifications received yet
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Click the button above to trigger a test notification
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className='flex gap-3 rounded-lg border p-4'
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${getNotificationTypeColor(notification.type)} mt-2`}
                    />
                    <div className='flex-1 space-y-1'>
                      <div className='flex items-center justify-between'>
                        <Badge variant='secondary'>{notification.type}</Badge>
                        <span className='text-xs text-muted-foreground'>
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                      </div>
                      <p className='text-sm'>{notification.message}</p>
                      <code className='block text-xs text-muted-foreground'>
                        ID: {notification.id}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
