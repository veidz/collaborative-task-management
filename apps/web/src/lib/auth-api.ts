import { apiClient } from './api-client'
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/api'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials,
    )
    return data
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/register',
      userData,
    )
    return data
  },

  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/profile')
    return data
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })
    return data
  },
}
