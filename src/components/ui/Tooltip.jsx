import { useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * Componente Tooltip accesible para botones e iconos colapsados.
 * @param {object} props
 * @param {string} props.content - Texto que se mostrará en el tooltip.
 * @param {'right' | 'top' | 'bottom' | 'left'} [props.position] - Posición del tooltip.
 * @param {React.ReactNode} props.children - Elemento que activa el tooltip.
 * @param {string} [props.className] - Clases adicionales.
 */
export function Tooltip({
  content,
  position = 'right',
  children,
  className,
}) {
  const [isVisible, setIsVisible] = useState(false)

  if (!content) return children

  const positionClasses = {
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  }

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 pointer-events-none whitespace-nowrap',
            'bg-surface border border-border text-text-h text-xs font-medium px-2.5 py-1 rounded-lg shadow-xl',
            'animate-fadeIn duration-150',
            positionClasses[position] || positionClasses.right,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
