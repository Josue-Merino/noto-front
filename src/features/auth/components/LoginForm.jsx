import { Link } from 'react-router-dom'
import { Mail, RefreshCw } from 'lucide-react'
import { TextField } from '@/components/ui/TextField'
import { PasswordField } from '@/components/ui/PasswordField'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { useLoginForm } from '../hooks/useLoginForm'

export function LoginForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    serverError,
    canResendEmail,
    resendStatus,
    handleResendVerification,
  } = useLoginForm()

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && <FormAlert message={serverError} variant="error" />}

      {canResendEmail && (
        <div className="p-3 rounded-xl bg-accent-muted/40 border border-accent-border/40 text-xs text-text-h flex flex-col gap-2">
          <span>¿No recibiste el correo de confirmación?</span>
          <button
            type="button"
            onClick={handleResendVerification}
            className="inline-flex items-center gap-1.5 text-accent hover:underline font-medium text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border rounded"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reenviar enlace de activación</span>
          </button>
          {resendStatus && (
            <span className="text-[11px] text-text-muted mt-1">{resendStatus}</span>
          )}
        </div>
      )}

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

      <PasswordField
        label="Contraseña"
        required
        labelRight={
          <Link
            to="/forgot-password"
            className="text-accent hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border rounded transition-colors text-xs"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        }
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register('password')}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        className="mt-2"
      >
        Iniciar sesión
      </Button>
    </form>
  )
}
