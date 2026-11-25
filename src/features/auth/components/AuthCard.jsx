import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui/Badge'

/**
 * Tarjeta de autenticación con borde superior degradado ámbar, badge, título y subtítulo.
 * @param {object} props
 * @param {string} [props.badgeText] - Texto del badge superior.
 * @param {string} props.title - Título principal de la tarjeta.
 * @param {string} props.subtitle - Subtítulo descriptivo.
 * @param {React.ReactNode} props.children - Formulario de la vista.
 * @param {React.ReactNode} [props.footer] - Enlace alternativo inferior.
 * @param {'md' | 'lg'} [props.maxWidth] - Ancho máximo de la tarjeta.
 * @param {string} [props.className] - Clases adicionales.
 */
export function AuthCard({
  badgeText = 'Espacio de reflexión y notas',
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  className,
}) {
  const maxWidthClass = maxWidth === 'lg' ? 'max-w-lg' : 'max-w-md'

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-2xl',
        'overflow-hidden transition-all duration-200',
        maxWidthClass,
        className
      )}
    >
      {/* Borde superior con degradado ámbar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"
        aria-hidden="true"
      />
      {/* Resplandor sutil superior */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-accent/10 blur-xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Cabecera */}
      <div className="relative z-10 flex flex-col items-start text-left mb-6">
        <Badge>{badgeText}</Badge>
        <h1 className="text-xl sm:text-2xl font-semibold text-text-h mt-3 tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-text mt-1 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Formulario */}
      <div className="relative z-10">{children}</div>

      {/* Pie de la tarjeta */}
      {footer && (
        <div className="relative z-10 mt-6 pt-5 border-t border-border/60 text-center">
          {footer}
        </div>
      )}
    </div>
  )
}
