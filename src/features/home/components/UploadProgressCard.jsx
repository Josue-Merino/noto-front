import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatBytes } from '@/lib/audio/audioConfig'
import { FileSummary } from './FileSummary'

const VIDEO_EXTENSIONS = ['MP4', 'MOV', 'M4V', 'MKV']

/**
 * Subida del audio al backend con su porcentaje (antes de que empiece la generación).
 * @param {object} props
 * @param {File | null} props.file
 * @param {number} props.progress - 0-100.
 * @param {() => void} props.onCancel
 */
export function UploadProgressCard({ file, progress, onCancel }) {
  const extension = (file?.name.split('.').pop() || '').toUpperCase()
  const isDone = progress >= 100

  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <FileSummary
        name={file?.name ?? 'Audio'}
        extension={extension}
        meta={file ? formatBytes(file.size) : undefined}
        isVideo={VIDEO_EXTENSIONS.includes(extension)}
        progress={progress}
        progressLabel={isDone ? 'Archivo cargado; verificando…' : 'Subiendo archivo…'}
      />
      <p className="text-xs text-text-muted">
        No cierres esta pestaña hasta que termine la subida. Después puedes salir: el procesamiento
        sigue en el servidor.
      </p>
      <div className="flex justify-start">
        <Button variant="ghost" size="sm" leftIcon={X} rightIcon={null} onClick={onCancel} disabled={isDone}>
          Cancelar subida
        </Button>
      </div>
    </div>
  )
}
