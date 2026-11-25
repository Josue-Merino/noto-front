import { Mail, CheckCircle2, RotateCcw } from 'lucide-react'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm'

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    serverError,
    successData,
    resetForm,
  } = useForgotPasswordForm()

  if (successData) {
    return (
      <div className="flex flex-col items-center text-center py-2 animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-accent-muted border border-accent-border flex items-center justify-center text-accent mb-4 shadow-[0_0_12px_rgb(242_184_75/0.2)]">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>

        <h2 className="text-base font-semibold text-text-h mb-2">
          Revisa tu correo electrónico
        </h2>

        <p className="text-xs sm:text-sm text-text mb-3 leading-relaxed">
          Hemos enviado un enlace de recuperación a:
        </p>

        <div className="w-full bg-bg-darker border border-border rounded-xl px-4 py-2.5 mb-4 text-xs sm:text-sm font-medium text-text-h break-all">
          {successData.email}
        </div>

        <p className="text-xs text-text-muted mb-6 leading-relaxed">
          Haz clic en el enlace del mensaje para restablecer tu contraseña. Si no lo ves en unos minutos, revisa tu carpeta de spam.
        </p>

        <Button
          variant="ghost"
          fullWidth
          onClick={resetForm}
          leftIcon={RotateCcw}
          rightIcon={null}
        >
          Probar con otro correo
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && <FormAlert message={serverError} variant="error" />}

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

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        className="mt-2"
      >
        Enviar enlace de recuperación
      </Button>
    </form>
  )
}
