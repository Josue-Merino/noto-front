import { useEffect, useState } from 'react'
import { Loader2, Play } from 'lucide-react'
import { generationService } from '@/features/home/services/generation.service'

/**
 * "Audio original" (pantalla Apunte 01): reproduce el audio que conserva el backend.
 * Se descarga con el token (no se puede usar la URL directa en <audio>) solo al pedirlo.
 *
 * @param {object} props
 * @param {string} props.jobId
 * @param {string} props.fileName
 * @param {{ available: boolean, expiresAt?: string | null }} props.audio
 */
export function OriginalAudioCard({ jobId, fileName, audio }) {
  const [state, setState] = useState({ status: 'idle', url: null, error: null })

  // Libera el blob al salir o cambiar de apunte
  useEffect(() => {
    return () => {
      if (state.url) URL.revokeObjectURL(state.url)
    }
  }, [state.url])

  const load = async () => {
    setState({ status: 'loading', url: null, error: null })
    try {
      const blob = await generationService.fetchAudio(jobId)
      setState({ status: 'ready', url: URL.createObjectURL(blob), error: null })
    } catch (err) {
      setState({ status: 'error', url: null, error: err.message || 'No se pudo cargar el audio.' })
    }
  }

  const expires = audio.expiresAt
    ? new Date(audio.expiresAt).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-5" aria-label="Audio original">
      <h2 className="text-sm font-semibold text-text-h">Audio original</h2>

      {!audio.available ? (
        <p className="mt-2 text-xs text-text-muted leading-relaxed">
          El audio ya no está disponible: el servidor lo conserva por un tiempo limitado.
        </p>
      ) : state.status === 'ready' ? (
        <audio controls autoPlay src={state.url} className="mt-3 w-full h-10" />
      ) : (
        <button
          type="button"
          onClick={load}
          disabled={state.status === 'loading'}
          className="mt-3 flex items-center gap-3 w-full text-left group focus-visible:outline-none"
        >
          <span className="w-9 h-9 rounded-full bg-accent text-text-on-accent flex items-center justify-center shrink-0 group-hover:bg-accent-hover group-focus-visible:ring-2 group-focus-visible:ring-accent-border">
            {state.status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            )}
          </span>
          <span className="text-xs text-text">{state.status === 'loading' ? 'Cargando audio…' : 'Reproducir'}</span>
        </button>
      )}

      {state.error && <p role="alert" className="mt-2 text-xs text-error">{state.error}</p>}

      <p className="mt-3 text-xs text-text-muted truncate" title={fileName}>
        {fileName}
      </p>
      {audio.available && expires && (
        <p className="mt-1 text-[11px] text-text-muted">Disponible hasta el {expires}</p>
      )}
    </section>
  )
}
