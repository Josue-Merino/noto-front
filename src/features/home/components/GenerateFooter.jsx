import { Sparkles, HelpCircle, CheckCircle2, Radio, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * Pie del panel generador con mensaje de estado contextual y botón principal de generación.
 * Permanece deshabilitado mientras se comprime o graba, anunciando cambios con aria-live.
 *
 * @param {object} props
 * @param {boolean} props.hasInput - Si existe un archivo o grabación listo para procesar.
 * @param {boolean} [props.isRecording] - Si hay una grabación de audio en curso o en pausa.
 * @param {boolean} [props.isCompressing] - Si se está comprimiendo/extrayendo audio con ffmpeg.wasm.
 * @param {boolean} [props.isProcessing] - Si se está generando el material con IA.
 * @param {() => void} props.onSubmit - Callback al hacer clic en generar.
 */
export function GenerateFooter({
  hasInput,
  isRecording = false,
  isCompressing = false,
  isProcessing = false,
  onSubmit,
}) {
  const isButtonDisabled = !hasInput || isCompressing || isProcessing

  return (
    <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Mensaje contextual inferior con anuncio accesible */}
      <div
        aria-live="polite"
        className="flex items-center gap-2 text-xs select-none text-center sm:text-left"
      >
        {isCompressing ? (
          <>
            <Loader2 className="w-4 h-4 shrink-0 text-accent animate-spin" aria-hidden="true" />
            <span className="text-accent font-medium">
              Optimizando audio…
            </span>
          </>
        ) : hasInput ? (
          <>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-success" aria-hidden="true" />
            <span className="text-text font-medium">
              Archivo listo • Presiona generar para procesar el material
            </span>
          </>
        ) : isRecording ? (
          <>
            <Radio className="w-4 h-4 shrink-0 text-error animate-pulse" aria-hidden="true" />
            <span className="text-text-muted">
              Grabando audio de clase • Detén la grabación para habilitar la generación
            </span>
          </>
        ) : (
          <>
            <HelpCircle className="w-4 h-4 shrink-0 text-text-muted/80" aria-hidden="true" />
            <span className="text-text-muted">
              Carga un archivo o inicia una grabación para habilitar la generación
            </span>
          </>
        )}
      </div>

      {/* Botón principal de generación */}
      <Button
        type="button"
        variant="primary"
        onClick={onSubmit}
        disabled={isButtonDisabled}
        isLoading={isProcessing}
        loadingText="Generando…"
        leftIcon={Sparkles}
        rightIcon={null}
        className="w-full sm:w-auto font-semibold px-6 py-2.5 shadow-md active:scale-[0.99] transition-transform"
      >
        Generar material de repaso
      </Button>
    </div>
  )
}
