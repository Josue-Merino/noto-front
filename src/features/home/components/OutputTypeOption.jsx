import { cn } from '@/lib/cn'

/**
 * Opción individual tipo radio-card para seleccionar el tipo de salida de estudio.
 * @param {object} props
 * @param {string} props.id - Identificador del valor.
 * @param {string} props.title - Título principal de la opción.
 * @param {string} props.subtitle - Descripción corta.
 * @param {boolean} props.isSelected - Si la opción está activa.
 * @param {() => void} props.onSelect - Callback al seleccionar.
 * @param {boolean} [props.disabled] - Si está deshabilitado.
 */
export function OutputTypeOption({
  id,
  title,
  subtitle,
  isSelected,
  onSelect,
  disabled = false,
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none text-left',
        isSelected
          ? 'bg-accent-muted/40 border-accent-border shadow-sm'
          : 'bg-bg-darker border-border hover:border-border-light hover:bg-surface/40',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <input
        type="radio"
        id={id}
        name="outputType"
        value={id}
        checked={isSelected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />

      {/* Indicador de radio visual ámbar */}
      <div
        className={cn(
          'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors',
          isSelected ? 'border-accent bg-accent' : 'border-border bg-transparent'
        )}
        aria-hidden="true"
      >
        {isSelected && (
          <div className="w-1.5 h-1.5 rounded-full bg-text-on-accent" />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <span
          className={cn(
            'text-xs sm:text-sm font-semibold truncate',
            isSelected ? 'text-accent' : 'text-text-h'
          )}
        >
          {title}
        </span>
        <span className="text-[11px] text-text-muted truncate">
          {subtitle}
        </span>
      </div>
    </label>
  )
}
