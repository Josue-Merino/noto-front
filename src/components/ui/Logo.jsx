import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/**
 * Logo de Noto: punto ámbar brillante + texto.
 * @param {object} props
 * @param {string} [props.className] - Clases adicionales.
 * @param {string} [props.to] - Ruta a la que enlaza.
 */
export function Logo({ className, to = '/login' }) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-2 py-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border',
        'transition-opacity hover:opacity-90',
        className
      )}
      aria-label="Noto - Ir al inicio"
    >
      <span
        className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 shadow-[0_0_10px_rgb(242_184_75/0.8)]"
        aria-hidden="true"
      />
      <span className="text-text-h font-semibold text-lg sm:text-xl tracking-tight">Noto</span>
    </Link>
  )
}
