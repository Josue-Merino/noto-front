import { Menu } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useUIStore } from '@/store/ui.store'

/**
 * Cabecera móvil con botón hamburguesa y Logo centrado.
 */
export function MobileHeader() {
  const openMobileSidebar = useUIStore((s) => s.openMobileSidebar)

  return (
    <header className="md:hidden sticky top-0 z-30 h-14 w-full bg-bg-darker/95 backdrop-blur border-b border-border px-4 flex items-center justify-between select-none">
      <button
        type="button"
        onClick={openMobileSidebar}
        aria-label="Abrir menú de navegación"
        className="p-2 -ml-2 rounded-xl text-text-muted hover:text-text-h hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border transition-colors"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      <Logo to="/" />

      {/* Elemento fantasma para mantener centrado el logo */}
      <div className="w-9" aria-hidden="true" />
    </header>
  )
}
