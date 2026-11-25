import { AUDIO_CONFIG } from '@/lib/audio/audioConfig'
import { z } from 'zod'
import { OUTPUT_TYPE_IDS } from '../constants/outputTypes'

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
]

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
]

export const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.mp4', '.mov', '.webm', '.m4a']

export const MAX_FILE_SIZE_BYTES = AUDIO_CONFIG.MAX_FILE_SIZE_BYTES // 1.5 GB
export const MAX_DURATION_SECONDS = 7200 // 2 horas

/**
 * Valida si un archivo cumple con los formatos permitidos por extensión o MIME.
 * @param {File} file
 * @returns {boolean}
 */
export function isValidFileType(file) {
  if (!file) return false
  const lowerName = file.name?.toLowerCase() || ''
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
  const hasValidMime =
    ALLOWED_AUDIO_TYPES.includes(file.type) || ALLOWED_VIDEO_TYPES.includes(file.type)
  return hasValidExt || hasValidMime
}

export const generatorSchema = z.object({
  outputType: z.enum(OUTPUT_TYPE_IDS, {
    required_error: 'Selecciona un tipo de salida',
  }).default('full'),
  file: z
    .custom((val) => val instanceof Blob || val instanceof File, {
      message: 'Debes subir un archivo o grabar un audio.',
    })
    .refine((file) => file && file.size <= MAX_FILE_SIZE_BYTES, {
      message: `El archivo excede el tamaño máximo permitido de ${AUDIO_CONFIG.MAX_FILE_SIZE_LABEL}.`,
    })
    .refine((file) => file && isValidFileType(file), {
      message: 'Formato no soportado. Usa MP3, WAV, MP4 o MOV.',
    }),
})
