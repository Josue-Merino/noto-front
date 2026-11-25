import { useState, useCallback, useRef } from 'react'
import {
  isValidFileType,
  MAX_FILE_SIZE_BYTES,
  MAX_DURATION_SECONDS,
} from '../schemas/generator.schemas'
import { useAudioCompression } from './useAudioCompression'
import { shouldCompressFile, formatBytes } from '@/lib/audio/audioConfig'
import { getAudioDuration } from '@/lib/audio/getAudioDuration'

/**
 * Hook para gestionar la subida de archivos multimedia, validación previa,
 * compresión en el navegador con ffmpeg.wasm y entrega de archivo optimizado.
 *
 * @param {object} options
 * @param {(file: File | null, meta?: object) => void} options.onFileSelected - Callback al tener el archivo listo.
 */
export function useFileUpload({ onFileSelected }) {
  const [file, setFile] = useState(null)
  const [rawFile, setRawFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileDuration, setFileDuration] = useState('58 min')
  const [compressionMeta, setCompressionMeta] = useState(null)

  const compression = useAudioCompression()
  const activeProcessingFileRef = useRef(null)

  const processFile = useCallback(
    async (selectedFile) => {
      setFileError(null)

      if (!selectedFile) {
        setFile(null)
        setRawFile(null)
        setCompressionMeta(null)
        compression.reset()
        if (onFileSelected) onFileSelected(null)
        return
      }

      // 1. Validar formato soportado
      if (!isValidFileType(selectedFile)) {
        setFileError('Formato no soportado. Usa archivos MP3, WAV, MP4 o MOV.')
        return
      }

      // 2. Validar tamaño máximo estricto (500 MB)
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setFileError('El archivo excede el tamaño máximo permitido de 500 MB.')
        return
      }

      setRawFile(selectedFile)
      activeProcessingFileRef.current = selectedFile

      // 3. Evaluar si requiere compresión con ffmpeg.wasm
      if (shouldCompressFile(selectedFile)) {
        // Notificamos null temporalmente al formulario para deshabilitar envío mientras comprime
        if (onFileSelected) onFileSelected(null)

        const compressed = await compression.compress(selectedFile)

        // Si el usuario seleccionó otro archivo mientras este comprimía, ignoramos este resultado
        if (activeProcessingFileRef.current !== selectedFile) {
          return
        }

        if (compressed) {
          const durationMins = Math.max(1, Math.round(compressed.durationSec / 60))
          const formattedDuration = `${durationMins} min`

          const meta = {
            originalName: selectedFile.name,
            originalSize: compressed.originalSize,
            compressedSize: compressed.compressedSize,
            savingsPercent: compressed.savingsPercent,
            durationSec: compressed.durationSec,
          }

          setFile(compressed.file)
          setFileDuration(formattedDuration)
          setCompressionMeta(meta)

          if (onFileSelected) {
            onFileSelected(compressed.file, meta)
          }
        }
      } else {
        // 4. Si el archivo ya es ligero (ej. audio <= 15 MB), omitir compresión
        compression.reset()
        const durationSec = await getAudioDuration(selectedFile)

        if (durationSec > MAX_DURATION_SECONDS) {
          setFileError('La duración máxima permitida es de 1 hora (60 minutos).')
          setFile(null)
          setRawFile(null)
          if (onFileSelected) onFileSelected(null)
          return
        }

        const durationMins = durationSec > 0 ? Math.max(1, Math.round(durationSec / 60)) : 45
        setFileDuration(`${durationMins} min`)
        setFile(selectedFile)
        setCompressionMeta(null)

        if (onFileSelected) {
          onFileSelected(selectedFile, {
            originalName: selectedFile.name,
            originalSize: selectedFile.size,
            compressedSize: selectedFile.size,
            savingsPercent: 0,
            durationSec,
          })
        }
      }
    },
    [compression, onFileSelected]
  )

  // Acción para degradación elegante: usar archivo original si la compresión falló
  const useOriginalFile = useCallback(async () => {
    if (!rawFile) return

    const durationSec = await getAudioDuration(rawFile)
    if (durationSec > MAX_DURATION_SECONDS) {
      setFileError('La duración del archivo original supera el límite de 60 minutos.')
      return
    }

    const durationMins = durationSec > 0 ? Math.max(1, Math.round(durationSec / 60)) : 58
    setFileDuration(`${durationMins} min`)
    setFile(rawFile)
    setFileError(null)

    const meta = {
      originalName: rawFile.name,
      originalSize: rawFile.size,
      compressedSize: rawFile.size,
      savingsPercent: 0,
      durationSec,
    }
    setCompressionMeta(meta)

    if (onFileSelected) {
      onFileSelected(rawFile, meta)
    }
  }, [rawFile, onFileSelected])

  const retryCompression = useCallback(() => {
    if (rawFile) {
      processFile(rawFile)
    }
  }, [rawFile, processFile])

  const cancelCompression = useCallback(() => {
    compression.cancel()
    activeProcessingFileRef.current = null
  }, [compression])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFiles = e.dataTransfer?.files
      if (droppedFiles && droppedFiles.length > 0) {
        // Cancelar compresión previa si existía
        compression.cancel()
        processFile(droppedFiles[0])
      }
    },
    [compression, processFile]
  )

  const handleFileInputChange = useCallback(
    (e) => {
      const selectedFiles = e.target?.files
      if (selectedFiles && selectedFiles.length > 0) {
        compression.cancel()
        processFile(selectedFiles[0])
      }
    },
    [compression, processFile]
  )

  const removeFile = useCallback(() => {
    compression.cancel()
    activeProcessingFileRef.current = null
    setFile(null)
    setRawFile(null)
    setFileError(null)
    setCompressionMeta(null)
    if (onFileSelected) onFileSelected(null)
  }, [compression, onFileSelected])

  const activeDisplayFile = file || rawFile

  const fileExtension = activeDisplayFile
    ? (activeDisplayFile.name.split('.').pop() || 'MP4').toUpperCase()
    : 'MP4'

  const formattedSize = activeDisplayFile
    ? formatBytes(activeDisplayFile.size)
    : '148.5 MB'

  return {
    file,
    rawFile,
    fileError,
    isDragging,
    fileDuration,
    fileExtension,
    formattedSize,
    compressionMeta,
    compression: {
      status: compression.status,
      progress: compression.progress,
      result: compression.result,
      error: compression.error,
      warning: compression.warning,
      isCompressing: compression.isCompressing,
      isLoadingEngine: compression.isLoadingEngine,
      onCancel: cancelCompression,
      onRetry: retryCompression,
      onUseOriginal: useOriginalFile,
    },
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    removeFile,
    processFile,
  }
}
