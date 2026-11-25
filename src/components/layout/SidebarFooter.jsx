import { useNavigate } from 'react-router-dom'
import { RotateCcw, LogOut } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { SidebarNavItem } from './SidebarNavItem'
import { UserMenuItem } from './UserMenuItem'
import { ThemeToggle } from './ThemeToggle'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'

/**
 * Pie inferior del sidebar con Historial, Usuario, Modo claro y Cerrar sesión.
 * @param {object} props
 * @param {boolean} props.collapsed - Si la barra lateral está colapsada.
 * @param {() => void} [props.onItemClick] - Callback para cerrar drawer en móvil.
 */
export function SidebarFooter({ collapsed, onItemClick }) {
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  const handleLogout = () => {
    clearSession()
    if (onItemClick) onItemClick()
    navigate('/login', { replace: true })
  }

  if (collapsed) {
    return (
      <div className="mt-auto pt-3 border-t border-border/40 flex flex-col items-center gap-3 w-full pb-1">
        {/* Enlace al Historial */}
        <SidebarNavItem
          to="/history"
          icon={RotateCcw}
          title="Historial de repasos"
          collapsed={true}
          onClick={onItemClick}
        />

        {/* Tarjeta de usuario avatar */}
        <UserMenuItem collapsed={true} onItemClick={onItemClick} />

        {/* Modo claro / oscuro */}
        <ThemeToggle collapsed />

        {/* Botón de cerrar sesión */}
        <Tooltip content="Cerrar sesión" position="right">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-accent hover:text-accent-hover hover:bg-surface-hover transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="mt-auto pt-3 border-t border-border/50 flex flex-col gap-2 w-full">
      {/* Enlace al Historial */}
      <SidebarNavItem
        to="/history"
        icon={RotateCcw}
        title="Historial de repasos"
        collapsed={false}
        onClick={onItemClick}
      />

      {/* Tarjeta de usuario */}
      <div className={cn('w-full', collapsed && 'flex justify-center')}>
        <UserMenuItem collapsed={false} onItemClick={onItemClick} />
      </div>

      {/* Modo claro / oscuro */}
      <ThemeToggle collapsed={false} />

      {/* Botón de cerrar sesión */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-error hover:bg-error-bg/60 transition-colors w-full text-left"
      >
        <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  )
}
