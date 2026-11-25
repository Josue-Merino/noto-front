import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Check, Copy, FileText, ListChecks, Play, Share } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { downloadStudyMaterialMarkdown } from '@/lib/markdown/studyMaterialToMarkdown'
import { getOutputTypeLabel } from '@/features/home/constants/outputTypes'
import { useGenerationJob } from '../hooks/useGenerationJob'
import { Breadcrumb } from '../components/Breadcrumb'
import { JobStatusPanel } from '../components/JobStatusPanel'
import { NotesView } from '../components/NotesView'
import { RichText } from '../components/RichText'
import { describeMaterial, materialCounts, sectionsLabel } from '../lib/materialSummary'

const FLASHCARD_PREVIEW = 6
const QUESTION_PREVIEW = 4
const NOTES_PREVIEW_BLOCKS = 6

/**
 * Resultado de una generación (pantallas Resultado 10-12). Si el trabajo sigue en curso o falló,
 * muestra su progreso o el error, así la URL sirve también al recargar a mitad del proceso.
 */
export function GenerationResultPage() {
  const { id } = useParams()
  const state = useGenerationJob(id)
  const { job } = state
  const isReady = job?.status === 'completed' && job.content

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto py-4">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: isReady ? 'Material generado' : 'Generando material' }]} />
      {isReady ? <CompletedResult job={job} /> : <JobStatusPanel state={state} />}
    </div>
  )
}

/** @param {{ job: object }} props */
function CompletedResult({ job }) {
  const navigate = useNavigate()
  const { content } = job
  const counts = materialCounts(content)
  const kind = job.outputTypeId ?? 'full'
  const studyPath = (tab) => `/reviews/${job.id}${tab ? `?tab=${tab}` : ''}`

  const exportMarkdown = () =>
    downloadStudyMaterialMarkdown({
      title: job.title,
      content,
      sourceName: job.source?.originalName,
      date: job.date,
    })

  const banner =
    kind === 'flashcards'
      ? `¡Listo! Se generaron ${counts.flashcards} flashcards`
      : kind === 'quiz'
        ? `¡Listo! Se generó un cuestionario de ${counts.questions} preguntas`
        : '¡Listo! Tu material de estudio está listo'

  return (
    <>
      {/* Cabecera */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wider text-accent uppercase">
            Material generado · {getOutputTypeLabel(kind)}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-text-h break-words">{job.title}</h1>
          <p className="mt-1 text-sm text-text">{describeMaterial(content)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" leftIcon={Share} rightIcon={null} onClick={exportMarkdown} className="px-4">
            Exportar .md
          </Button>
          {kind === 'flashcards' && (
            <Button size="sm" leftIcon={Play} rightIcon={null} onClick={() => navigate(studyPath('flashcards'))} className="px-5">
              Empezar repaso
            </Button>
          )}
          {kind === 'quiz' && (
            <Button size="sm" leftIcon={Play} rightIcon={null} onClick={() => navigate(studyPath('quiz'))} className="px-5">
              Resolver cuestionario
            </Button>
          )}
        </div>
      </div>

      {/* Aviso de éxito */}
      <div role="status" className="flex items-start gap-3 rounded-xl border border-success/40 bg-success-bg/60 p-4 mb-8">
        <Check className="w-5 h-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-text-h">{banner}</p>
          <p className="mt-0.5 text-text-muted text-xs sm:text-sm">También lo encuentras en tu Historial de repasos.</p>
        </div>
      </div>

      {kind === 'flashcards' && <FlashcardsPreview cards={content.flashcards?.cards ?? []} />}
      {kind === 'quiz' && <QuizPreview questions={content.quiz?.questions ?? []} />}
      {kind === 'full' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          <NotesPreview notes={content.notes} sections={counts.sections} onOpen={() => navigate(studyPath('notes'))} />
          <aside className="flex flex-col gap-4">
            {counts.flashcards > 0 && (
              <StudyCard
                icon={Copy}
                title={`${counts.flashcards} flashcards`}
                subtitle="Tarjetas de memorización"
                action="Repasar"
                primary
                onClick={() => navigate(studyPath('flashcards'))}
              />
            )}
            {counts.questions > 0 && (
              <StudyCard
                icon={ListChecks}
                title={`Cuestionario · ${counts.questions}`}
                subtitle="Opción múltiple"
                action="Resolver"
                onClick={() => navigate(studyPath('quiz'))}
              />
            )}
            <section className="rounded-2xl border border-border bg-surface/60 p-5">
              <h2 className="text-sm font-medium text-text-h mb-3">Exportar</h2>
              <Button variant="outline" size="sm" fullWidth leftIcon={Share} rightIcon={null} onClick={exportMarkdown}>
                Descargar Markdown (.md)
              </Button>
              <p className="mt-2 text-[11px] text-text-muted">Compatible con Obsidian y otros editores Markdown.</p>
            </section>
          </aside>
        </div>
      )}
    </>
  )
}

/** @param {{ cards: Array<{ front: string, back: string }> }} props */
function FlashcardsPreview({ cards }) {
  return (
    <section aria-label="Vista previa de las flashcards">
      <PreviewHeader shown={Math.min(FLASHCARD_PREVIEW, cards.length)} total={cards.length} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.slice(0, FLASHCARD_PREVIEW).map((card, i) => (
          <article key={i} className="rounded-2xl border border-border bg-surface/60 p-5">
            <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">Pregunta</p>
            <p className="mt-2 text-sm font-semibold text-text-h"><RichText text={card.front} /></p>
            <div className="my-3 border-t border-border" />
            <p className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">Respuesta</p>
            <p className="mt-2 text-sm text-text"><RichText text={card.back} /></p>
          </article>
        ))}
      </div>
    </section>
  )
}

