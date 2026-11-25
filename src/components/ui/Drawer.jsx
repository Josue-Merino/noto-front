import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Panel lateral tipo Drawer accesible para vistas móviles.
 * @param {object} props
 * @param {boolean} props.isOpen - Si el drawer está visible.
 * @param {() => void} props.onClose - Función para cerrar el drawer.
 * @param {React.ReactNode} props.children - Contenido interior.
 * @param {string} [props.title] - Título accesible para lectores de pantalla.
 */
export function Drawer({
  isOpen,
  onClose,
  children,
  title = 'Menú de navegación',
}) {
  const drawerRef = useRef(null)
  const previousActiveElement = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    previousActiveElement.current = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Tab' && drawerRef.current) {
        // Trampa de foco (focus trap)
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Enfocar el primer elemento interactivo dentro del drawer
    setTimeout(() => {
      if (drawerRef.current) {
        const firstFocusable = drawerRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (firstFocusable) firstFocusable.focus()
      }
    }, 50)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex md:hidden"
    >
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenido del drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'relative w-72 max-w-[85vw] h-full bg-bg-darker border-r border-border shadow-2xl flex flex-col',
          'transform transition-transform duration-200 ease-out translate-x-0'
        )}
      >
        {/* Botón de cierre accesible */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="absolute top-4 right-3 p-1.5 rounded-lg text-text-muted hover:text-text-h hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border transition-colors z-20"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex-1 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
