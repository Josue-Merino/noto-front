import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileVideo,
  FileAudio,
  Mic,
  Clock,
  Calendar,
  Pencil,
  ArrowRight,
  BookOpen,
  Layers,
  HelpCircle,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { isActiveStatus, reviewPath } from '../mappers/review.mapper'

/**
 * Tarjeta individual del historial de repasos con soporte de modo visualización
 * y modo edición / renombrado en línea idéntico al diseño.
 *
 * @param {object} props
 * @param {object} props.review - Datos del material de repaso.
 * @param {(id: string, newTitle: string) => void} props.onRename - Callback para guardar nuevo título.
 */
export function ReviewCard({ review, onRename }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(review.title)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = editedTitle.trim()
    if (trimmed && trimmed !== review.title) {
      onRename(review.id, trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTitle(review.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const isVideo = review.fileType === 'mp4' || review.fileType === 'mov'
  const isRecording = review.originType === 'recording'

  // Icono para tipo de salida
  const OutputIcon =
    review.outputType?.includes('Flashcards')
      ? Layers
      : review.outputType?.includes('Cuestionario')
        ? HelpCircle
        : BookOpen

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-surface border transition-all duration-200 text-left shadow-md',
        isEditing
          ? 'border-accent-border/70 bg-surface/90 shadow-lg'
          : 'border-border hover:border-border-light hover:bg-surface/80'
      )}
    >
      {/* ================= ESTADO DE EDICIÓN (RENOMBRAR) ================= */}
      {isEditing ? (
        <div className="flex flex-col justify-between h-full w-full gap-3">
          {/* Badge superior con modo edición */}
          <div className="flex items-center justify-between w-full">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-accent-muted text-accent border border-accent-border/40 uppercase">
              {review.fileType === 'mp4' ? (
                <FileVideo className="w-3 h-3" />
              ) : isRecording ? (
                <Mic className="w-3 h-3 text-error" />
              ) : (
                <FileAudio className="w-3 h-3" />
              )}
              <span>{review.badgeText || 'Archivo'}</span>
              <span className="text-text-muted">•</span>
              <span className="text-text-h">Modo edición</span>
            </div>

            <span className="text-[10px] text-text-muted">
              {review.dateText}
            </span>
          </div>

          {/* Formulario de renombrado */}
          <div className="flex flex-col gap-1 my-1">
            <label
              htmlFor={`rename-${review.id}`}
              className="text-[11px] font-medium text-text-muted"
            >
              Cambiar nombre del material:
            </label>
            <input
              ref={inputRef}
              id={`rename-${review.id}`}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 rounded-xl bg-bg border border-accent-border text-xs text-text-h focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent shadow-inner font-medium"
            />
          </div>

          {/* Fila de metadatos */}
          <div className="flex items-center gap-2.5 text-[11px] text-text-muted my-1">
            <span className="inline-flex items-center gap-1 text-accent font-medium">
              <OutputIcon className="w-3 h-3" />
              <span>{review.outputType}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{review.duration}</span>
            </span>
            <span>•</span>
            <span>{review.dateText}</span>
          </div>

          {/* Botones de acción en modo edición */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 mt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-xl text-xs text-text-muted hover:text-text-h transition-colors"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-border hover:bg-surface-hover text-xs font-medium text-text-h transition-colors"
              >
                <Check className="w-3 h-3 text-accent" />
                <span>Guardar</span>
              </button>

              <Link
                to={reviewPath(review)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-text-on-accent text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Entrar</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ================= ESTADO NORMAL (VISUALIZACIÓN) ================= */
        <div className="flex flex-col justify-between h-full w-full gap-3">
          {/* Fila superior: Badge de tipo de archivo / grabación */}
          <div className="flex items-center justify-between w-full">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-accent-muted text-accent border border-accent-border/30 uppercase tracking-wide">
              {isVideo ? (
                <FileVideo className="w-3 h-3" />
              ) : isRecording ? (
                <Mic className="w-3 h-3 text-error" />
              ) : (
                <FileAudio className="w-3 h-3" />
              )}
              <span>{review.badgeText || (isRecording ? 'Grabación de audio' : 'Archivo')}</span>
            </div>

            <StatusBadge status={review.status} />
          </div>

          {/* Origen y Título */}
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">
              {review.originLabel || 'Archivo origen:'}
            </span>

            <h3
              title={review.title}
              className="text-xs sm:text-sm font-bold text-text-h hover:text-accent transition-colors truncate"
            >
              <Link to={reviewPath(review)}>{review.title}</Link>
            </h3>

            {/* Descripción breve (snippet) */}
            <p className="text-[11px] sm:text-xs text-text-muted line-clamp-2 mt-1 leading-relaxed">
              {review.description}
            </p>
          </div>

          {/* Fila de Tags y Metadatos: Formato + Duración + Fecha */}
          <div className="flex items-center flex-wrap gap-2 text-[11px] text-text-muted pt-1 border-t border-border/30">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-hover text-accent font-medium text-[10px] border border-border/40">
              <OutputIcon className="w-3 h-3" />
              <span>{review.outputType}</span>
            </div>

            <div className="inline-flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-text-muted shrink-0" />
              <span>{review.duration}</span>
            </div>

            <span>•</span>

            <div className="inline-flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-text-muted shrink-0" />
              <span>{review.dateText}</span>
            </div>
          </div>

          {/* Fila inferior: Botón Renombrar + Botón de acceso al material */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 mt-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border hover:bg-surface-hover hover:border-border-light text-xs font-medium text-text-h transition-colors"
            >
              <Pencil className="w-3 h-3 text-accent" />
              <span>Renombrar</span>
            </button>

            <Link
              to={reviewPath(review)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover active:bg-accent-active text-text-on-accent text-xs font-semibold shadow-sm transition-all"
            >
              <span>{review.buttonText || 'Ver repaso'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Estado del trabajo en el backend (solo se muestra si no terminó bien).
 * @param {{ status?: string }} props
 */
function StatusBadge({ status }) {
  if (isActiveStatus(status)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-accent-muted text-accent border border-accent-border/40">
        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
        En proceso
      </span>
    )
  }
  if (status === 'failed' || status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-error-bg text-error border border-error/30">
        <AlertCircle className="w-3 h-3" aria-hidden="true" />
        {status === 'failed' ? 'Falló' : 'Cancelado'}
      </span>
    )
  }
  return null
}
