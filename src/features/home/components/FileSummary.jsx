import { AlertCircle, AudioLines, Check, Video } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Cabecera de archivo (formato, peso, duración y nombre) con barra opcional de carga.
 * Se usa en la subida, el error al procesar y el límite de duración (pantallas Home 13-14).
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string} [props.extension] - Ej. "MP4".
 * @param {string} [props.meta] - Ej. "142.9 MB · 54 min".
 * @param {boolean} [props.isVideo]
 * @param {'default' | 'error'} [props.tone]
 * @param {number | null} [props.progress] - 0-100; si se omite no se muestra la barra.
 * @param {string} [props.progressLabel]
 * @param {React.ReactNode} [props.actions] - Botones a la derecha.
 * @param {React.ReactNode} [props.children] - Contenido extra dentro de la tarjeta.
 */
export function FileSummary({
  name,
  extension,
  meta,
  isVideo = false,
  tone = 'default',
  progress = null,
  progressLabel,
  actions,
  children,
}) {
  const isError = tone === 'error'
  const Icon = isError ? AlertCircle : isVideo ? Video : AudioLines
  const isDone = progress === 100

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5',
        isError ? 'border-error/40 bg-error-bg/40' : 'border-accent-border bg-accent-muted/30'
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border',
            isError ? 'bg-error-bg text-error border-error/30' : 'bg-accent-muted text-accent border-accent-border'
          )}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            {extension && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md border font-semibold',
                  isError ? 'border-error/40 text-error' : 'border-accent-border text-accent'
                )}
              >
                {extension}
              </span>
            )}
            {meta && <span className="truncate">{meta}</span>}
          </div>
          <p className="mt-1 text-sm sm:text-base font-semibold text-text-h truncate" title={name}>
            {name}
          </p>
        </div>
        {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
      </div>

      {progress !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className={cn('flex items-center gap-1.5', isDone ? 'text-success' : 'text-text')}>
              {isDone && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
              {progressLabel}
            </span>
            <span className="text-text-muted tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div
            className="h-1.5 rounded-full bg-surface-active overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label={progressLabel}
          >
            <div
              className={cn('h-full rounded-full transition-all duration-300', isDone ? 'bg-success' : 'bg-accent')}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
