import { createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import { App } from '@/App'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { TasksListPage } from '@/pages/tasks-list'
import { TaskDetailPage } from '@/pages/task-detail'
import { WebSocketTestPage } from '@/pages/websocket-test'

const rootRoute = createRootRoute({
  component: App,
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

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
})

const tasksRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'tasks',
  component: TasksListPage,
})

const taskDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'tasks/$id',
  component: TaskDetailPage,
})

const websocketTestRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: 'websocket-test',
  component: WebSocketTestPage,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  authenticatedRoute.addChildren([
    tasksRoute,
    taskDetailRoute,
    websocketTestRoute,
  ]),
])
