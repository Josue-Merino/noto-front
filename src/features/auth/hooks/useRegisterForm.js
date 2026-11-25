import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '../schemas/auth.schemas'
import { authService } from '../services/auth.service'

export function useRegisterForm() {
  const [serverError, setServerError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      middleName: '',
      firstLastName: '',
      secondLastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null)
    setSuccessMessage(null)

    try {
      const response = await authService.register(data)
      setSuccessMessage(
        response.message ||
          'Cuenta creada con éxito. Hemos enviado un correo de verificación a tu dirección.'
      )
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    } catch (err) {
      setServerError(err.message || 'Ocurrió un error al crear la cuenta.')

      // Mapeo de errores de campos del backend al formulario
      if (err.details && Array.isArray(err.details)) {
        err.details.forEach((d) => {
          let fieldName = d.field
          if (fieldName === 'lastName') fieldName = 'firstLastName'
          if (fieldName) {
            setError(fieldName, { message: d.message })
          }
        })
      }
    }
  })

  return {
    register,
    handleSubmit: onSubmit,
    errors,
    isSubmitting,
    serverError,
    successMessage,
  }
}
