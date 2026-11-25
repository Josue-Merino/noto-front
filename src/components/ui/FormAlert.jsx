import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Alerta accesible para mensajes de error o confirmación globales de formularios.
 * @param {object} props
 * @param {string} props.message - Texto a mostrar.
 * @param {'error' | 'success'} [props.variant] - Tipo de alerta.
 * @param {string} [props.className] - Clases adicionales.
 */
export function FormAlert({ message, variant = 'error', className }) {
  if (!message) return null

  const isError = variant === 'error'
  const Icon = isError ? AlertCircle : CheckCircle2

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-2.5 p-3 rounded-xl text-xs sm:text-sm border transition-all duration-150',
        isError
          ? 'bg-error-bg text-error border-error/20'
          : 'bg-success-bg text-success border-success/20',
        className
      )}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span className="flex-1 leading-relaxed">{message}</span>
    </div>
  )
}
