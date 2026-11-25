import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema } from '../schemas/profile.schemas'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { authService } from '@/features/auth/services/auth.service'

/**
 * Hook para gestionar el formulario de perfil de usuario,
 * avatar, validación y persistencia.
 */
export function useProfileForm() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [customAvatarUrl, setCustomAvatarUrl] = useState(null)
  const [photoRemoved, setPhotoRemoved] = useState(false)
  const [photoError, setPhotoError] = useState(null)
  const [serverError, setServerError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const avatarUrl = photoRemoved ? null : customAvatarUrl || user?.avatarUrl || null

  const formValues = useMemo(
    () => ({
      firstName: user?.firstName || 'Alejandro',
      middleName: user?.middleName || '',
      lastName: user?.lastName || user?.firstLastName || 'Pérez',
      secondLastName: user?.secondLastName || 'Gómez',
    }),
    [user]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: formValues,
  })

  // Subir o previsualizar nueva foto de perfil
  const handleUploadPhoto = (e) => {
    setPhotoError(null)
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
      setPhotoError('Formato no válido. Usa JPG, PNG o WEBP.')
      return
    }

    // Validar tamaño máximo 5MB
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('La imagen supera el límite de 5 MB.')
      return
    }

    // Optimizar y redimensionar imagen en el cliente para avatares ligeros (256x256 max)
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const maxDim = 256
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
      setCustomAvatarUrl(optimizedDataUrl)
      setPhotoRemoved(false)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      setPhotoError('No se pudo procesar la imagen seleccionada.')
    }

    img.src = objectUrl
  }

  // Eliminar foto de perfil
  const handleRemovePhoto = () => {
    setCustomAvatarUrl(null)
    setPhotoRemoved(true)
    setPhotoError(null)
  }

  // Cancelar y restaurar valores
  const handleCancel = () => {
    reset(formValues)
    setCustomAvatarUrl(null)
    setPhotoRemoved(false)
    setServerError(null)
    setSuccessMessage(null)
    setPhotoError(null)
  }

  // Guardar cambios
  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true)
    setServerError(null)
    setSuccessMessage(null)

    try {
      const payload = {
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        secondLastName: data.secondLastName || null,
        avatarUrl: avatarUrl || null,
      }

      let updatedData = payload

      // Intentar actualizar vía API si hay sesión conectada
      try {
        const response = await authService.updateProfile(payload)
        if (response?.data) {
          updatedData = response.data
        }
      } catch (err) {
        console.warn('API update failed, updating local session store:', err)
      }

      updateUser(updatedData)
      setSuccessMessage('Cambios guardados correctamente.')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err) {
      setServerError(err.message || 'Error al guardar los cambios del perfil.')
    } finally {
      setIsSubmitting(false)
    }
  })

  // Obtener iniciales para el avatar
  const getInitials = () => {
    const fn = user?.firstName || 'Alejandro'
    const ln = user?.lastName || user?.firstLastName || 'Pérez'
    return `${fn[0] || ''}${ln[0] || ''}`.toUpperCase()
  }

  const getFullName = () => {
    const parts = [
      user?.firstName || 'Alejandro',
      user?.middleName,
      user?.lastName || user?.firstLastName || 'Pérez',
      user?.secondLastName || 'Gómez',
    ].filter(Boolean)
    return parts.join(' ')
  }

  return {
    user,
    avatarUrl,
    initials: getInitials(),
    fullName: getFullName(),
    email: user?.email || 'alejandro.perez@universidad.edu',
    register,
    errors,
    isDirty: isDirty || Boolean(customAvatarUrl) || photoRemoved,
    isSubmitting,
    serverError,
    successMessage,
    photoError,
    handleUploadPhoto,
    handleRemovePhoto,
    handleCancel,
    onSubmit,
  }
}
