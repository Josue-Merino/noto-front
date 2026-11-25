import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Badge tipo pill con ícono y texto.
 * @param {object} props
 * @param {React.ElementType} [props.icon] - Componente ícono de Lucide.
 * @param {React.ReactNode} [props.children] - Contenido del badge.
 * @param {string} [props.className] - Clases adicionales.
 */
export function Badge({
  icon: Icon = BookOpen,
  children = 'Espacio de reflexión y notas',
  className,
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
        'bg-accent-muted border border-accent-border text-accent select-none',
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 text-accent" aria-hidden="true" />}
      <span>{children}</span>
    </div>
  )
}
