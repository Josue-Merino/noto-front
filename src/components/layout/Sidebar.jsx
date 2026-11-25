import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { SidebarHeader } from './SidebarHeader'
import { SidebarRecents } from './SidebarRecents'
import { SidebarFooter } from './SidebarFooter'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'

/**
 * Contenedor del Sidebar completo: expandido, colapsado y versión drawer móvil.
 * @param {object} props
 * @param {boolean} props.collapsed - Si está en estado colapsado (rail de íconos).
 * @param {() => void} props.onToggle - Alternar colapso en desktop.
 * @param {boolean} [props.isMobile] - Si se renderiza dentro del Drawer móvil.
 * @param {() => void} [props.onMobileClose] - Cerrar drawer móvil al hacer clic.
 */
export function Sidebar({
  collapsed,
  onToggle,
  isMobile = false,
  onMobileClose,
}) {
  const isRail = collapsed && !isMobile

  return (
    <aside
      aria-label="Barra lateral principal"
      className={cn(
        'h-full flex flex-col bg-bg-darker border-r border-border transition-[width] duration-200 ease-in-out select-none',
        isRail ? 'w-16 items-center px-0 py-2.5' : 'w-64 p-3',
        isMobile && 'w-full'
      )}
    >
      {/* Cabecera */}
      <SidebarHeader
        collapsed={isRail}
        onToggle={onToggle}
        isMobile={isMobile}
      />

      {/* Botón "+ Nuevo repaso" */}
      <div className={cn('my-3 w-full', isRail ? 'flex justify-center' : '')}>
        {isRail ? (
          <Tooltip content="Nuevo repaso" position="right">
            <Link
              to="/"
              onClick={onMobileClose}
              aria-label="Nuevo repaso"
              className="w-10 h-10 rounded-xl bg-accent text-text-on-accent hover:bg-accent-hover active:bg-accent-active flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
            >
              <Plus className="w-5 h-5 font-bold stroke-[2.5]" aria-hidden="true" />
            </Link>
          </Tooltip>
        ) : (
          <Link
            to="/"
            onClick={onMobileClose}
            className="flex items-center justify-center gap-2 w-full h-11 px-4 rounded-xl bg-accent text-text-on-accent hover:bg-accent-hover active:bg-accent-active text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 font-bold stroke-[2.5]" aria-hidden="true" />
            <span>Nuevo repaso</span>
          </Link>
        )}
      </div>

      {/* Sección central con scroll para repasos recientes */}
      <div className={cn('flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar', isRail ? 'px-0' : 'pr-0.5')}>
        <SidebarRecents
          collapsed={isRail}
          onItemClick={isMobile ? onMobileClose : undefined}
        />
      </div>

      {/* Pie inferior con Historial, Usuario y Cerrar sesión */}
      <SidebarFooter
        collapsed={isRail}
        onItemClick={isMobile ? onMobileClose : undefined}
      />
    </aside>
  )
}
