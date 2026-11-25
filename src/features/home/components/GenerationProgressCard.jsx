import { ArrowRight, Clock, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { getOutputTypeLabel } from '../constants/outputTypes'
import { buildGenerationSteps, formatRemaining } from '../lib/generationSteps'
import { useNow } from '../hooks/useNow'
import { GenerationSteps } from './GenerationSteps'
import { isActiveStatus } from '@/features/reviews/mappers/review.mapper'

/**
 * Progreso de una generación en curso (pantallas Home 06-09): barra, pasos, tiempo estimado,
 * Cancelar y Ver resultado (si se pasa `onViewResult`; se habilita cuando el backend confirma que terminó).
 *
 * @param {object} props
 * @param {object} props.job - Modelo de vista del trabajo.
 * @param {() => void} [props.onCancel]
 * @param {() => void} [props.onViewResult]
 * @param {string | null} [props.actionError]
 * @param {string} [props.title]
 * @param {string} [props.badge] - Etiqueta de la derecha (por defecto, el tipo de salida).
 */
export function GenerationProgressCard({
  job,
  onCancel,
  onViewResult,
  actionError = null,
  title = 'Generando material de repaso',
  badge,
}) {
  const isActive = isActiveStatus(job.status)
  const now = useNow(isActive)
  const { steps, progress, remainingSec } = buildGenerationSteps(job, now)

  return (
    <div className="flex flex-col gap-5" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-text-h">
          <Sparkles className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
          {title}
        </h2>
        <span className="px-2.5 py-1 rounded-lg border border-accent-border bg-accent-muted text-accent text-xs font-medium shrink-0">
          {badge ?? getOutputTypeLabel(job.outputTypeId ?? job.outputType)}
        </span>
      </div>

      <div
        className="h-1.5 rounded-full bg-surface-active overflow-hidden"
        role="progressbar"
        aria-label="Progreso de la generación"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-700"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <GenerationSteps steps={steps} />

      <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-darker/60 p-4">
        <Clock className="w-5 h-5 text-text-muted shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-text-h">
            {isActive
              ? `Tiempo estimado: ${formatRemaining(remainingSec ?? 0)}`
              : 'Tu material está listo'}
          </p>
          <p className="mt-1 text-text-muted text-xs sm:text-sm leading-relaxed">
            Puedes salir de esta pantalla; te avisaremos cuando esté listo. Si algo falla, tu audio se
            conserva para que puedas reintentar.
          </p>
        </div>
      </div>

      {actionError && <FormAlert message={actionError} variant="error" />}

      <div className="flex items-center justify-between gap-3">
        {onCancel && isActive ? (
          <Button variant="ghost" size="sm" leftIcon={X} rightIcon={null} onClick={onCancel}>
            Cancelar
          </Button>
        ) : (
          <span />
        )}
        {onViewResult && (
          <Button size="sm" rightIcon={ArrowRight} onClick={onViewResult} disabled={isActive} className="px-5">
            Ver resultado
          </Button>
        )}
      </div>
    </div>
  )
}
