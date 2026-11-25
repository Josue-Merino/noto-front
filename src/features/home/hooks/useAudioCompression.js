import { AudioTooLongError } from '@/lib/audio/errors'
import { useState, useRef, useCallback, useEffect } from 'react'
import { AUDIO_CONFIG } from '@/lib/audio/audioConfig'
import { isFFmpegLoaded, terminateFFmpeg } from '@/lib/audio/ffmpegLoader'
import { compressAudio } from '@/lib/audio/compressAudio'

/**
 * Hook para gestionar el ciclo de compresión de audio con ffmpeg.wasm en React.
 * Controla estados, progreso, advertencias de memoria, cancelación y degradación elegante.
 */
export function useAudioCompression() {
  const [status, setStatus] = useState('idle') // 'idle' | 'loading-engine' | 'compressing' | 'done' | 'error' | 'cancelled'
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [warning, setWarning] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)

  const abortControllerRef = useRef(null)

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    terminateFFmpeg()
    setStatus('cancelled')
    setProgress(0)
  }, [])

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setStatus('idle')
    setProgress(0)
    setResult(null)
    setError(null)
    setWarning(null)
    setOriginalFile(null)
  }, [])

  // Cancelar al desmontar para evitar fugas de workers
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const compress = useCallback(
    async (file) => {
      if (!file) return null

      // Cancelar cualquier compresión previa en curso
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setOriginalFile(file)
      setError(null)
      setResult(null)
      setProgress(0)

      // 1. Advertencia de tamaño de memoria (>300 MB)
      if (file.size > AUDIO_CONFIG.WARN_LARGE_FILE_SIZE_BYTES) {
        setWarning(
          'El archivo supera los 300 MB. La compresión en el navegador puede tomar varios minutos y consumir memoria.'
        )
      } else {
        setWarning(null)
      }

      // 2. Verificar estado del motor
      if (!isFFmpegLoaded()) {
        setStatus('loading-engine')
      } else {
        setStatus('compressing')
      }

      try {
        const compressed = await compressAudio(file, {
          onProgress: (percent) => {
            setStatus('compressing')
            setProgress(percent)
          },
          signal: abortController.signal,
        })

        setStatus('done')
        setProgress(100)
        setResult(compressed)
        abortControllerRef.current = null
        return compressed
      } catch (err) {
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          setStatus('cancelled')
          return null
        }

        // Audio demasiado largo: no es una falla del motor (no se ofrece "subir original"),
        // se propaga para que la UI muestre la tarjeta de límite de duración
        if (err instanceof AudioTooLongError) {
          setStatus('idle')
          abortControllerRef.current = null
          throw err
        }

        // Degradación elegante: guardamos el error para permitir al usuario reintentar o usar original
        const errorMessage =
          err.message || 'No fue posible optimizar el audio con el motor en el navegador.'
        setError(errorMessage)
        setStatus('error')
        abortControllerRef.current = null
        return null
      }
    },
    []
  )

  return {
    status,
    progress,
    result,
    error,
    warning,
    originalFile,
    isCompressing: status === 'compressing' || status === 'loading-engine',
    isLoadingEngine: status === 'loading-engine',
    isDone: status === 'done',
    isError: status === 'error',
    compress,
    cancel,
    reset,
  }
}
