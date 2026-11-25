import { Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Lista de pasos de una generación con su estado (hecho, en curso, pendiente o fallido).
 * @param {object} props
 * @param {import('../lib/generationSteps').GenerationStep[]} props.steps
 */
export function GenerationSteps({ steps }) {
  return (
    <ol className="flex flex-col gap-3" aria-label="Pasos de la generación">
      {steps.map((step) => (
        <li key={step.key} className="flex items-center gap-3 text-sm">
          <StepIcon state={step.state} />
          <span
            className={cn(
              'flex-1 min-w-0 truncate',
              step.state === 'pending' ? 'text-text-muted' : 'text-text-h',
              step.state === 'failed' && 'text-text-muted'
            )}
          >
            {step.label}
          </span>
          {step.detail && (
            <span
              className={cn(
                'text-xs shrink-0 tabular-nums',
                step.state === 'active' ? 'text-accent' : 'text-text-muted',
                step.state === 'failed' && 'text-error'
              )}
            >
              {step.detail}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

/** @param {{ state: import('../lib/generationSteps').StepState }} props */
function StepIcon({ state }) {
  const base = 'w-5 h-5 rounded-full flex items-center justify-center shrink-0'
  if (state === 'done') {
    return (
      <span className={cn(base, 'bg-success text-bg')} aria-label="Completado">
        <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
      </span>
    )
  }
  if (state === 'active') {
    return (
      <span className={cn(base, 'border border-accent text-accent')} aria-label="En curso">
        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
      </span>
    )
  }
  if (state === 'failed') {
    return (
      <span className={cn(base, 'border border-error text-error')} aria-label="Falló">
        <X className="w-3 h-3" aria-hidden="true" />
      </span>
    )
  }
  return <span className={cn(base, 'border border-border')} aria-label="Pendiente" />
}
