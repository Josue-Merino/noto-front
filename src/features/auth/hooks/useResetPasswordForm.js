import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema } from '../schemas/auth.schemas'
import { authService } from '../services/auth.service'

export function useResetPasswordForm() {
  const [serverError, setServerError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null)
    try {
      await authService.resetPassword({ token, password: data.password })
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    } catch (err) {
      setServerError(err.message || 'Ocurrió un error al restablecer tu contraseña.')
    }
  })

  return {
    register,
    handleSubmit: onSubmit,
    errors,
    isSubmitting,
    serverError,
    isSuccess,
  }
}
