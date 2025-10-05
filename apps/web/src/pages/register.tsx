import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { registerSchema, RegisterFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function RegisterPage() {
  const { register: registerUser, isRegistering, registerError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data)
  }

  const getErrorMessage = () => {
    if (!registerError) return null
    const message = registerError.response?.data?.message
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    return message || 'Something went wrong. Please try again.'
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-3xl font-bold'>Create account</CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {registerError && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Registration failed</AlertTitle>
                <AlertDescription>{getErrorMessage()}</AlertDescription>
              </Alert>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='john@example.com'
                {...register('email')}
                disabled={isRegistering}
              />
              {errors.email && (
                <p className='text-sm text-destructive'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                type='text'
                placeholder='johndoe'
                {...register('username')}
                disabled={isRegistering}
              />
              {errors.username && (
                <p className='text-sm text-destructive'>
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                {...register('password')}
                disabled={isRegistering}
              />
              {errors.password && (
                <p className='text-sm text-destructive'>
                  {errors.password.message}
                </p>
              )}
              <p className='text-xs text-muted-foreground'>
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <Button type='submit' className='w-full' disabled={isRegistering}>
              {isRegistering && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='font-medium text-primary hover:underline'
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
