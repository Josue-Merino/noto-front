import { OutputTypeOption } from './OutputTypeOption'
import { OUTPUT_TYPE_OPTIONS } from '../constants/outputTypes'

/**
 * Selector de tipo de salida deseada con 3 opciones radio accesibles.
 * @param {object} props
 * @param {'flashcards' | 'quiz' | 'full'} props.selectedType - Tipo seleccionado actualmente.
 * @param {(type: 'flashcards' | 'quiz' | 'full') => void} props.onTypeChange - Handler de cambio.
 * @param {boolean} [props.disabled] - Si está deshabilitado.
 */
export function OutputTypeSelector({
  selectedType,
  onTypeChange,
  disabled = false,
}) {
  return (
    <div className="w-full mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider select-none">
          Tipo de salida deseada
        </span>
        <span className="text-[11px] text-text-muted select-none">
          Selecciona el formato de estudio
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Tipo de salida deseada"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {OUTPUT_TYPE_OPTIONS.map((opt) => (
          <OutputTypeOption
            key={opt.id}
            id={opt.id}
            title={opt.title}
            subtitle={opt.subtitle}
            isSelected={selectedType === opt.id}
            onSelect={() => onTypeChange(opt.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}
