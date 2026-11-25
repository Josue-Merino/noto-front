import { Link, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'

/**
 * Tarjeta de usuario con avatar, nombre, plan y enlace directo al Perfil de Usuario.
 *
 * @param {object} props
 * @param {boolean} [props.collapsed] - Si el sidebar se encuentra colapsado.
 * @param {() => void} [props.onItemClick] - Callback para cerrar el drawer en móvil.
 */
export function UserMenuItem({ collapsed = false, onItemClick }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const isActive = location.pathname === '/profile'

  const displayName = user?.firstName
    ? `${user.firstName}${user.firstLastName || user.lastName ? ' ' + (user.firstLastName || user.lastName) : ''}`
    : 'Estudiante Noto'

  const plan = 'Plan Pro'

  const initials = user?.firstName
    ? `${user.firstName[0]}${(user.firstLastName || user.lastName)?.[0] || ''}`.toUpperCase()
    : 'EN'

  if (collapsed) {
    return (
      <Tooltip content={`Perfil: ${displayName} · ${plan}`} position="right">
        <Link
          to="/profile"
          onClick={onItemClick}
          aria-label="Ir al perfil de usuario"
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl select-none transition-all',
            isActive
              ? 'bg-accent-muted border border-accent-border/60 text-accent shadow-sm'
              : 'bg-surface/60 border border-border/60 text-accent hover:bg-surface-hover hover:border-border-light'
          )}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold font-mono text-accent">
              {initials}
            </span>
          )}
        </Link>
      </Tooltip>
    )
  }

  return (
    <Link
      to="/profile"
      onClick={onItemClick}
      aria-label="Ir a la configuración del perfil de usuario"
      className={cn(
        'group flex items-center justify-between gap-3 p-2 rounded-xl transition-all w-full select-none text-left',
        isActive
          ? 'bg-surface border border-accent-border/50 shadow-md'
          : 'bg-surface/40 hover:bg-surface-hover border border-border/60 hover:border-border-light'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-accent-muted border border-accent-border/40 flex items-center justify-center text-accent shrink-0 overflow-hidden shadow-sm">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-bold font-mono text-accent">
              {initials}
            </span>
          )}
        </div>

        <div className="flex flex-col min-w-0 text-left">
          <span className="text-xs font-medium text-text-h truncate group-hover:text-accent transition-colors">
            {displayName}
          </span>
          <span className="text-[11px] text-text-muted leading-tight">
            {plan}
          </span>
        </div>
      </div>

      {/* Ícono de ajustes en el lateral derecho */}
      <div className="p-1 rounded-lg text-text-muted group-hover:text-text-h transition-colors shrink-0">
        <Settings className="w-4 h-4" aria-hidden="true" />
      </div>
    </Link>
  )
}
