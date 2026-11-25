import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth.store'

/**
 * Ruta protegida: si no hay sesión activa, redirige a /login.
 */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
