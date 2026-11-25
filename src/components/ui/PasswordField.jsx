import { forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { TextField } from './TextField'
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility'
import { cn } from '@/lib/cn'

/**
 * Campo de contraseña con botón accesible para mostrar/ocultar.
 */
export const PasswordField = forwardRef(function PasswordField(
  {
    error,
    placeholder = '••••••••',
    autoComplete = 'current-password',
    className,
    ...props
  },
  ref
) {
  const { isVisible, toggle, type } = usePasswordVisibility()

  return (
    <TextField
      ref={ref}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      error={error}
      className={className}
      rightElement={
        <button
          type="button"
          onClick={toggle}
          aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={isVisible}
          className={cn(
            'p-1.5 rounded-lg text-text-muted hover:text-text-h',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border',
            'transition-colors'
          )}
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
        </button>
      }
      {...props}
    />
  )
})

PasswordField.displayName = 'PasswordField'
