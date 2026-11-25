import { User, Mail } from 'lucide-react'
import { TextField } from '@/components/ui/TextField'
import { PasswordField } from '@/components/ui/PasswordField'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { useRegisterForm } from '../hooks/useRegisterForm'

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    serverError,
    successMessage,
  } = useRegisterForm()

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && <FormAlert message={serverError} variant="error" />}
      {successMessage && <FormAlert message={successMessage} variant="success" />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Nombre(s)"
          required
          placeholder="Ej. Alejandro"
          autoComplete="given-name"
          leftIcon={User}
          error={errors.firstName?.message}
          disabled={isSubmitting}
          {...register('firstName')}
        />

        <TextField
          label="Segundo nombre"
          optional
          placeholder="Ej. Mateo"
          autoComplete="additional-name"
          error={errors.middleName?.message}
          disabled={isSubmitting}
          {...register('middleName')}
        />

        <TextField
          label="Primer apellido"
          required
          placeholder="Pérez"
          autoComplete="family-name"
          error={errors.firstLastName?.message}
          disabled={isSubmitting}
          {...register('firstLastName')}
        />

        <TextField
          label="Segundo apellido"
          optional
          placeholder="Gómez"
          autoComplete="family-name"
          error={errors.secondLastName?.message}
          disabled={isSubmitting}
          {...register('secondLastName')}
        />

        <div className="sm:col-span-2">
          <TextField
            label="Correo electrónico"
            required
            type="email"
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            leftIcon={Mail}
            error={errors.email?.message}
            disabled={isSubmitting}
            {...register('email')}
          />
        </div>

        <PasswordField
          label="Contraseña"
          required
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          disabled={isSubmitting}
          {...register('password')}
        />

        <PasswordField
          label="Repetir contraseña"
          required
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          {...register('confirmPassword')}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        className="mt-2"
      >
        Crear cuenta
      </Button>
    </form>
  )
}
