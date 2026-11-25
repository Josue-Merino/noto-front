import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../schemas/auth.schemas'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'

export function useLoginForm() {
  const [serverError, setServerError] = useState(null)
  const [canResendEmail, setCanResendEmail] = useState(null)
  const [resendStatus, setResendStatus] = useState(null)
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null)
    setCanResendEmail(null)
    setResendStatus(null)

    try {
      const response = await authService.login(data)
      setSession(response)
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(err.message || 'Ocurrió un error al iniciar sesión.')

      // Asignar errores de validación de campos del backend
      if (err.details && Array.isArray(err.details)) {
        err.details.forEach((d) => {
          if (d.field) {
            setError(d.field, { message: d.message })
          }
        })
      }

      // Si el correo no está verificado, ofrecer reenvío
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setCanResendEmail(data.email)
      }
    }
  })

  const handleResendVerification = async () => {
    if (!canResendEmail) return
    try {
      await authService.resendVerification({ email: canResendEmail })
      setResendStatus('Se ha enviado un nuevo enlace de activación a tu correo.')
    } catch {
      setResendStatus('No se pudo reenviar en este momento. Intenta más tarde.')
    }
  }

  return {
    register,
    handleSubmit: onSubmit,
    errors,
    isSubmitting,
    serverError,
    canResendEmail,
    resendStatus,
    handleResendVerification,
  }
}
