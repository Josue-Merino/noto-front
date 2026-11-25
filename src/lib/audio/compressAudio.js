import { AUDIO_CONFIG } from './audioConfig'
import { getFFmpeg, terminateFFmpeg } from './ffmpegLoader'
import { getAudioDuration } from './getAudioDuration'
import { AudioTooLongError } from './errors'

// Sin WORKERFS, el archivo se copia completo a la memoria de ffmpeg: solo se permite con archivos chicos
const MAX_IN_MEMORY_BYTES = 300 * 1024 * 1024

/**
 * Comprime un archivo de audio o video a audio mono optimizado para voz (16 kHz, Opus a 32k).
 * Función pura que no depende de estado de React.
 *
 * @param {File | Blob} file - Archivo de origen (MP3, WAV, MP4, MOV, etc.).
 * @param {object} [options]
 * @param {(progressPercent: number) => void} [options.onProgress] - Callback de progreso (0 a 100).
 * @param {AbortSignal} [options.signal] - Señal para cancelar la operación.
 * @returns {Promise<{
 *   file: File,
 *   originalSize: number,
 *   compressedSize: number,
 *   durationSec: number,
 *   savingsPercent: number
 * }>}
 */
export async function compressAudio(file, { onProgress, signal } = {}) {
  if (!file) {
    throw new Error('No se proporcionó ningún archivo para comprimir.')
  }

  // 1. Validar límite máximo de tamaño
  if (file.size > AUDIO_CONFIG.MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `El archivo supera el tamaño máximo permitido de ${AUDIO_CONFIG.MAX_FILE_SIZE_LABEL} (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
    )
  }

  if (signal?.aborted) {
    throw new DOMException('Compresión cancelada', 'AbortError')
  }

  // 2. Obtener la extensión y nombre base
  const originalName = file.name || 'audio-input'
  const extMatch = originalName.match(/\.([^.]+)$/)
  const inputExt = extMatch ? extMatch[1].toLowerCase() : 'mp4'
  const baseName = originalName.replace(/\.[^/.]+$/, '')

  const stamp = Date.now()
  const mountDir = `/input_${stamp}`
  // Ruta de entrada dentro del FS de ffmpeg (se define al montar o escribir el archivo)
  let inputFileName = `input_${stamp}.${inputExt}`
  let isMounted = false
  let outputFileName = `output_${Date.now()}.webm`
  let outputMime = AUDIO_CONFIG.OUTPUT_MIME

  // 3. Obtener o inicializar instancia de FFmpeg
  const progressHandler = ({ progress }) => {
    if (signal?.aborted) return
    // progress va de 0 a 1
    const percent = Math.min(100, Math.max(0, Math.round(progress * 100)))
    if (onProgress) {
      onProgress(percent)
    }
  }

  const ffmpeg = await getFFmpeg({ onProgress: progressHandler })

  if (signal?.aborted) {
    throw new DOMException('Compresión cancelada', 'AbortError')
  }

  // Listener para abortar si la señal se dispara durante la ejecución
  const abortHandler = () => {
    terminateFFmpeg()
  }

  if (signal) {
    signal.addEventListener('abort', abortHandler, { once: true })
  }

  try {
    // 4. Dar acceso al archivo a ffmpeg.
    // WORKERFS lo lee por partes directamente del File: un video de 1.5 GB no se copia a memoria.
    try {
      const { FFFSType } = await import('@ffmpeg/ffmpeg')
      await ffmpeg.createDir(mountDir)
      const asFile = file instanceof File ? file : new File([file], `input.${inputExt}`, { type: file.type })
      await ffmpeg.mount(FFFSType.WORKERFS, { files: [asFile] }, mountDir)
      isMounted = true
      inputFileName = `${mountDir}/${asFile.name}`
    } catch (mountError) {
      // Respaldo: copiar el archivo completo (solo si es chico, para no agotar la memoria)
      if (file.size > MAX_IN_MEMORY_BYTES) throw mountError
      const { fetchFile } = await import('@ffmpeg/util')
      await ffmpeg.writeFile(inputFileName, await fetchFile(file))
    }

    if (signal?.aborted) {
      throw new DOMException('Compresión cancelada', 'AbortError')
    }

    // 5. Intentar compresión principal con libopus
    // -vn: omitir video
    // -map a:0: tomar solo la primera pista de audio
    // -ac 1: convertir a mono
    // -ar 16000: muestreo a 16 kHz (ideal para Whisper y AssemblyAI)
    // -c:a libopus -b:a 32k -application voip: códec Opus optimizado para voz
    let execResult = -1
    try {
      execResult = await ffmpeg.exec([
        '-i',
        inputFileName,
        '-vn',
        '-map',
        'a:0',
        '-ac',
        '1',
        '-ar',
        '16000',
        '-c:a',
        AUDIO_CONFIG.CODEC_OPUS,
        '-b:a',
        AUDIO_CONFIG.BITRATE,
        '-application',
        'voip',
        outputFileName,
      ])
    } catch {
      execResult = -1
    }

    // 6. Si libopus no está soportado o falló, usar fallback a libmp3lame (MP3 a 48k)
    if (execResult !== 0) {
      outputFileName = `output_${Date.now()}.mp3`
      outputMime = 'audio/mp3'

      execResult = await ffmpeg.exec([
        '-i',
        inputFileName,
        '-vn',
        '-map',
        'a:0',
        '-ac',
        '1',
        '-ar',
        '16000',
        '-c:a',
        AUDIO_CONFIG.CODEC_MP3_FALLBACK,
        '-b:a',
        '48k',
        outputFileName,
      ])

      if (execResult !== 0) {
        throw new Error('Error al procesar el audio con FFmpeg.')
      }
    }

    if (signal?.aborted) {
      throw new DOMException('Compresión cancelada', 'AbortError')
    }

    // 7. Leer archivo resultante del FS virtual
    const compressedData = await ffmpeg.readFile(outputFileName)
    const compressedBlob = new Blob([compressedData.buffer], { type: outputMime })
    const finalExt = outputFileName.endsWith('.mp3') ? 'mp3' : 'webm'
    const compressedFile = new File([compressedBlob], `${baseName}.${finalExt}`, {
      type: outputMime,
      lastModified: Date.now(),
    })

    // 8. Validar límite de duración (máx 60 min)
    const durationSec = await getAudioDuration(compressedFile)
    if (durationSec > AUDIO_CONFIG.MAX_DURATION_SECONDS) {
      throw new AudioTooLongError(durationSec, AUDIO_CONFIG.MAX_DURATION_SECONDS)
    }

    const originalSize = file.size
    const compressedSize = compressedFile.size
    const savingsPercent =
      originalSize > compressedSize
        ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
        : 0

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      durationSec,
      savingsPercent,
    }
  } finally {
    // 9. Limpieza obligatoria del FS virtual para no acumular memoria en el worker
    if (signal) {
      signal.removeEventListener('abort', abortHandler)
    }
    try {
      if (isMounted) {
        await ffmpeg.unmount(mountDir).catch(() => {})
        await ffmpeg.deleteDir(mountDir).catch(() => {})
      } else {
        await ffmpeg.deleteFile(inputFileName).catch(() => {})
      }
      await ffmpeg.deleteFile(outputFileName).catch(() => {})
    } catch {
      // Ignorar errores de limpieza
    }
  }
}
