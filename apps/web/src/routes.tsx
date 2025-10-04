import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router'

const rootRoute = createRootRoute({
  component: () => (
    <div>
      <Outlet />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold'>Task Management</h1>
        <p className='mt-4 text-muted-foreground'>Welcome to the app</p>
      </div>
    </div>
  ),
})

export const routeTree = rootRoute.addChildren([indexRoute])
