import { Star } from 'lucide-react'
import { useProfileForm } from '../hooks/useProfileForm'
import { ProfilePhotoCard } from '../components/ProfilePhotoCard'
import { ProfileInfoForm } from '../components/ProfileInfoForm'

/**
 * Página de perfil de usuario de Noto AI.
 * Permite gestionar foto de perfil, datos personales y preferencias de cuenta.
 */
export function ProfilePage() {
  const {
    avatarUrl,
    initials,
    fullName,
    email,
    register,
    errors,
    isSubmitting,
    serverError,
    successMessage,
    photoError,
    handleUploadPhoto,
    handleRemovePhoto,
    handleCancel,
    onSubmit,
  } = useProfileForm()

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn">
      {/* Cabecera superior con Categoría, Título, Subtítulo e Insignias */}
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider select-none">
            Configuración de cuenta
          </span>

          {/* Insignias: Estudiante y Plan Pro */}
          <div className="flex items-center gap-2 select-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-bg text-success border border-success/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
              <span>Estudiante</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-bg text-warning border border-warning/30">
              <Star className="w-3 h-3 fill-current text-warning" aria-hidden="true" />
              <span>Plan Pro</span>
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-h">
          Perfil de usuario
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
          Gestiona tu información personal, foto de perfil y preferencias de tu cuenta en Noto AI.
        </p>
      </header>

      {/* Grid de 2 columnas (1/3 foto, 2/3 información) en desktop y columna única en móvil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna Izquierda: Tarjeta de foto de perfil */}
        <div className="lg:col-span-1 w-full">
          <ProfilePhotoCard
            avatarUrl={avatarUrl}
            initials={initials}
            fullName={fullName}
            onUploadPhoto={handleUploadPhoto}
            onRemovePhoto={handleRemovePhoto}
            photoError={photoError}
          />
        </div>

        {/* Columna Derecha: Tarjeta de información personal */}
        <div className="lg:col-span-2 w-full">
          <ProfileInfoForm
            register={register}
            errors={errors}
            email={email}
            isSubmitting={isSubmitting}
            serverError={serverError}
            successMessage={successMessage}
            onSubmit={onSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}
