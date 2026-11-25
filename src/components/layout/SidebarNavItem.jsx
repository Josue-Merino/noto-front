import { Link, useLocation } from 'react-router-dom'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'

/**
 * Elemento de navegación para el sidebar, responsivo al modo colapsado.
 * @param {object} props
 * @param {string} props.to - Ruta destino.
 * @param {React.ElementType} props.icon - Componente de ícono Lucide.
 * @param {string} props.title - Texto descriptivo.
 * @param {boolean} [props.collapsed] - Si el sidebar está colapsado.
 * @param {() => void} [props.onClick] - Callback al hacer clic.
 */
export function SidebarNavItem({
  to,
  icon: Icon,
  title,
  collapsed = false,
  onClick,
}) {
  const location = useLocation()
  const isActive = location.pathname === to

  if (collapsed) {
    return (
      <Tooltip content={title} position="right">
        <Link
          to={to}
          onClick={onClick}
          aria-label={title}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150',
            isActive
              ? 'bg-surface-active text-accent border border-accent-border/40 shadow-sm'
              : 'text-accent hover:text-accent-hover hover:bg-surface-hover'
          )}
        >
          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        </Link>
      </Tooltip>
    )
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all duration-150 w-full',
        isActive
          ? 'bg-surface-active text-text-h font-medium shadow-sm'
          : 'text-text hover:text-text-h hover:bg-surface-hover'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 shrink-0 transition-colors',
          isActive ? 'text-accent' : 'text-accent group-hover:text-accent-hover'
        )}
        aria-hidden="true"
      />
      <span className="truncate flex-1 text-left">{title}</span>
    </Link>
  )
}
