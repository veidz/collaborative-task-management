import { Outlet } from '@tanstack/react-router'
import { Header } from './header'

export function AuthenticatedLayout() {
  return (
    <div className='min-h-screen'>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
