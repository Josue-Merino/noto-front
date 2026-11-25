import { Mic, CircleDot, Play, Pause, Trash2, AudioWaveform } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Tarjeta para grabar audio de clase mediante MediaRecorder del navegador,
 * con ecualizador de forma de onda animado, pausa/reanudación y controles completos.
 * @param {object} props
 * @param {boolean} props.isRecording - Si la grabación está activa actualmente.
 * @param {boolean} [props.isPaused] - Si la grabación está en pausa.
 * @param {string} props.formattedTime - Tiempo transcurrido en formato mm:ss.
 * @param {string} [props.deviceLabel] - Nombre del dispositivo de audio seleccionado.
 * @param {number[]} [props.waveBars] - Alturas relativas (20-95%) para las barras del ecualizador.
 * @param {string | null} props.audioError - Error de grabación o permisos.
 * @param {() => void} props.onStartRecording - Iniciar grabación.
 * @param {() => void} props.onPauseRecording - Pausar grabación.
 * @param {() => void} props.onResumeRecording - Reanudar grabación.
 * @param {() => void} props.onStopRecording - Detener y transcribir grabación.
 * @param {() => void} props.onCancelRecording - Cancelar y descartar grabación.
 * @param {boolean} [props.disabled] - Si está deshabilitado / atenuado.
 */
export function RecorderCard({
  isRecording,
  isPaused = false,
  formattedTime,
  deviceLabel = 'Micrófono (MacBook Pro Unidad) (Mono, 48k)',
  waveBars = [25, 40, 65, 30, 85, 55, 75, 45, 90, 60, 80, 50, 95, 70, 85, 40, 65, 50, 75, 35, 60, 45, 80, 30, 50, 35, 45, 20],
  audioError,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onCancelRecording,
  disabled = false,
}) {
  const isSessionActive = isRecording || isPaused

  return (
    <div
      aria-label="Zona para grabar audio de clase"
      className={cn(
        'relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl min-h-[220px] transition-all duration-200 select-none text-left',
        isSessionActive
          ? 'bg-surface border border-accent-border/50 shadow-lg'
          : 'bg-bg-darker border border-border shadow-sm text-center items-center',
        disabled && 'opacity-40 pointer-events-none filter grayscale-[20%]'
      )}
    >
      {isSessionActive ? (
        /* ================= ESTADO: GRABANDO O PAUSADO CON ECUALIZADOR ================= */
        <div className="flex flex-col justify-between h-full w-full gap-2.5">
          {/* Cabecera: Título con punto rojo + Badge de estado/tiempo */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full bg-error shrink-0',
                  !isPaused && 'animate-pulse'
                )}
                aria-hidden="true"
              />
              <h3 className="text-xs sm:text-sm font-semibold text-text-h">
                Grabando audio de clase
              </h3>
            </div>

            {/* Badge de tiempo y estado */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold border',
                isPaused
                  ? 'bg-warning-bg text-warning border-warning/30'
                  : 'bg-error-bg text-error border-error/30'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  isPaused ? 'bg-warning' : 'bg-error animate-ping'
                )}
                aria-hidden="true"
              />
              <span>
                {isPaused ? 'PAUSADO' : 'GRABANDO'} • {formattedTime}
              </span>
            </div>
          </div>

          {/* Área Central: Visualizador de Onda Sonora (Ecualizador) */}
          <div className="flex flex-col items-center justify-center my-1">
            <div
              className="flex items-center justify-center gap-1 sm:gap-1.5 h-12 w-full max-w-[280px] sm:max-w-[320px] px-1"
              aria-label="Visualizador de forma de onda de audio"
            >
              {waveBars.map((height, idx) => (
                <span
                  key={idx}
                  style={{ height: `${height}%` }}
                  className={cn(
                    'w-1 sm:w-1.5 rounded-full bg-accent transition-all duration-150',
                    isPaused && 'opacity-60'
                  )}
                />
              ))}
            </div>

            {/* Dispositivo de entrada */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-text-muted mt-2">
              <Mic className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[220px] sm:max-w-[280px]">
                {deviceLabel}
              </span>
            </div>
          </div>

          {/* Fila de Controles: Botón amarillo + Pausa/Reanudar + Basurero */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 w-full">
            {/* Botón principal amarillo: Transcribiendo / Detener */}
            <button
              type="button"
              onClick={onStopRecording}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-accent text-text-on-accent text-xs font-semibold hover:bg-accent-hover active:bg-accent-active transition-all shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border"
            >
              <AudioWaveform className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Transcribiendo audio...</span>
            </button>

            {/* Botón secundario: Reanudar / Pausar */}
            {isPaused ? (
              <button
                type="button"
                onClick={onResumeRecording}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border hover:border-border-light text-text-h text-xs font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border"
              >
                <Play className="w-3 h-3 fill-current shrink-0" aria-hidden="true" />
                <span>Reanudar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPauseRecording}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border hover:border-border-light text-text-h text-xs font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border"
              >
                <Pause className="w-3 h-3 fill-current shrink-0" aria-hidden="true" />
                <span>Pausar</span>
              </button>
            )}

            {/* Botón descartar grabación */}
            <button
              type="button"
              onClick={onCancelRecording}
              aria-label="Descartar y cancelar grabación"
              className="p-2 rounded-xl bg-surface border border-border hover:border-error hover:bg-error-bg/40 text-text-muted hover:text-error transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Microcopia inferior explicativa */}
          <p className="text-[10px] sm:text-[11px] text-text-muted text-center w-full">
            El audio se capturará y transcribirá automáticamente al presionar detener
          </p>
        </div>
      ) : (
        /* ================= ESTADO INICIAL (LISTO PARA GRABAR) ================= */
        <div className="flex flex-col items-center justify-between h-full w-full text-center">
          <div className="flex flex-col items-center mt-1">
            {/* Ícono de micrófono en rojo */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all mb-3 bg-error-bg text-error border border-error/30 shadow-sm">
              <Mic className="w-5 h-5" aria-hidden="true" />
            </div>

            <h3 className="text-xs sm:text-sm font-semibold text-text-h mb-1">
              Grabar audio de clase
            </h3>
            <p className="text-[11px] sm:text-xs text-text-muted mb-4">
              Captura y transcripción de voz en tiempo real
            </p>

            <button
              type="button"
              onClick={onStartRecording}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error-bg text-error border border-error/30 hover:bg-error-bg/80 active:bg-error-bg/60 text-xs font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error"
            >
              <CircleDot className="w-3 h-3 text-error shrink-0" aria-hidden="true" />
              <span>Iniciar grabación</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 w-full flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span className="w-2 h-2 rounded-full bg-success shrink-0" aria-hidden="true" />
              <span>Listo para grabar desde el micrófono</span>
            </div>
          </div>
        </div>
      )}

      {audioError && (
        <p role="alert" className="text-error text-xs mt-2 w-full text-center">
          {audioError}
        </p>
      )}
    </div>
  )
}
