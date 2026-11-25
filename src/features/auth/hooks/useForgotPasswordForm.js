import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema } from '../schemas/auth.schemas'
import { authService } from '../services/auth.service'

export function useForgotPasswordForm() {
  const [serverError, setServerError] = useState(null)
  const [successData, setSuccessData] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null)
    try {
      await authService.forgotPassword(data)
      setSuccessData({ email: data.email })
    } catch (err) {
      setServerError(err.message || 'Ocurrió un error al enviar el correo de recuperación.')
    }
  })

  const resetForm = () => {
    setSuccessData(null)
    setServerError(null)
    reset()
  }

  return {
    register,
    handleSubmit: onSubmit,
    errors,
    isSubmitting,
    serverError,
    successData,
    resetForm,
  }
}
