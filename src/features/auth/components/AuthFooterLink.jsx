import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/**
 * Enlace inferior alterno para navegar entre login y registro.
 * @param {object} props
 * @param {string} props.prompt - Texto inicial (ej. "¿No tienes una cuenta?").
 * @param {string} props.linkText - Texto del enlace en acento (ej. "Regístrate gratis").
 * @param {string} props.to - Ruta destino.
 * @param {string} [props.className] - Clases adicionales.
 */
export function AuthFooterLink({ prompt, linkText, to, className }) {
  return (
    <p className={cn('text-xs sm:text-sm text-text-muted', className)}>
      <span>{prompt} </span>
      <Link
        to={to}
        className="text-accent font-medium hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border rounded px-1 transition-colors"
      >
        {linkText}
      </Link>
    </p>
  )
}
