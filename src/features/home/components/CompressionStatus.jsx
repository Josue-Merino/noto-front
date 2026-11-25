import { Loader2, X, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatBytes } from '@/lib/audio/audioConfig'

/**
 * Componente que muestra el progreso, advertencias o resultados de la compresión
 * de audio antes de la subida, garantizando accesibilidad y estética con tokens de diseño.
 *
 * @param {object} props
 * @param {'idle' | 'loading-engine' | 'compressing' | 'done' | 'error' | 'cancelled'} props.status
 * @param {number} props.progress - Progreso numérico de 0 a 100.
 * @param {{ originalSize: number, compressedSize: number, savingsPercent: number } | null} props.result
 * @param {string | null} props.error - Mensaje de error de compresión.
 * @param {string | null} props.warning - Mensaje de advertencia por tamaño grande (>300 MB).
 * @param {() => void} [props.onCancel] - Cancelar compresión en curso.
 * @param {() => void} [props.onRetry] - Reintentar compresión.
 * @param {() => void} [props.onUseOriginal] - Omitir compresión y usar archivo original.
 */
export function CompressionStatus({
  status,
  progress,
  result,
  error,
  warning,
  onCancel,
  onRetry,
  onUseOriginal,
}) {
  if (status === 'idle') return null

  return (
    <div
      aria-live="polite"
      className="w-full flex flex-col gap-2 p-3 rounded-xl bg-surface border border-border text-left animate-fadeIn mt-2"
    >
      {/* 1. Cargando motor de audio */}
      {status === 'loading-engine' && (
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-accent">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span className="font-medium">Cargando motor de audio… (primera vez)</span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-text-muted hover:text-text text-[11px] underline transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* 2. Comprimiendo audio con barra de progreso */}
      {status === 'compressing' && (
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-text-h font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent shrink-0" aria-hidden="true" />
              <span>Comprimiendo audio a voz… {progress}%</span>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                aria-label="Cancelar compresión de audio"
                className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-error transition-colors"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Cancelar</span>
              </button>
            )}
          </div>

          {/* Barra de progreso accesible */}
          <div className="w-full h-1.5 bg-bg-darker rounded-full overflow-hidden border border-border/50">
            <div
              className="h-full bg-accent rounded-full transition-all duration-200"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Advertencia de archivo pesado (>300 MB) */}
      {warning && (status === 'compressing' || status === 'loading-engine') && (
        <div className="flex items-start gap-1.5 text-[11px] text-warning bg-warning-bg/40 p-2 rounded-lg border border-warning/20">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
          <span>{warning}</span>
        </div>
      )}

      {/* 3. Compresión exitosa: muestra ahorro */}
      {status === 'done' && result && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-success font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              {formatBytes(result.originalSize)} → {formatBytes(result.compressedSize)}
            </span>
          </div>
          {result.savingsPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-success-bg text-success border border-success/30">
              −{result.savingsPercent}% de peso
            </span>
          )}
        </div>
      )}

      {/* 4. Error en compresión con degradación elegante */}
      {status === 'error' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-error">{error || 'No se pudo optimizar el audio.'}</p>
          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-hover text-xs font-medium text-text-h hover:bg-surface-active border border-border transition-colors"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                <span>Reintentar</span>
              </button>
            )}
            {onUseOriginal && (
              <button
                type="button"
                onClick={onUseOriginal}
                className="text-xs text-accent hover:underline transition-colors font-medium"
              >
                Subir archivo original
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. Cancelado */}
      {status === 'cancelled' && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Compresión cancelada.</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-accent hover:underline text-[11px] font-medium"
            >
              Iniciar de nuevo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
