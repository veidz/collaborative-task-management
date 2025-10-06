import { Link } from '@tanstack/react-router'
import { CheckSquare } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useAuthStore } from '@/stores/auth-store'

export function Header() {
  const { user } = useAuthStore()

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        <Link to='/tasks' className='flex items-center gap-2 font-semibold'>
          <CheckSquare className='h-6 w-6' />
          <span>Collaborative Task Management</span>
        </Link>

        <div className='flex items-center gap-4'>
          <span className='text-sm text-muted-foreground'>
            {user?.username}
          </span>
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
