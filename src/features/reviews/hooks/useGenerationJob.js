import { useCallback, useEffect, useState } from 'react'
import { generationService } from '@/features/home/services/generation.service'
import { useReviewsStore } from '@/features/home/store/reviews.store'

/**
 * Trabajo de generación por id: lo toma del store y, si no está (recarga, enlace directo) o
 * todavía no trae su contenido, lo pide al backend. Mientras siga activo, `useJobPolling` lo
 * mantiene actualizado en el store.
 * Expone también las acciones sobre el trabajo (cancelar, reintentar, generar más material).
 *
 * @param {string} id
 */
export function useGenerationJob(id) {
  const job = useReviewsStore((s) => s.reviews.find((r) => r.id === id) ?? null)
  const upsertJob = useReviewsStore((s) => s.upsertJob)
  const [loadState, setLoadState] = useState({ id: null, status: 'idle', error: null })
  const [pendingAction, setPendingAction] = useState(null)
  const [actionError, setActionError] = useState(null)

  const needsFetch = !job || (job.status === 'completed' && !job.content)

  useEffect(() => {
    if (!needsFetch) return undefined
    let cancelled = false
    generationService
      .getJob(id)
      .then((dto) => {
        if (cancelled) return
        upsertJob(dto)
        setLoadState({ id, status: 'done', error: null })
      })
      .catch((err) => {
        if (!cancelled) setLoadState({ id, status: 'error', error: err })
      })
    return () => {
      cancelled = true
    }
  }, [id, needsFetch, upsertJob])

  const loadError = loadState.id === id ? loadState.error : null

  /**
   * @param {'cancel' | 'retry' | 'materials'} name
   * @param {() => Promise<object>} request
   */
  const run = useCallback(
    async (name, request) => {
      setActionError(null)
      setPendingAction(name)
      try {
        const dto = await request()
        upsertJob(dto)
        return dto
      } catch (err) {
        setActionError(err.message || 'No se pudo completar la acción.')
        return null
      } finally {
        setPendingAction(null)
      }
    },
    [upsertJob]
  )

  return {
    job,
    isLoading: !job && !loadError,
    notFound: !job && loadError?.status === 404,
    loadError: job ? null : loadError,
    pendingAction,
    actionError,
    clearActionError: () => setActionError(null),
    cancel: () => run('cancel', () => generationService.cancelJob(id)),
    retry: () => run('retry', () => generationService.retryJob(id)),
    addMaterials: (materials) => run('materials', () => generationService.addMaterials(id, materials)),
  }
}
