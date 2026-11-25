import { AuthCard } from '../components/AuthCard'
import { RegisterForm } from '../components/RegisterForm'
import { AuthFooterLink } from '../components/AuthFooterLink'

export function RegisterPage() {
  return (
    <AuthCard
      badgeText="Espacio de reflexión y notas"
      title="Crear cuenta"
      subtitle="Empieza a capturar tus ideas y notas con enfoque."
      maxWidth="lg"
      footer={
        <AuthFooterLink
          prompt="¿Ya tienes cuenta?"
          linkText="Inicia sesión"
          to="/login"
        />
      }
    >
      <RegisterForm />
    </AuthCard>
  )
}
