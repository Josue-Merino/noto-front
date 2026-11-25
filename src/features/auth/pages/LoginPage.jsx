import { AuthCard } from '../components/AuthCard'
import { LoginForm } from '../components/LoginForm'
import { AuthFooterLink } from '../components/AuthFooterLink'

export function LoginPage() {
  return (
    <AuthCard
      badgeText="Espacio de reflexión y notas"
      title="Iniciar sesión"
      subtitle="Bienvenido de nuevo a Noto. Continúa con tus notas."
      maxWidth="md"
      footer={
        <AuthFooterLink
          prompt="¿No tienes una cuenta?"
          linkText="Regístrate gratis"
          to="/register"
        />
      }
    >
      <LoginForm />
    </AuthCard>
  )
}
