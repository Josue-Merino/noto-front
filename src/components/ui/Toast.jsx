import { Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Info, X, ArrowRight } from 'lucide-react'
import { useToastStore } from '@/store/toast.store'
import { cn } from '@/lib/cn'

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info }
const TONES = {
  success: 'border-success/30 text-success',
  error: 'border-error/30 text-error',
  info: 'border-accent-border text-accent',
}

/**
 * Contenedor de toasts (abajo a la derecha). Se monta una vez en el layout autenticado.
 */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div
      aria-live="polite"
      className="fixed z-50 bottom-4 right-4 left-4 sm:left-auto flex flex-col gap-2 sm:w-96 pointer-events-none"
    >
      {toasts.map((toast) => {
        const variant = toast.variant ?? 'info'
        const Icon = ICONS[variant]
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-surface border shadow-2xl backdrop-blur-sm',
              TONES[variant]
            )}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-h">{toast.title}</p>
              {toast.description && <p className="text-xs text-text-muted mt-0.5">{toast.description}</p>}
              {toast.action && (
                <Link
                  to={toast.action.to}
                  onClick={() => dismiss(toast.id)}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-accent hover:text-accent-hover"
                >
                  {toast.action.label}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Cerrar notificación"
              className="p-1 rounded-md text-text-muted hover:text-text-h hover:bg-surface-hover"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
