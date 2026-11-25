/**
 * Configuración y umbrales para captura y compresión de audio en Noto.
 * Diseñado para optimizar voz (speech-to-text) a mono, 16 kHz y 32 kbps Opus.
 */

export const AUDIO_CONFIG = {
  // Parámetros de compresión para voz (Speech-to-Text con AssemblyAI / Whisper)
  BITRATE: '32k',
  BITRATE_NUMERIC: 32000,
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  CODEC_OPUS: 'libopus',
  CODEC_MP3_FALLBACK: 'libmp3lame',
  OUTPUT_EXT: 'webm',
  OUTPUT_MIME: 'audio/webm;codecs=opus',

  // Umbrales de tamaño
  SKIP_COMPRESSION_SIZE_BYTES: 15 * 1024 * 1024, // 15 MB
  WARN_LARGE_FILE_SIZE_BYTES: 300 * 1024 * 1024,  // 300 MB
  MAX_FILE_SIZE_BYTES: 1536 * 1024 * 1024,       // 1.5 GB
  MAX_FILE_SIZE_LABEL: '1.5 GB',

  // Límite de duración
  MAX_DURATION_SECONDS: 7200, // 2 horas
}

/**
 * Determina si un archivo necesita compresión previa antes de ser subido.
 * - Siempre comprime videos (MP4, MOV) para extraer solo la pista de audio.
 * - Comprime audios pesados (WAV, o MP3 > 15 MB).
 * - Omite compresión si el audio ya es liviano (<= 15 MB) o está en Opus/WebM/OGG.
 * @param {File | Blob} file
 * @returns {boolean}
 */
export function shouldCompressFile(file) {
  if (!file) return false

  const name = (file.name || '').toLowerCase()
  const type = (file.type || '').toLowerCase()

  // 1. Siempre comprimir videos para extraer el audio y descartar imagen
  const isVideo =
    type.includes('video') ||
    name.endsWith('.mp4') ||
    name.endsWith('.mov') ||
    name.endsWith('.m4v') ||
    name.endsWith('.mkv')

  if (isVideo) return true

  // 2. Formatos sin comprimir o muy pesados siempre se comprimen (ej. WAV)
  if (name.endsWith('.wav') || type.includes('wav')) {
    return true
  }

  // 3. Si es un archivo de audio menor o igual a 15 MB y ya está en WebM u OGG (típico Opus), omitir
  const isAlreadyOpus =
    (type.includes('webm') || type.includes('ogg') || name.endsWith('.webm') || name.endsWith('.ogg')) &&
    file.size <= AUDIO_CONFIG.SKIP_COMPRESSION_SIZE_BYTES

  if (isAlreadyOpus) {
    return false
  }

  // 4. Si es un audio menor o igual a 15 MB (ej. MP3 ligero), omitir
  if (file.size <= AUDIO_CONFIG.SKIP_COMPRESSION_SIZE_BYTES) {
    return false
  }

  // Si pesa más de 15 MB, comprimir
  return true
}

/**
 * Formatea bytes a una cadena legible (ej: "148.5 MB" o "3.2 MB")
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let num = bytes
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024
    i++
  }
  return `${num.toFixed(1)} ${units[i]}`
}
