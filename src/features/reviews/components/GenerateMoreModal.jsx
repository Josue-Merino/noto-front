import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { cn } from '@/lib/cn'

const MATERIAL_OPTIONS = [
  { key: 'notes', title: 'Apunte', subtitle: 'Síntesis estructurada en Markdown' },
  { key: 'flashcards', title: 'Flashcards', subtitle: 'Tarjetas de memorización' },
  { key: 'quiz', title: 'Cuestionario', subtitle: 'Preguntas de opción múltiple' },
]

/**
 * "Generar más material" (pantalla Apunte 06, adaptada): reprocesa el audio original guardado
 * para generar solo los materiales que todavía no tiene el apunte.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} props.title - Título del apunte (origen).
 * @param {Array<'notes' | 'flashcards' | 'quiz'>} props.missing - Materiales que faltan.
 * @param {(materials: string[]) => Promise<unknown>} props.onGenerate
 * @param {boolean} [props.isSubmitting]
 * @param {string | null} [props.error]
 */
export function GenerateMoreModal({ isOpen, onClose, title, missing, onGenerate, isSubmitting = false, error = null }) {
  const [selected, setSelected] = useState(missing)
  const options = MATERIAL_OPTIONS.filter((option) => missing.includes(option.key))

  const toggle = (key) =>
    setSelected((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={Sparkles}
      title="Generar material de estudio"
      description="A partir del audio original de este apunte."
      footer={
        <>
          <Button variant="ghost" size="sm" rightIcon={null} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            leftIcon={Sparkles}
            rightIcon={null}
            disabled={!selected.length}
            isLoading={isSubmitting}
            loadingText="Enviando…"
            onClick={() => onGenerate(selected)}
            className="px-5"
          >
            Generar
          </Button>
        </>
      }
    >
      <p className="text-xs font-medium text-text-muted">Origen</p>
      <p className="mt-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-bg-darker text-sm text-text-h truncate">
        Apunte · {title}
      </p>

      <p className="mt-5 mb-2.5 text-xs font-semibold tracking-wider text-text-muted uppercase">Qué quieres generar</p>
      <div className="flex flex-col gap-3" role="group" aria-label="Materiales a generar">
        {options.map((option) => {
          const isChecked = selected.includes(option.key)
          return (
            <label
              key={option.key}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                isChecked ? 'border-accent-border bg-accent-muted/30' : 'border-border bg-bg-darker hover:border-border-light'
              )}
            >
              <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => toggle(option.key)} />
              <span
                className={cn(
                  'w-5 h-5 rounded-md flex items-center justify-center border shrink-0',
                  isChecked ? 'bg-accent border-accent text-text-on-accent' : 'border-border'
                )}
                aria-hidden="true"
              >
                {isChecked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-text-h">{option.title}</span>
                <span className="text-xs text-text-muted">{option.subtitle}</span>
              </span>
            </label>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-text-muted leading-relaxed">
        La IA vuelve a escuchar la clase completa, así que puede tardar unos minutos. Te avisaremos cuando
        esté listo.
      </p>

      {error && <FormAlert message={error} variant="error" className="mt-4" />}
    </Modal>
  )
}
