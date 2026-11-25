import { AuthCard } from '../components/AuthCard'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'
import { AuthFooterLink } from '../components/AuthFooterLink'

export function ForgotPasswordPage() {
  return (
    <AuthCard
      badgeText="Espacio de reflexión y notas"
      title="Recuperar contraseña"
      subtitle="Ingresa el correo electrónico asociado a tu cuenta para restablecerla."
      maxWidth="md"
      footer={
        <AuthFooterLink
          prompt="¿Recordaste tu contraseña?"
          linkText="Inicia sesión"
          to="/login"
        />
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
