import { Link, useNavigate } from '@tanstack/react-router'
import { CheckSquare, LogOut, User } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useAuthStore } from '@/stores/auth-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  console.log('Header - user:', user)

  const handleLogout = () => {
    console.log('Logout clicked')
    clearAuth()
    navigate({ to: '/login' })
  }

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        <Link to='/tasks' className='flex items-center gap-2 font-semibold'>
          <CheckSquare className='h-6 w-6' />
          <span>Collaborative Task Management</span>
        </Link>

        <div className='flex items-center gap-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md cursor-pointer'>
                <User className='h-4 w-4' />
                <span>{user?.username}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {user?.username}
                  </p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className='cursor-pointer'
              >
                <LogOut className='mr-2 h-4 w-4' />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
