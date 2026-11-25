import { SquarePlay, AudioLines, CodeXml, FileText } from 'lucide-react'
import { useReviewsStore } from '@/features/home/store/reviews.store'
import { SidebarNavItem } from './SidebarNavItem'
import { reviewPath } from '@/features/reviews/mappers/review.mapper'

/**
 * Sección de repasos recientes para el sidebar.
 * @param {object} props
 * @param {boolean} props.collapsed - Si la barra lateral está colapsada.
 * @param {() => void} [props.onItemClick] - Callback al hacer clic en un repaso.
 */
export function SidebarRecents({ collapsed, onItemClick }) {
  const reviews = useReviewsStore((s) => s.reviews)

  const getIcon = (type) => {
    switch (type) {
      case 'video':
        return SquarePlay
      case 'audio':
        return AudioLines
      case 'notes':
        return CodeXml
      default:
        return FileText
    }
  }

  return (
    <div className="flex flex-col gap-1 w-full my-2">
      {!collapsed ? (
        <div className="px-3 py-1.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider select-none">
            Recientes | Repasos
          </span>
        </div>
      ) : (
        <div className="w-8 h-[1px] bg-border/40 mx-auto my-1" aria-hidden="true" />
      )}

      <div className={collapsed ? 'flex flex-col items-center gap-2.5 w-full' : 'flex flex-col gap-1 w-full'}>
        {reviews.length === 0 ? (
          !collapsed && (
            <p className="px-3 py-2 text-xs text-text-muted italic">
              Aún no tienes repasos
            </p>
          )
        ) : (
          reviews.map((rev) => (
            <SidebarNavItem
              key={rev.id}
              to={reviewPath(rev)}
              title={rev.title}
              icon={getIcon(rev.type)}
              collapsed={collapsed}
              onClick={onItemClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
