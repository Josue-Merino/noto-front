import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PasswordField } from '@/components/ui/PasswordField'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { useResetPasswordForm } from '../hooks/useResetPasswordForm'

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    serverError,
    isSuccess,
  } = useResetPasswordForm()

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center py-2 animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-success-bg border border-success/30 flex items-center justify-center text-success mb-4">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>

        <h2 className="text-base font-semibold text-text-h mb-2">
          ¡Contraseña actualizada!
        </h2>

        <p className="text-xs sm:text-sm text-text mb-6 leading-relaxed">
          Tu contraseña ha sido actualizada con éxito. Serás redirigido a la pantalla de inicio de sesión en unos momentos.
        </p>

        <Link to="/login" className="w-full">
          <Button variant="primary" fullWidth>
            Ir a Iniciar sesión
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && <FormAlert message={serverError} variant="error" />}

      <PasswordField
        label="Nueva contraseña"
        required
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register('password')}
      />

      <PasswordField
        label="Confirmar nueva contraseña"
        required
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        disabled={isSubmitting}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        className="mt-2"
      >
        Actualizar contraseña
      </Button>
    </form>
  )
}
