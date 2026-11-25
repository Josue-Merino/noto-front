import { useState } from 'react'
import { Mail, Check, AlertCircle } from 'lucide-react'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'

/**
 * Formulario de información personal del usuario, con campos de nombres,
 * apellidos, correo electrónico institucional y acciones de guardado.
 *
 * @param {object} props
 * @param {import('react-hook-form').UseFormRegister<any>} props.register - Hook register.
 * @param {object} props.errors - Errores de validación de campos.
 * @param {string} props.email - Correo electrónico del usuario.
 * @param {boolean} props.isSubmitting - Estado de envío en curso.
 * @param {string | null} props.serverError - Error de persistencia.
 * @param {string | null} props.successMessage - Aviso de éxito.
 * @param {() => void} props.onSubmit - Handler de envío.
 * @param {() => void} props.onCancel - Handler de cancelación.
 */
export function ProfileInfoForm({
  register,
  errors,
  email,
  isSubmitting,
  serverError,
  successMessage,
  onSubmit,
  onCancel,
}) {
  const [showEmailNotice, setShowEmailNotice] = useState(false)

  return (
    <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-surface border border-border shadow-lg text-left w-full">
      <div>
        {/* Cabecera de la tarjeta */}
        <div className="mb-5">
          <h2 className="text-base sm:text-lg font-bold text-text-h">
            Información Personal
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Edita tu información personal y datos de tu cuenta.
          </p>
        </div>

        {/* Mensajes globales de éxito o error */}
        {serverError && (
          <div className="mb-4">
            <FormAlert message={serverError} variant="error" />
          </div>
        )}
        {successMessage && (
          <div className="mb-4">
            <FormAlert message={successMessage} variant="success" />
          </div>
        )}

        {/* Formulario */}
        <form id="profile-form" onSubmit={onSubmit} noValidate className="space-y-4">
          {/* Fila 1: Nombre y Segundo nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="firstName" className="text-xs font-medium text-text-h">
                  Nombre
                </label>
                <span className="text-[10px] text-accent font-medium">Requerido</span>
              </div>
              <TextField
                id="firstName"
                placeholder="Alejandro"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="middleName" className="text-xs font-medium text-text-h">
                  Segundo nombre
                </label>
                <span className="text-[10px] text-text-muted">Opcional</span>
              </div>
              <TextField
                id="middleName"
                placeholder="Segundo nombre (opcional)"
                autoComplete="additional-name"
                error={errors.middleName?.message}
                {...register('middleName')}
              />
            </div>
          </div>

          {/* Fila 2: Primer apellido y Segundo apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="lastName" className="text-xs font-medium text-text-h">
                  Primer apellido
                </label>
                <span className="text-[10px] text-accent font-medium">Requerido</span>
              </div>
              <TextField
                id="lastName"
                placeholder="Pérez"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="secondLastName" className="text-xs font-medium text-text-h">
                  Segundo apellido
                </label>
                <span className="text-[10px] text-text-muted">Opcional</span>
              </div>
              <TextField
                id="secondLastName"
                placeholder="Gómez"
                error={errors.secondLastName?.message}
                {...register('secondLastName')}
              />
            </div>
          </div>

          {/* Fila 3: Correo electrónico */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="email" className="text-xs font-medium text-text-h">
                Correo electrónico
              </label>
              <button
                type="button"
                onClick={() => setShowEmailNotice((prev) => !prev)}
                className="text-xs text-accent hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border"
              >
                Cambiar
              </button>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                disabled
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-text-muted cursor-not-allowed select-none"
              />
            </div>

            {showEmailNotice && (
              <div className="mt-2 p-2.5 rounded-lg bg-surface-hover border border-border text-xs text-text flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>
                  Para cambiar tu dirección de correo electrónico institucional, se enviará un enlace de confirmación a tu nueva dirección.
                </span>
              </div>
            )}

            <p className="text-[11px] text-text-muted mt-1.5 select-none">
              Utilizado para sincronización multimodal, transcripciones y alertas de repasos espaciados.
            </p>
          </div>
        </form>
      </div>

      {/* Botones de acción inferiores */}
      <div className="mt-8 pt-5 border-t border-border/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-text-muted hover:text-text-h transition-colors text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border"
        >
          Cancelar
        </button>

        <Button
          type="submit"
          form="profile-form"
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Guardando…"
          leftIcon={Check}
          rightIcon={null}
          className="w-full sm:w-auto font-semibold px-5 py-2.5 shadow-md active:scale-[0.99] transition-transform"
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
