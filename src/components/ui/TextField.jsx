import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

/**
 * Campo de texto accesible con soporte para ícono izquierdo, hints opcionales y errores.
 */
export const TextField = forwardRef(function TextField(
  {
    label,
    labelRight,
    optional = false,
    required = false,
    error,
    leftIcon: LeftIcon,
    rightElement,
    id: customId,
    className,
    containerClassName,
    type = 'text',
    disabled,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = customId || generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  return (
    <div className={cn('flex flex-col gap-1.5 w-full text-left', containerClassName)}>
      {(label || labelRight) && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          {label && (
            <label
              htmlFor={inputId}
              className="font-medium text-text-h flex items-center gap-1 cursor-pointer select-none"
            >
              <span>{label}</span>
              {required && (
                <span className="text-accent" aria-hidden="true">
                  *
                </span>
              )}
              {optional && (
                <span id={hintId} className="text-text-muted text-xs font-normal">
                  (opcional)
                </span>
              )}
            </label>
          )}
          {labelRight && <div className="text-xs">{labelRight}</div>}
        </div>
      )}

      <div className="relative flex items-center w-full">
        {LeftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-text-muted">
            <LeftIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : optional ? hintId : undefined}
          className={cn(
            'w-full min-h-[44px] h-11 px-3.5 text-sm rounded-xl transition-colors duration-150',
            'bg-bg-darker text-text-h placeholder:text-text-muted border',
            error
              ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
              : 'border-border hover:border-border-light focus:border-accent-border focus:ring-1 focus:ring-accent-border',
            'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            LeftIcon && 'pl-10',
            rightElement && 'pr-11',
            className
          )}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-2.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-error text-xs mt-0.5">
          {error}
        </p>
      )}
    </div>
  )
})

TextField.displayName = 'TextField'
