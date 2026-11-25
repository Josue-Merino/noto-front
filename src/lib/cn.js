import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina condicionalmente nombres de clases y resuelve conflictos de Tailwind.
 * @param  {...any} inputs - Clases a combinar.
 * @returns {string} Clases combinadas resultantes.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
