import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/theme.store'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'

/**
 * Interruptor "Modo claro" del sidebar (como en el Figma). Colapsado, es un botón de ícono.
 * @param {{ collapsed: boolean }} props
 */
export function ThemeToggle({ collapsed }) {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const isLight = theme === 'light'

  if (collapsed) {
    const label = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
    return (
      <Tooltip content={label} position="right">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={label}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-text-h hover:bg-surface-hover transition-colors"
        >
          {isLight ? <Moon className="w-4 h-4" aria-hidden="true" /> : <Sun className="w-4 h-4" aria-hidden="true" />}
        </button>
      </Tooltip>
    )
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      onClick={toggleTheme}
      className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs text-text hover:bg-surface-hover transition-colors w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border"
    >
      <span className="flex items-center gap-2.5">
        <Sun className="w-4 h-4 shrink-0" aria-hidden="true" />
        Modo claro
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'relative w-9 h-5 rounded-full transition-colors shrink-0',
          isLight ? 'bg-accent' : 'bg-surface-active border border-border'
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full transition-all',
            isLight ? 'left-[18px] bg-white' : 'left-[3px] bg-text-muted'
          )}
        />
      </span>
    </button>
  )
}