/** @param {{ questions: Array<{ question: string, options: string[] }> }} props */
function QuizPreview({ questions }) {
  return (
    <section aria-label="Vista previa del cuestionario">
      <PreviewHeader shown={Math.min(QUESTION_PREVIEW, questions.length)} total={questions.length} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.slice(0, QUESTION_PREVIEW).map((q, i) => (
          <article key={i} className="rounded-2xl border border-border bg-surface/60 p-5">
            <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">Pregunta {i + 1}</p>
            <p className="mt-2 text-sm sm:text-base font-semibold text-text-h"><RichText text={q.question} /></p>
            <ul className="mt-3 flex flex-col gap-2">
              {q.options.map((option, j) => (
                <li key={j} className="flex items-center gap-2.5 text-sm text-text">
                  <span className="w-4 h-4 rounded-full border border-text-muted shrink-0" aria-hidden="true" />
                  <RichText text={option} />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

/** @param {{ shown: number, total: number }} props */
function PreviewHeader({ shown, total }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base sm:text-lg font-semibold text-text-h">Vista previa</h2>
      <span className="text-xs text-text-muted">
        {shown} de {total}
      </span>
    </div>
  )
}

/** @param {{ notes: object | null, sections: number, onOpen: () => void }} props */
function NotesPreview({ notes, sections, onOpen }) {
  if (!notes) return null
  const preview = {
    ...notes,
    blocks: (notes.blocks ?? []).slice(0, NOTES_PREVIEW_BLOCKS),
    actionItems: [],
    supportMaterial: [],
    homework: [],
  }
  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-5 sm:p-6" aria-label="Apunte en Markdown">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-text-h">
          <FileText className="w-5 h-5 text-accent" aria-hidden="true" />
          Apunte en Markdown
        </h2>
        {sections > 0 && (
          <span className="px-2 py-0.5 rounded-md border border-border text-xs text-text-muted">{sectionsLabel(sections)}</span>
        )}
      </div>
      <NotesView notes={preview} />
      <Button variant="soft" size="sm" rightIcon={ArrowRight} onClick={onOpen} className="mt-5 px-5">
        Abrir apunte completo
      </Button>
    </section>
  )
}

/**
 * @param {object} props
 * @param {React.ElementType} props.icon
 * @param {string} props.title
 * @param {string} props.subtitle
 * @param {string} props.action
 * @param {boolean} [props.primary]
 * @param {() => void} props.onClick
 */
function StudyCard({ icon: Icon, title, subtitle, action, primary = false, onClick }) {
  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-muted text-accent border border-accent-border shrink-0">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-h">{title}</h2>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
      <Button variant={primary ? 'primary' : 'outline'} size="sm" fullWidth leftIcon={Play} rightIcon={null} onClick={onClick}>
        {action}
      </Button>
    </section>
  )
}
