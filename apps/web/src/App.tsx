import { Outlet } from '@tanstack/react-router'
import { NotificationProvider } from '@/components/providers/notification-provider'

export function App() {
  return (
    <NotificationProvider>
      <Outlet />
    </NotificationProvider>
  )
}
