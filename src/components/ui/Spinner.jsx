import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Componente Spinner de carga accesible.
 * @param {object} props
 * @param {'sm' | 'md' | 'lg'} [props.size] - Tamaño del spinner.
 * @param {string} [props.className] - Clases adicionales.
 */
export function Spinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }

  return (
    <Loader2
      className={cn('animate-spin text-accent shrink-0', sizeClasses[size] || sizeClasses.md, className)}
      aria-hidden="true"
    />
  )
}
