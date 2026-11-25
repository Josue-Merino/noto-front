import { useRef } from 'react'
import { Camera, Upload, Trash2, Info } from 'lucide-react'

/**
 * Tarjeta de foto de perfil con avatar grande, iniciales, insignia de cámara,
 * carga de archivo de imagen y advertencias de formato.
 *
 * @param {object} props
 * @param {string | null} props.avatarUrl - URL o dataURL de la imagen del avatar.
 * @param {string} props.initials - Iniciales para mostrar si no hay foto.
 * @param {string} props.fullName - Nombre completo del usuario.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onUploadPhoto - Handler al seleccionar foto.
 * @param {() => void} props.onRemovePhoto - Callback para quitar la foto actual.
 * @param {string | null} props.photoError - Error de formato o peso de la foto.
 */
export function ProfilePhotoCard({
  avatarUrl,
  initials,
  fullName,
  onUploadPhoto,
  onRemovePhoto,
  photoError,
}) {
  const fileInputRef = useRef(null)

  return (
    <div className="flex flex-col items-center justify-between p-6 sm:p-7 rounded-2xl bg-surface border border-border text-center shadow-lg w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onUploadPhoto}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="flex flex-col items-center w-full">
        {/* Contenedor del Avatar circular con brillo dorado tenue */}
        <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-accent/40 bg-surface/80 shadow-lg shadow-accent/5 mb-4 group select-none">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Avatar de ${fullName}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl sm:text-3xl font-bold text-accent tracking-wider font-mono">
              {initials}
            </span>
          )}

          {/* Insignia de cámara superpuesta abajo a la derecha */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Cambiar foto de perfil"
            className="absolute bottom-0.5 right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent text-text-on-accent border-2 border-surface flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-transform"
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Nombre completo debajo del avatar */}
        <h2 className="text-base sm:text-lg font-bold text-text-h mb-3 truncate max-w-full">
          {fullName}
        </h2>

        {/* Botón: Subir nueva foto */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border hover:border-border-light hover:bg-surface-hover text-xs font-semibold text-text-h shadow-sm transition-colors w-full sm:w-auto"
        >
          <Upload className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span>Subir nueva foto</span>
        </button>

        {/* Botón: Eliminar foto (solo si hay avatar o foto) */}
        {avatarUrl && (
          <button
            type="button"
            onClick={onRemovePhoto}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-error transition-colors mt-2.5 py-1"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Eliminar foto</span>
          </button>
        )}

        {photoError && (
          <p role="alert" className="text-error text-xs mt-2 w-full text-center">
            {photoError}
          </p>
        )}
      </div>

      {/* Nota informativa de formatos en la parte inferior */}
      <div className="mt-5 pt-4 border-t border-border/40 text-[11px] text-text-muted flex items-start gap-1.5 text-left w-full select-none">
        <Info className="w-3.5 h-3.5 text-accent/80 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          Formatos recomendados: JPG, PNG o WEBP. Tamaño máximo 5MB. Relación de aspecto 1:1.
        </span>
      </div>
    </div>
  )
}
