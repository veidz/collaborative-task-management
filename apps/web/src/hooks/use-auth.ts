import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '@/lib/auth-api'
import { useAuthStore } from '@/stores/auth-store'
import { LoginRequest, RegisterRequest } from '@/types/api'
import { AxiosError } from 'axios'

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      navigate({ to: '/tasks' })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => authApi.register(userData),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      navigate({ to: '/tasks' })
    },
  })

  const logout = () => {
    clearAuth()
    queryClient.clear()
    navigate({ to: '/login' })
  }

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  return {
    user,
    profile,
    isAuthenticated,
    isLoadingProfile,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginError: loginMutation.error as AxiosError,
    registerError: registerMutation.error as AxiosError,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  }
}
