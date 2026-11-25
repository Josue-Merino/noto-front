import { forwardRef } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * @typedef {'primary' | 'ghost' | 'outline' | 'soft'} ButtonVariant
 * @typedef {'sm' | 'md' | 'lg'} ButtonSize
 */

/**
 * Botón accesible con soporte para estado de carga, iconos y variantes.
 */
export const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText = 'Procesando…',
    rightIcon: RightIcon = ArrowRight,
    leftIcon: LeftIcon = null,
    fullWidth = false,
    disabled = false,
    className,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:
      'bg-accent text-text-on-accent hover:bg-accent-hover active:bg-accent-active shadow-sm',
    ghost:
      'bg-transparent text-text hover:text-text-h hover:bg-surface-hover active:bg-surface-active',
    outline:
      'bg-transparent border border-border text-text-h hover:bg-surface-hover hover:border-border-light active:bg-surface-active',
    soft:
      'bg-accent-muted/40 border border-accent-border text-accent hover:bg-accent-muted active:bg-accent-muted',
  }

  const sizes = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'min-h-[48px] h-12 px-5 text-sm gap-2',
    lg: 'min-h-[48px] h-12 px-6 text-base gap-2.5',
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={cn(
        baseStyles,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" aria-hidden="true" />}
          <span>{children}</span>
          {RightIcon && (
            <RightIcon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          )}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'
