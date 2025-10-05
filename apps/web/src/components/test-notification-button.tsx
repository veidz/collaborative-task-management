import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export function TestNotificationButton() {
  const [loading, setLoading] = useState(false)

  const triggerTestNotification = async () => {
    try {
      setLoading(true)
      // Create a test task which will trigger a notification
      await apiClient.post('/tasks', {
        title: `Test notification ${new Date().toISOString()}`,
        description: 'This is a test to trigger a notification',
        status: 'TODO',
        priority: 'MEDIUM',
      })
      console.log('✅ Test task created - notification should arrive')
    } catch (error) {
      console.error('❌ Failed to create test task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={triggerTestNotification}
      disabled={loading}
    >
      <Bell className='mr-2 h-4 w-4' />
      Test Notification
    </Button>
  )
}
