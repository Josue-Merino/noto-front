import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { generatorSchema } from '../schemas/generator.schemas'
import { generationService } from '../services/generation.service'
import { useReviewsStore } from '../store/reviews.store'
import { isActiveStatus } from '@/features/reviews/mappers/review.mapper'

/**
 * Estado del panel del Home:
 * - `idle`: formulario para elegir archivo/grabación y tipo de salida.
 * - `uploading`: subiendo el audio (con %).
 * - `processing`: el backend está preparando el audio o generando con la IA.
 * - `failed`: la generación falló (con reintento).
 * @typedef {'idle' | 'uploading' | 'processing' | 'failed'} GeneratorView
 */

/**
 * Orquesta el formulario de generación y el seguimiento del trabajo en el backend.
 * El trabajo seguido vive en el store (`activeJobId`), así su progreso sigue visible si el usuario
 * sale del Home y vuelve; la consulta periódica la hace `useJobPolling` en el layout.
 */
export function useGenerateMaterial() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [serverError, setServerError] = useState(null)
  const [actionError, setActionError] = useState(null)
  /** Acción sobre el trabajo en curso ('cancel' | 'retry'), para deshabilitar botones. */
  const [pendingAction, setPendingAction] = useState(null)
  const [fileMetadata, setFileMetadata] = useState(null)
  const uploadAbortRef = useRef(null)
  const navigate = useNavigate()

  const activeJobId = useReviewsStore((s) => s.activeJobId)
  const activeJob = useReviewsStore((s) => s.reviews.find((r) => r.id === s.activeJobId) ?? null)
  const setActiveJobId = useReviewsStore((s) => s.setActiveJobId)
  const upsertJob = useReviewsStore((s) => s.upsertJob)

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      outputType: 'full',
      file: null,
    },
  })

  const currentOutputType = useWatch({ control, name: 'outputType' })
  const currentFile = useWatch({ control, name: 'file' })

  // Cuando el trabajo seguido termina bien, se abre la página de resultado
  useEffect(() => {
    if (activeJob?.status === 'completed') {
      setActiveJobId(null)
      navigate(`/generation/${activeJob.id}`)
    }
  }, [activeJob?.status, activeJob?.id, navigate, setActiveJobId])

  /** Sube el audio y empieza a seguir el trabajo creado. */
  const submitJob = async (data) => {
    const controller = new AbortController()
    uploadAbortRef.current = controller
    setIsUploading(true)
    setUploadProgress(0)
    setServerError(null)
    setActionError(null)

    try {
      const job = await generationService.createJob({
        ...data,
        metadata: fileMetadata,
        onUploadProgress: setUploadProgress,
        signal: controller.signal,
      })
      upsertJob(job)
      setActiveJobId(job.id)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setServerError(err.message || 'Ocurrió un error al subir el audio.')
      }
    } finally {
      uploadAbortRef.current = null
      setIsUploading(false)
    }
  }

  // react-hook-form valida y, si todo está bien, llama a `submitJob` (solo en el evento)
  const onSubmit = (event) => handleSubmit(submitJob)(event)

  /** Cancela la subida en curso. */
  const cancelUpload = useCallback(() => uploadAbortRef.current?.abort(), [])

  /**
   * Ejecuta una acción sobre el trabajo seguido y actualiza el store.
   * @param {'cancel' | 'retry'} name
   * @param {(id: string) => Promise<object>} request
   */
  const runJobAction = useCallback(
    async (name, request) => {
      if (!activeJobId) return null
      setActionError(null)
      setPendingAction(name)
      try {
        const job = await request(activeJobId)
        upsertJob(job)
        return job
      } catch (err) {
        setActionError(err.message || 'No se pudo completar la acción.')
        return null
      } finally {
        setPendingAction(null)
      }
    },
    [activeJobId, upsertJob]
  )

  /** Cancela la generación: vuelve al formulario con el mismo archivo elegido. */
  const cancelJob = useCallback(async () => {
    const job = await runJobAction('cancel', generationService.cancelJob)
    if (job) setActiveJobId(null)
  }, [runJobAction, setActiveJobId])

  /** Reintenta con el audio que conservó el backend. */
  const retryJob = useCallback(() => runJobAction('retry', generationService.retryJob), [runJobAction])

  /** Deja de seguir el trabajo (p. ej. para generar otro material). */
  const dismissJob = useCallback(() => {
    setActionError(null)
    setActiveJobId(null)
  }, [setActiveJobId])

  /** @type {GeneratorView} */
  let view = 'idle'
  if (isUploading) view = 'uploading'
  else if (activeJob && isActiveStatus(activeJob.status)) view = 'processing'
  else if (activeJob?.status === 'failed') view = 'failed'

  return {
    view,
    activeJob,
    uploadProgress,
    currentOutputType,
    currentFile,
    fileMetadata,
    setOutputType: (type) => setValue('outputType', type, { shouldValidate: true }),
    setFile: (file, meta = null) => {
      // Quitar el archivo no es un error: el aviso de "debes subir un archivo" aparece al enviar
      setValue('file', file, { shouldValidate: Boolean(file) })
      if (!file) clearErrors('file')
      setFileMetadata(meta)
    },
    onSubmit,
    cancelUpload,
    cancelJob,
    retryJob,
    dismissJob,
    errors,
    isProcessing: view !== 'idle',
    serverError,
    actionError,
    pendingAction,
  }
}
