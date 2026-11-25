import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth.store'

/**
 * Ruta de invitado: si el usuario ya está autenticado, redirige al inicio ("/").
 */
export function GuestRoute() {
  const status = useAuthStore((s) => s.status)

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
