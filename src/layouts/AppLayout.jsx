import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Drawer } from '@/components/ui/Drawer'
import { useUIStore } from '@/store/ui.store'

/**
 * Layout principal para la aplicación autenticada.
 * Orquesta Sidebar en desktop (expandido/colapsado) y Drawer móvil en pantallas pequeñas.
 */
export function AppLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen)
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar)

  return (
    <div className="min-h-dvh w-full bg-bg text-text flex flex-col md:flex-row relative">
      {/* Cabecera solo para móvil (<768px) */}
      <MobileHeader />

      {/* Drawer accesible para móvil */}
      <Drawer
        isOpen={mobileSidebarOpen}
        onClose={closeMobileSidebar}
        title="Navegación principal"
      >
        <Sidebar
          collapsed={false}
          onToggle={closeMobileSidebar}
          isMobile={true}
          onMobileClose={closeMobileSidebar}
        />
      </Drawer>

      {/* Sidebar fijo para desktop (>=768px) */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0 z-20">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          isMobile={false}
        />
      </div>

      {/* Área principal con scroll interno y sutiles degradados ámbar */}
      <main className="flex-1 min-h-[calc(100dvh-3.5rem)] md:min-h-dvh md:h-screen md:overflow-y-auto relative flex flex-col">
        {/* Fondo con degradado radial ámbar tenue */}
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(242_184_75/0.06)_0%,transparent_60%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgb(242_184_75/0.02)_0%,transparent_70%)]"
          aria-hidden="true"
        />

        {/* Contenido inyectado por las rutas */}
        <div className="relative z-10 flex-1 flex flex-col p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
