import { useState } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationType } from '@/types/notification'
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
} from '@/hooks/use-notification'

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.TASK_CREATED:
      return '📝'
    case NotificationType.TASK_UPDATED:
      return '✏️'
    case NotificationType.TASK_DELETED:
      return '🗑️'
    case NotificationType.COMMENT_CREATED:
      return '💬'
    default:
      return '🔔'
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: unreadData } = useUnreadCount()
  const { data: notificationsData, refetch } = useNotifications(1, 10, false)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const unreadCount = unreadData?.count ?? 0
  const notifications = notificationsData?.data ?? []

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      refetch()
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel className='flex items-center justify-between'>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-auto p-1 text-xs'
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className='mr-1 h-3 w-3' />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Bell className='mb-2 h-8 w-8 text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>No notifications</p>
          </div>
        ) : (
          <ScrollArea className='h-[400px]'>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className='flex items-start gap-2 p-3 cursor-pointer'
                onClick={() => {
                  if (!notification.read) {
                    handleMarkAsRead(notification.id)
                  }
                }}
              >
                <span className='text-xl'>
                  {getNotificationIcon(notification.type as NotificationType)}
                </span>
                <div className='flex-1 space-y-1'>
                  <p
                    className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}
                  >
                    {notification.message}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsRead(notification.id)
                    }}
                  >
                    <Check className='h-4 w-4' />
                  </Button>
                )}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
