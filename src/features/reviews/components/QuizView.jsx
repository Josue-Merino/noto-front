import { useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'

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
 * Cuestionario de autoevaluación con puntaje.
 * @param {object} props
 * @param {{ questions: Array<{ question: string, options: string[], correctOptionIndex: number, explanation: string }> }} props.quiz
 */
export function QuizView({ quiz }) {
  const questions = quiz.questions ?? []
  const [answers, setAnswers] = useState({})

  if (questions.length === 0) {
    return <p className="text-sm text-text-muted">No se generaron preguntas para esta clase.</p>
  }

  const answeredCount = Object.keys(answers).length
  const correctCount = questions.filter((q, i) => answers[i] === q.correctOptionIndex).length
  const isFinished = answeredCount === questions.length

  return (
    <div className="text-left">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs text-text-muted" aria-live="polite">
          Respondidas {answeredCount} de {questions.length} · Correctas{' '}
          <span className="font-semibold text-text-h">{correctCount}</span>
          {isFinished && ` (${Math.round((correctCount / questions.length) * 100)} %)`}
        </p>
        {answeredCount > 0 && (
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border hover:bg-surface-hover text-xs font-medium text-text-h transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-accent" aria-hidden="true" />
            Reintentar
          </button>
        )}
      </div>

      <ol className="flex flex-col gap-3">
        {questions.map((question, i) => (
          <QuestionCard
            key={i}
            number={i + 1}
            question={question}
            selected={answers[i]}
            onSelect={(option) => setAnswers((prev) => ({ ...prev, [i]: option }))}
          />
        ))}
      </ol>
    </div>
  )
}
