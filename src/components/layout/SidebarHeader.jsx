import { PanelLeft } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Tooltip } from '@/components/ui/Tooltip'

/**
 * Cabecera del Sidebar con Logo y botón de alternar colapso.
 * @param {object} props
 * @param {boolean} props.collapsed - Si el sidebar se encuentra colapsado.
 * @param {() => void} props.onToggle - Callback para alternar estado.
 * @param {boolean} [props.isMobile] - Si se renderiza dentro del Drawer móvil.
 */
export function SidebarHeader({ collapsed, onToggle, isMobile = false }) {
  if (collapsed && !isMobile) {
    return (
      <div className="h-12 w-full flex items-center justify-center border-b border-border/40">
        <Tooltip content="Expandir barra lateral" position="right">
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expandir barra lateral"
            aria-expanded={false}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-text-h hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border transition-colors"
          >
            <PanelLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="h-12 px-3 flex items-center justify-between border-b border-border/40">
      <Logo to="/" />
      {!isMobile && (
        <Tooltip content="Colapsar barra lateral" position="bottom">
          <button
            type="button"
            onClick={onToggle}
            aria-label="Colapsar barra lateral"
            aria-expanded={true}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-h hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border transition-colors"
          >
            <PanelLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}
