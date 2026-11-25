import { useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw, History, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { studyService } from '../services/study.service'
import { formatDateText } from '../mappers/review.mapper'

const OPTION_LETTERS = 'ABCDEF'

/**
 * Pregunta de opción múltiple: al elegir una opción se bloquea y muestra si fue correcta.
 */
function QuestionCard({ number, question, selected, onSelect }) {
  const answered = selected !== undefined
  const isCorrect = selected === question.correctOptionIndex

  return (
    <li className="p-4 sm:p-5 rounded-xl bg-bg-darker border border-border">
      <p className="text-sm font-semibold text-text-h mb-3">
        <span className="text-accent mr-1.5">{number}.</span>
        {question.question}
      </p>

      <div className="flex flex-col gap-2" role="group" aria-label={`Opciones de la pregunta ${number}`}>
        {question.options.map((option, i) => {
          const isThisCorrect = i === question.correctOptionIndex
          const isThisSelected = i === selected
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => onSelect(i)}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border text-left text-sm transition-colors',
                !answered && 'bg-surface border-border hover:border-border-light hover:bg-surface-hover text-text-h',
                answered && isThisCorrect && 'bg-success-bg border-success/50 text-text-h',
                answered && isThisSelected && !isThisCorrect && 'bg-error-bg border-error/50 text-text-h',
                answered && !isThisCorrect && !isThisSelected && 'bg-surface border-border text-text-muted',
                answered && 'cursor-default'
              )}
            >
              <span className="w-5 shrink-0 text-xs font-bold text-text-muted">{OPTION_LETTERS[i]}</span>
              <span className="flex-1">{option}</span>
              {answered && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-label="Correcta" />}
              {answered && isThisSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-error shrink-0" aria-label="Incorrecta" />}
            </button>
          )
        })}
      </div>

      {answered && (
        <p className="mt-3 text-xs leading-relaxed text-text" aria-live="polite">
          <span className={cn('font-semibold mr-1', isCorrect ? 'text-success' : 'text-error')}>
            {isCorrect ? '¡Correcto!' : 'Incorrecto.'}
          </span>
          {question.explanation}
        </p>
      )}
    </li>
  )
}

/**
 * Intentos anteriores guardados (los más recientes primero) y el mejor puntaje.
 * @param {{ attempts: Array<{ id: string, score: number, total: number, correctCount: number, finishedAt: string }>, bestScore: number | null }} props
 */
function AttemptHistory({ attempts, bestScore }) {
  if (!attempts.length) return null
  return (
    <section className="mt-5 p-4 rounded-xl border border-border bg-surface/60" aria-label="Intentos anteriores">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-h">
          <History className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          Intentos anteriores
        </h3>
        {bestScore !== null && (
          <span className="text-xs text-text-muted">
            Mejor puntaje: <span className="font-semibold text-success">{Math.round(bestScore)} %</span>
          </span>
        )}
      </div>
      <ul className="flex flex-col gap-1">
        {attempts.map((attempt) => (
          <li key={attempt.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-text">{formatDateText(attempt.finishedAt)}</span>
            <span className="text-text-h font-medium">
              {Math.round(attempt.score)} % · {attempt.correctCount}/{attempt.total}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Cuestionario de autoevaluación con puntaje. Si está guardado (preguntas con `id`), al responder la
 * última pregunta guarda el intento (lo califica el backend) y muestra el historial de intentos.
 * @param {object} props
 * @param {{ id?: string, questions: Array<{ id?: string, question: string, options: string[], optionIds?: string[],
 *   correctOptionIndex: number, explanation: string }>, attempts?: object[], bestScore?: number | null }} props.quiz
 * @param {(attempt: object) => void} [props.onAttemptSaved]
 */
export function QuizView({ quiz, onAttemptSaved }) {
  const questions = quiz.questions ?? []
  const [answers, setAnswers] = useState({})
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString())
  const [saveState, setSaveState] = useState({ status: 'idle', error: null })

  if (questions.length === 0) {
    return <p className="text-sm text-text-muted">No se generaron preguntas para esta clase.</p>
  }

  const canSave = Boolean(quiz.id) && questions.every((q) => q.id && q.optionIds)
  const answeredCount = Object.keys(answers).length
  const correctCount = questions.filter((q, i) => answers[i] === q.correctOptionIndex).length
  const isFinished = answeredCount === questions.length

  const saveAttempt = async (finalAnswers) => {
    setSaveState({ status: 'saving', error: null })
    try {
      const attempt = await studyService.saveQuizAttempt(quiz.id, {
        startedAt,
        answers: questions.map((q, i) => ({ questionId: q.id, optionId: q.optionIds[finalAnswers[i]] ?? null })),
      })
      setSaveState({ status: 'saved', error: null })
      onAttemptSaved?.(attempt)
    } catch (err) {
      setSaveState({ status: 'error', error: err.message || 'No se pudo guardar el intento.' })
    }
  }

  const select = (questionIndex, option) => {
    const next = { ...answers, [questionIndex]: option }
    setAnswers(next)
    // Al responder la última pregunta se guarda el intento (una sola vez por intento)
    if (canSave && Object.keys(next).length === questions.length) saveAttempt(next)
  }

  const restart = () => {
    setAnswers({})
    setStartedAt(new Date().toISOString())
    setSaveState({ status: 'idle', error: null })
  }

  return (
    <div className="text-left">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs text-text-muted" aria-live="polite">
          Respondidas {answeredCount} de {questions.length} · Correctas{' '}
          <span className="font-semibold text-text-h">{correctCount}</span>
          {isFinished && ` (${Math.round((correctCount / questions.length) * 100)} %)`}
          {saveState.status === 'saving' && (
            <span className="inline-flex items-center gap-1 ml-2">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              Guardando intento…
            </span>
          )}
          {saveState.status === 'saved' && <span className="ml-2 text-success font-medium">Intento guardado</span>}
        </p>
        {answeredCount > 0 && (
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border hover:bg-surface-hover text-xs font-medium text-text-h transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-accent" aria-hidden="true" />
            Reintentar
          </button>
        )}
      </div>

      {saveState.status === 'error' && (
        <p className="mb-3 text-xs text-error" role="alert">
          {saveState.error}{' '}
          <button type="button" onClick={() => saveAttempt(answers)} className="underline font-medium">
            Volver a guardar
          </button>
        </p>
      )}

      <ol className="flex flex-col gap-3">
        {questions.map((question, i) => (
          <QuestionCard
            key={question.id ?? i}
            number={i + 1}
            question={question}
            selected={answers[i]}
            onSelect={(option) => select(i, option)}
          />
        ))}
      </ol>

      <AttemptHistory attempts={quiz.attempts ?? []} bestScore={quiz.bestScore ?? null} />
    </div>
  )
}
