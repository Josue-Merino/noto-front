import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { authService } from '@/features/auth/services/auth.service'

export default function App() {
  const status = useAuthStore((s) => s.status)
  const session = useAuthStore((s) => s.session)
  const clearSession = useAuthStore((s) => s.clearSession)
  const setSession = useAuthStore((s) => s.setSession)

  useEffect(() => {
    // Al iniciar la aplicación, valida la sesión activa con GET /auth/me
    if (status === 'authenticated' && session?.accessToken) {
      authService
        .me()
        .then((freshUser) => {
          if (freshUser) {
            setSession({ user: freshUser, session })
          }
        })
        .catch(() => {
          clearSession()
        })
    }
  }, [status, session, clearSession, setSession])

  return <RouterProvider router={router} />
}
