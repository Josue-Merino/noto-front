import { AuthCard } from '../components/AuthCard'
import { ResetPasswordForm } from '../components/ResetPasswordForm'
import { AuthFooterLink } from '../components/AuthFooterLink'

export function ResetPasswordPage() {
  return (
    <AuthCard
      badgeText="Espacio de reflexión y notas"
      title="Restablecer contraseña"
      subtitle="Crea una nueva contraseña segura para volver a ingresar a tu cuenta."
      maxWidth="md"
      footer={
        <AuthFooterLink
          prompt="¿No necesitas cambiarla?"
          linkText="Volver al inicio"
          to="/login"
        />
      }
    >
      <ResetPasswordForm />
    </AuthCard>
  )
}
