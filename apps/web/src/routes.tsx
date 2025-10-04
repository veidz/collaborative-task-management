import {
  createRootRoute,
  createRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw redirect({ to: '/login' })
    }
    throw redirect({ to: '/tasks' })
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Login Page</h1>
        <p className='mt-2 text-muted-foreground'>Coming soon...</p>
      </div>
    </div>
  ),
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Register Page</h1>
        <p className='mt-2 text-muted-foreground'>Coming soon...</p>
      </div>
    </div>
  ),
})

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  beforeLoad: () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Tasks Page</h1>
        <p className='mt-2 text-muted-foreground'>Protected route</p>
      </div>
    </div>
  ),
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  tasksRoute,
])
