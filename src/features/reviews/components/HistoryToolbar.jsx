import { Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Barra de herramientas del historial con buscador, píldoras de filtrado por origen
 * y selector de ordenamiento.
 *
 * @param {object} props
 * @param {string} props.searchQuery - Texto de búsqueda actual.
 * @param {(q: string) => void} props.onSearchChange - Handler de búsqueda.
 * @param {'all' | 'file' | 'recording'} props.activeFilter - Filtro de origen activo.
 * @param {(f: 'all' | 'file' | 'recording') => void} props.onFilterChange - Handler de cambio de filtro.
 * @param {{ all: number, file: number, recording: number }} props.counts - Conteo de elementos.
 * @param {string} props.sortBy - Criterio de ordenamiento.
 * @param {(s: string) => void} props.onSortChange - Handler de orden.
 */
export function HistoryToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="w-full flex flex-col gap-3 mb-6 sm:mb-7">
      {/* Barra principal en desktop / Primera línea en mobile */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
        {/* Buscador con ícono de lupa */}
        <div className="relative flex-1 max-w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <Search className="w-4 h-4" aria-hidden="true" />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título o materia..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-h placeholder:text-text-muted hover:border-border-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border transition-colors shadow-sm"
          />
        </div>

        {/* Píldoras de filtrado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none select-none">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
              activeFilter === 'all'
                ? 'bg-accent text-text-on-accent shadow-sm'
                : 'bg-surface border border-border hover:border-border-light text-text-muted hover:text-text-h'
            )}
          >
            Todos ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('file')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all',
              activeFilter === 'file'
                ? 'bg-accent text-text-on-accent shadow-sm font-semibold'
                : 'bg-surface border border-border hover:border-border-light text-text-muted hover:text-text-h'
            )}
          >
            Archivos multimedia ({counts.file})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('recording')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all',
              activeFilter === 'recording'
                ? 'bg-accent text-text-on-accent shadow-sm font-semibold'
                : 'bg-surface border border-border hover:border-border-light text-text-muted hover:text-text-h'
            )}
          >
            Audios grabados ({counts.recording})
          </button>
        </div>

        {/* Selector de ordenamiento (Desktop y Mobile) */}
        <div className="flex items-center justify-between md:justify-end gap-2 text-xs text-text-muted select-none">
          <span className="md:hidden text-[11px] font-medium text-text-muted">
            Orden de lista:
          </span>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-surface border border-border hover:border-border-light text-xs font-medium text-text-h focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border cursor-pointer transition-colors shadow-sm"
            >
              <option value="recent">Más recientes primero</option>
              <option value="oldest">Más antiguos primero</option>
              <option value="alpha">Por título (A–Z)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
