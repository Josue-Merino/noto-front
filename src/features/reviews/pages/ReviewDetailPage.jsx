import { useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertCircle, AudioLines, Calendar, CheckSquare, Clock, Copy, FileText, Layers, ListChecks, Share, Sparkles, Video } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { downloadStudyMaterialMarkdown } from '@/lib/markdown/studyMaterialToMarkdown'
import { getOutputTypeLabel } from '@/features/home/constants/outputTypes'
import { GenerationProgressCard } from '@/features/home/components/GenerationProgressCard'
import { useGenerationJob } from '../hooks/useGenerationJob'
import { isActiveStatus } from '../mappers/review.mapper'
import { materialCounts, missingMaterials, sectionsLabel } from '../lib/materialSummary'
import { Breadcrumb } from '../components/Breadcrumb'
import { JobStatusPanel } from '../components/JobStatusPanel'
import { GenerateMoreModal } from '../components/GenerateMoreModal'
import { OriginalAudioCard } from '../components/OriginalAudioCard'
import { NotesView } from '../components/NotesView'
import { FlashcardsView } from '../components/FlashcardsView'
import { QuizView } from '../components/QuizView'

/**
 * Apunte generado (pantalla Apunte 01): pestañas Apunte / Flashcards / Cuestionario, panel de
 * "Material de estudio" con "Generar más material", audio original y exportación a Markdown.
 * Editar, mover y eliminar quedan fuera de alcance (no hay persistencia de apuntes).
 */
export function ReviewDetailPage() {
  const { id } = useParams()
  const state = useGenerationJob(id)
  const { job } = state

  // Sin contenido todavía: la pantalla de progreso/resultado es la que corresponde
  const hasContent = job?.content && Object.values(job.content).some(Boolean)
  if (job && !hasContent && job.status && job.status !== 'completed') {
    return <Navigate to={`/generation/${id}`} replace />
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto py-4">
      {job && hasContent ? (
        <NoteDetail job={job} state={state} />
      ) : job && !job.status ? (
        <SampleReview job={job} />
      ) : (
        <>
          <Breadcrumb items={[{ label: 'Historial', to: '/history' }, { label: 'Apunte' }]} />
          <JobStatusPanel state={state} />
        </>
      )}
    </div>
  )
}

const TABS = [
  { key: 'notes', label: 'Apunte', icon: FileText },
  { key: 'flashcards', label: 'Flashcards', icon: Copy },
  { key: 'quiz', label: 'Cuestionario', icon: ListChecks },
]

/**
 * @param {object} props
 * @param {object} props.job
 * @param {ReturnType<typeof useGenerationJob>} props.state
 */
