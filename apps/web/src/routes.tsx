import {
  createRootRoute,
  createRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { TasksListPage } from '@/pages/tasks-list'

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
  beforeLoad: () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      throw redirect({ to: '/tasks' })
    }
  },
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      throw redirect({ to: '/tasks' })
    }
  },
  component: RegisterPage,
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
  component: TasksListPage,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  tasksRoute,
])
