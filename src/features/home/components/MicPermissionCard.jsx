import { MicOff, RotateCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * El navegador negó el acceso al micrófono (pantalla Home 15).
 * @param {object} props
 * @param {() => void} props.onRetry - Vuelve a pedir el permiso.
 * @param {() => void} props.onUploadFile - Abre el selector de archivos.
 */
export function MicPermissionCard({ onRetry, onUploadFile }) {
  return (
    <div role="alert" className="rounded-2xl border border-error/40 bg-error-bg/40 p-4 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border bg-error-bg text-error border-error/30">
          <MicOff className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm sm:text-base font-semibold text-text-h">Noto no tiene acceso al micrófono</p>
          <p className="mt-1 text-xs sm:text-sm text-text">Para grabar tu clase necesitamos permiso del navegador.</p>
        </div>
      </div>

      <ol className="mt-4 flex flex-col gap-2 text-sm text-text list-decimal list-inside">
        <li>Haz clic en el candado junto a la dirección del sitio.</li>
        <li>En «Micrófono», elige «Permitir».</li>
        <li>Vuelve a esta pestaña y presiona «Reintentar».</li>
      </ol>

      <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
        <Button variant="ghost" size="sm" leftIcon={Upload} rightIcon={null} onClick={onUploadFile}>
          Subir un archivo
        </Button>
        <Button size="sm" leftIcon={RotateCw} rightIcon={null} onClick={onRetry} className="px-5">
          Reintentar
        </Button>
      </div>
    </div>
  )
}
