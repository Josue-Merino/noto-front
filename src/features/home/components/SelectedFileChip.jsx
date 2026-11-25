import { FileAudio, FileVideo, FileText, X, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatBytes } from '@/lib/audio/audioConfig'

/**
 * Chip para mostrar el archivo multimedia o audio grabado, reflejando
 * el estado del proceso de compresión en el navegador si está activo.
 *
 * @param {object} props
 * @param {File | Blob} props.file - Archivo actual.
 * @param {() => void} props.onRemove - Callback para eliminar el archivo.
 * @param {object} [props.compression] - Estado de compresión opcional.
 * @param {string} [props.className] - Clases adicionales.
 */
export function SelectedFileChip({ file, onRemove, compression, className }) {
  if (!file) return null

  const isVideo =
    file.type?.includes('video') ||
    file.name?.endsWith('.mp4') ||
    file.name?.endsWith('.mov')
  const isAudio =
    file.type?.includes('audio') ||
    file.name?.endsWith('.mp3') ||
    file.name?.endsWith('.wav') ||
    file.name?.endsWith('.webm') ||
    file.name?.endsWith('.ogg')

  const Icon = isVideo ? FileVideo : isAudio ? FileAudio : FileText

  const compStatus = compression?.status || 'done'
  const compProgress = compression?.progress || 0
  const compResult = compression?.result
  const compError = compression?.error

  // Estado: Cargando motor de audio
  if (compStatus === 'loading-engine') {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 p-3 rounded-xl bg-surface border border-accent-border/50 w-full animate-fadeIn shadow-sm',
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 text-accent">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium truncate">
              Cargando motor de audio… (primera vez)
            </span>
          </div>
          {compression?.onCancel && (
            <button
              type="button"
              onClick={compression.onCancel}
              className="text-[11px] text-text-muted hover:text-error transition-colors shrink-0"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    )
  }

  // Estado: Comprimiendo
  if (compStatus === 'compressing') {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 p-3 rounded-xl bg-surface border border-accent-border/50 w-full animate-fadeIn shadow-sm',
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 text-text-h">
            <Loader2 className="w-4 h-4 animate-spin text-accent shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium truncate">
              Comprimiendo… {compProgress}%
            </span>
          </div>
          {compression?.onCancel && (
            <button
              type="button"
              onClick={compression.onCancel}
              className="text-[11px] text-text-muted hover:text-error transition-colors shrink-0"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* Barra de progreso accesible */}
        <div className="w-full h-1.5 bg-bg-darker rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full bg-accent rounded-full transition-all duration-150"
            role="progressbar"
            aria-valuenow={compProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: `${compProgress}%` }}
          />
        </div>
      </div>
    )
  }

  // Estado: Error con fallback
  if (compStatus === 'error') {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 p-3 rounded-xl bg-surface border border-error/40 w-full animate-fadeIn shadow-sm',
          className
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-error font-medium">
            {compError || 'Error al comprimir audio.'}
          </p>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Quitar archivo"
            className="p-1 rounded text-text-muted hover:text-error transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-3 pt-1 border-t border-border/50 text-[11px]">
          {compression?.onRetry && (
            <button
              type="button"
              onClick={compression.onRetry}
              className="inline-flex items-center gap-1 text-text-h hover:text-accent transition-colors font-medium"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              <span>Reintentar</span>
            </button>
          )}
          {compression?.onUseOriginal && (
            <button
              type="button"
              onClick={compression.onUseOriginal}
              className="text-accent hover:underline transition-colors font-medium"
            >
              Subir original
            </button>
          )}
        </div>
      </div>
    )
  }

  // Estado normal o terminado con éxito
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-accent-border/50 w-full animate-fadeIn shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-2 rounded-lg bg-accent-muted text-accent shrink-0">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-xs sm:text-sm font-medium text-text-h truncate">
            {file.name || 'Audio'}
          </span>
          {compResult ? (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-text-muted">
                {formatBytes(compResult.originalSize)} → {formatBytes(compResult.compressedSize)}
              </span>
              {compResult.savingsPercent > 0 && (
                <span className="px-1 py-0.2 rounded text-[10px] font-bold bg-success-bg text-success border border-success/30">
                  −{compResult.savingsPercent}%
                </span>
              )}
            </div>
          ) : (
            file.size && (
              <span className="text-[11px] text-text-muted">
                {formatBytes(file.size)}
              </span>
            )
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Quitar archivo seleccionado"
        className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-bg/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border transition-colors shrink-0"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}
