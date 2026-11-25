import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useReviewsStore } from '../store/reviews.store'
import { generationService, isMockMode } from '../services/generation.service'
import { isActiveStatus, reviewPath } from '@/features/reviews/mappers/review.mapper'
import { useToastStore } from '@/store/toast.store'
import { useAuthStore } from '@/features/auth/store/auth.store'

/** Cada cuánto se consulta el estado de los trabajos en curso. */
export const POLL_INTERVAL_MS = 4000

/**
 * Sincroniza los trabajos de generación con el backend mientras la sesión está abierta:
 * carga la lista al entrar y consulta cada pocos segundos los que siguen en curso.
 * Cuando uno termina, avisa con un toast (salvo que el usuario ya esté mirando ese material).
 * Se monta una sola vez, en el layout autenticado.
 */
export function useJobPolling() {
  const userId = useAuthStore((s) => s.user?.id)
  const setJobs = useReviewsStore((s) => s.setJobs)
  const resetReviews = useReviewsStore((s) => s.reset)
  const upsertJob = useReviewsStore((s) => s.upsertJob)
  const pushToast = useToastStore((s) => s.push)
  const location = useLocation()
  const pathnameRef = useRef(location.pathname)

  useEffect(() => {
    pathnameRef.current = location.pathname
  }, [location.pathname])

  // 1. Carga inicial (y de nuevo si cambia el usuario: no se mezclan repasos entre cuentas)
  useEffect(() => {
    if (isMockMode()) return
    resetReviews()
    generationService
      .listJobs()
      .then(setJobs)
      .catch(() => {
        // Sin lista no se rompe la app: el historial queda vacío y se reintenta al recargar
      })
  }, [userId, setJobs, resetReviews])

  // 2. Consulta periódica de los trabajos en curso
  useEffect(() => {
    if (isMockMode()) return undefined

    let stopped = false
    const tick = async () => {
      const active = useReviewsStore.getState().reviews.filter((r) => isActiveStatus(r.status))
      for (const review of active) {
        try {
          const job = await generationService.getJob(review.id)
          if (stopped) return
          upsertJob(job)

          if (!isActiveStatus(job.status)) {
            const path = reviewPath({ ...job })
            const isWatching = pathnameRef.current === `/generation/${job.id}` || pathnameRef.current === `/reviews/${job.id}`
            const isHome = pathnameRef.current === '/' && useReviewsStore.getState().activeJobId === job.id
            if (!isWatching && !isHome) notify(job, path)
          }
        } catch {
          // Error de red pasajero: se reintenta en el próximo ciclo
        }
      }
    }

    const notify = (job, path) => {
      if (job.status === 'completed') {
        pushToast({ variant: 'success', title: 'Tu material está listo', description: job.title, action: { label: 'Ver material', to: `/generation/${job.id}` } })
      } else if (job.status === 'failed') {
        pushToast({ variant: 'error', title: 'No pudimos procesar tu audio', description: job.error?.message, action: { label: 'Ver detalles', to: path } })
      }
    }

    const timer = setInterval(tick, POLL_INTERVAL_MS)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [upsertJob, pushToast])
}
