import { useRef } from 'react'
import { FileUp, PlusCircle, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { CompressionStatus } from './CompressionStatus'
import { cn } from '@/lib/cn'
import { formatBytes } from '@/lib/audio/audioConfig'

/**
 * Tarjeta para cargar archivos multimedia mediante clic o arrastrar y soltar,
 * integrando estados de compresión previa en el navegador y verificación de archivo.
 *
 * @param {object} props
 * @param {File | null} props.file - Archivo procesado listo para envío.
 * @param {File | null} [props.rawFile] - Archivo original seleccionado.
 * @param {string | null} props.fileError - Mensaje de error de validación.
 * @param {string} [props.fileDuration] - Duración aproximada calculada (ej. "58 min").
 * @param {string} [props.fileExtension] - Extensión (ej. "MP4").
 * @param {string} [props.formattedSize] - Tamaño formateado.
 * @param {object} [props.compressionMeta] - Metadatos de ahorro de compresión.
 * @param {object} [props.compression] - Estado del hook useAudioCompression.
 * @param {boolean} props.isDragging - Arrastre activo sobre la zona.
 * @param {(e: React.DragEvent) => void} props.onDragOver - DragOver.
 * @param {(e: React.DragEvent) => void} props.onDragLeave - DragLeave.
 * @param {(e: React.DragEvent) => void} props.onDrop - Drop.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onFileInputChange - Change del input.
 * @param {() => void} props.onRemoveFile - Callback para eliminar el archivo.
 * @param {boolean} [props.disabled] - Si está deshabilitado / atenuado.
 */
export function UploadDropzone({
  file,
  rawFile,
  fileError,
  fileDuration = '58 min',
  fileExtension = 'MP4',
  formattedSize = '148.5 MB',
  compressionMeta,
  compression,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onRemoveFile,
  disabled = false,
}) {
  const inputRef = useRef(null)

  const isCompressing = compression?.isCompressing
  const hasFileOrProcessing = Boolean(file || rawFile || isCompressing)

  const handleContainerClick = () => {
    if (!disabled && !hasFileOrProcessing && inputRef.current) {
      inputRef.current.click()
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !hasFileOrProcessing) {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const displayFile = file || rawFile

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      role={hasFileOrProcessing ? undefined : 'button'}
      tabIndex={hasFileOrProcessing || disabled ? undefined : 0}
      aria-label="Zona para subir archivo multimedia"
      className={cn(
        'relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl min-h-[220px] transition-all duration-200 select-none text-left',
        hasFileOrProcessing
          ? 'bg-surface border border-border shadow-md'
          : 'bg-bg-darker border-2 border-dashed border-border hover:border-border-light hover:bg-surface/30',
        isDragging && !hasFileOrProcessing && 'border-accent bg-accent-muted/30 shadow-lg',
        disabled && 'opacity-40 pointer-events-none filter grayscale-[20%]',
        !hasFileOrProcessing && !disabled && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav,.mp4,.mov,audio/*,video/*"
        onChange={onFileInputChange}
        disabled={disabled || hasFileOrProcessing}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {hasFileOrProcessing && displayFile ? (
        /* ================= ESTADO: ARCHIVO CARGADO / COMPRIMIÉNDOSE ================= */
        <div className="flex flex-col justify-between h-full w-full gap-2.5">
          {/* Fila superior: Ícono + Nombre + Badge + Tamaño + Botón eliminar */}
          <div className="flex items-start justify-between gap-3 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-accent-muted border border-accent-border/40 flex items-center justify-center text-accent shrink-0 shadow-sm">
                <FileUp className="w-5 h-5" aria-hidden="true" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent text-text-on-accent uppercase tracking-wider shrink-0">
                    {fileExtension}
                  </span>
                  <h3
                    title={displayFile.name}
                    className="text-xs sm:text-sm font-semibold text-text-h truncate max-w-[170px] sm:max-w-[210px]"
                  >
                    {displayFile.name}
                  </h3>
                </div>

                {/* Si hubo compresión, muestra el ahorro de peso */}
                {compressionMeta ? (
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-text-muted">
                    <span>
                      {formatBytes(compressionMeta.originalSize)} → {formatBytes(compressionMeta.compressedSize)}
                    </span>
                    {compressionMeta.savingsPercent > 0 && (
                      <span className="px-1 rounded text-[10px] font-bold bg-success-bg text-success border border-success/30">
                        −{compressionMeta.savingsPercent}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-text-muted mt-0.5">
                    {formattedSize}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveFile()
              }}
              aria-label="Quitar archivo subido"
              className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-bg/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Componente de estado de compresión si está en progreso, error o cargando */}
          {compression && compression.status !== 'idle' && compression.status !== 'done' ? (
            <CompressionStatus
              status={compression.status}
              progress={compression.progress}
              result={compression.result}
              error={compression.error}
              warning={compression.warning}
              onCancel={compression.onCancel}
              onRetry={compression.onRetry}
              onUseOriginal={compression.onUseOriginal}
            />
          ) : (
            /* Fila intermedia: Progreso y estado de verificación al 100% */
            <div className="w-full my-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-success font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Archivo cargado y verificado</span>
                </div>
                <span className="text-success font-semibold">100%</span>
              </div>

              {/* Barra de progreso verde continua */}
              <div className="w-full h-1.5 bg-bg-darker rounded-full overflow-hidden border border-border/30">
                <div
                  className="h-full bg-success rounded-full w-full transition-all duration-300"
                  role="progressbar"
                  aria-valuenow={100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Fila inferior: Duración estimada y Vista previa */}
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-text-muted w-full">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <span>Duración aprox: {fileDuration}</span>
            </div>
            <span className="text-accent hover:underline cursor-pointer transition-colors font-medium">
              Vista previa audio
            </span>
          </div>
        </div>
      ) : (
        /* ================= ESTADO: SUBIR ARCHIVO (INICIAL / VACÍO) ================= */
        <div className="flex flex-col items-center justify-between h-full w-full text-center">
          <div className="flex flex-col items-center mt-1">
            {/* Ícono de archivo en cuadro ámbar */}
            <div className="w-10 h-10 rounded-xl bg-accent-muted border border-accent-border/40 flex items-center justify-center text-accent mb-3 shadow-sm">
              <FileUp className="w-5 h-5" aria-hidden="true" />
            </div>

            <h3 className="text-xs sm:text-sm font-semibold text-text-h mb-1">
              Subir archivo multimedia
            </h3>
            <p className="text-[11px] sm:text-xs text-text-muted mb-4">
              MP3, WAV, MP4 o MOV
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-border-light text-xs font-medium text-text-h shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border"
            >
              <PlusCircle className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>Examinar archivos o arrastrar aquí (MP3, MP4)</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 w-full text-center">
            <span className="text-[10px] sm:text-[11px] text-text-muted">
              Archivos soportados: MP3, WAV, MP4, MOV (Hasta 1.5 GB)
            </span>
          </div>
        </div>
      )}

      {fileError && (
        <p role="alert" className="text-error text-xs mt-2 w-full text-center">
          {fileError}
        </p>
      )}
    </div>
  )
}