function NoteDetail({ job, state }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { content } = job
  const counts = materialCounts(content)
  const missing = missingMaterials(content)
  const isBusy = isActiveStatus(job.status)
  const addFailed = job.status === 'failed' || job.status === 'cancelled'

  const available = TABS.filter((tab) => content[tab.key])
  const activeKey = available.find((tab) => tab.key === searchParams.get('tab'))?.key ?? available[0]?.key
  const selectTab = (key) => setSearchParams({ tab: key }, { replace: true })

  const tabLabel = (tab) =>
    tab.key === 'flashcards' ? `${tab.label} (${counts.flashcards})` : tab.key === 'quiz' ? `${tab.label} (${counts.questions})` : tab.label

  const exportMarkdown = () =>
    downloadStudyMaterialMarkdown({ title: job.title, content, sourceName: job.source?.originalName, date: job.date })

  const handleGenerate = async (materials) => {
    const result = await state.addMaterials(materials)
    if (result) setIsModalOpen(false)
  }

  const sourceName = job.source?.originalName ?? (job.originType === 'recording' ? 'una grabación de audio' : 'un archivo')
  const OriginIcon = job.type === 'video' ? Video : AudioLines

  return (
    <>
      <Breadcrumb items={[{ label: 'Historial', to: '/history' }, { label: job.title }]} />

      {/* Cabecera */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-h break-words">{job.title}</h1>
          <p className="mt-1 text-sm text-text truncate">Generado desde {sourceName}</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={Share} rightIcon={null} onClick={exportMarkdown} className="px-4 shrink-0">
          Exportar .md
        </Button>
      </div>

      {/* Pestañas */}
      {available.length > 1 && (
        <div role="tablist" aria-label="Secciones del material" className="inline-flex flex-wrap gap-1 p-1 mb-5 rounded-xl border border-border bg-bg-darker self-start">
          {available.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.key === activeKey
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                onClick={() => selectTab(tab.key)}
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border',
                  isActive ? 'bg-surface-active text-text-h font-medium' : 'text-text-muted hover:text-text-h'
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {tabLabel(tab)}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        {/* Contenido */}
        <section
          role="tabpanel"
          id={`panel-${activeKey}`}
          aria-labelledby={available.length > 1 ? `tab-${activeKey}` : undefined}
          className="rounded-2xl border border-border bg-surface/60 p-5 sm:p-7 min-w-0"
        >
          <div className="flex flex-wrap items-center gap-2 mb-5 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-accent-border text-accent">
              <OriginIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {job.badgeText}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {getOutputTypeLabel(job.outputTypeId)}
            </span>
            {job.duration !== '—' && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {job.duration}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {job.dateText}
            </span>
          </div>

          {activeKey === 'notes' && <NotesView notes={content.notes} />}
          {activeKey === 'flashcards' && <FlashcardsView flashcards={content.flashcards} />}
          {activeKey === 'quiz' && <QuizView quiz={content.quiz} />}
        </section>

        {/* Panel lateral */}
        <aside className="flex flex-col gap-4">
          {isBusy && (
            <section className="rounded-2xl border border-accent-border bg-surface/60 p-5">
              <GenerationProgressCard
                job={job}
                title="Generando más material"
                badge={pendingLabel(job.pendingMaterials)}
                onCancel={state.pendingAction ? undefined : state.cancel}
                actionError={state.actionError}
              />
            </section>
          )}

          {addFailed && job.pendingMaterials?.length > 0 && (
            <section role="alert" className="rounded-2xl border border-error/40 bg-error-bg/40 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-text-h">
                <AlertCircle className="w-4 h-4 text-error" aria-hidden="true" />
                {job.status === 'cancelled' ? 'Cancelaste la generación' : 'No se pudo generar el material'}
              </p>
              {job.error?.message && job.status === 'failed' && <p className="mt-1 text-xs text-text">{job.error.message}</p>}
              {job.audio?.available && (
                <Button size="sm" fullWidth rightIcon={null} className="mt-3" isLoading={state.pendingAction === 'retry'} onClick={state.retry}>
                  Reintentar
                </Button>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-border bg-surface/60 p-5">
            <h2 className="text-base font-semibold text-text-h mb-4">Material de estudio</h2>
            <ul className="flex flex-col gap-3">
              {counts.hasNotes && (
                <MaterialRow icon={FileText} title="Apunte" subtitle={sectionsLabel(counts.sections || 1)} action="Leer" onClick={() => selectTab('notes')} />
              )}
              {counts.flashcards > 0 && (
                <MaterialRow icon={Layers} title={`${counts.flashcards} flashcards`} subtitle="Tarjetas de memorización" action="Repasar" primary onClick={() => selectTab('flashcards')} />
              )}
              {counts.questions > 0 && (
                <MaterialRow icon={CheckSquare} title="Cuestionario" subtitle={`${counts.questions} preguntas`} action="Resolver" onClick={() => selectTab('quiz')} />
              )}
            </ul>

            {missing.length > 0 && (
              <>
                <Button
                  variant="soft"
                  size="sm"
                  fullWidth
                  leftIcon={Sparkles}
                  rightIcon={null}
                  className="mt-4"
                  disabled={!job.audio?.available || isBusy}
                  onClick={() => {
                    state.clearActionError()
                    setIsModalOpen(true)
                  }}
                >
                  Generar más material
                </Button>
                {!job.audio?.available && (
                  <p className="mt-2 text-[11px] text-text-muted">
                    El audio original ya no está guardado, así que no se puede generar más material.
                  </p>
                )}
              </>
            )}
          </section>

          <OriginalAudioCard jobId={job.id} fileName={job.source?.originalName ?? 'Grabación de audio'} audio={job.audio ?? { available: false }} />
        </aside>
      </div>

      {isModalOpen && (
        <GenerateMoreModal
          isOpen
          onClose={() => setIsModalOpen(false)}
          title={job.title}
          missing={missing}
          onGenerate={handleGenerate}
          isSubmitting={state.pendingAction === 'materials'}
          error={state.actionError}
        />
      )}
    </>
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
function MaterialRow({ icon: Icon, title, subtitle, action, primary = false, onClick }) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent-muted text-accent border border-accent-border shrink-0">
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-h truncate">{title}</p>
        <p className="text-[11px] text-text-muted truncate">{subtitle}</p>
      </div>
      <Button variant={primary ? 'primary' : 'outline'} size="sm" rightIcon={null} onClick={onClick} className="shrink-0">
        {action}
      </Button>
    </li>
  )
}

const MATERIAL_LABELS = { notes: 'Apunte', flashcards: 'Flashcards', quiz: 'Cuestionario' }

/** "Apunte + Cuestionario" */
const pendingLabel = (materials = []) => materials.map((m) => MATERIAL_LABELS[m] ?? m).join(' + ') || undefined

/** Repasos de ejemplo (modo sin backend): no traen contenido generado. */
function SampleReview({ job }) {
  return (
    <>
      <Breadcrumb items={[{ label: 'Historial', to: '/history' }, { label: job.title }]} />
      <div className="rounded-2xl border border-border bg-surface/60 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-text-h">{job.title}</h1>
        <p className="mt-2 text-sm text-text-muted">
          Este es un repaso de ejemplo. Genera un material desde el inicio para estudiarlo aquí.
        </p>
      </div>
    </>
  )
}
