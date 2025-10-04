import { create } from 'zustand'
import { User } from '@/types/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUser = localStorage.getItem('user')
  const storedAccessToken = localStorage.getItem('accessToken')
  const storedRefreshToken = localStorage.getItem('refreshToken')

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    accessToken: storedAccessToken,
    refreshToken: storedRefreshToken,
    isAuthenticated: !!storedAccessToken && !!storedUser,

    setAuth: (user, accessToken, refreshToken) => {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      })
    },

    clearAuth: () => {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      })
    },

    updateUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user))
      set({ user })
    },
  }
})
