import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/**
 * Migas de pan. El último elemento es la página actual.
 * @param {{ items: Array<{ label: string, to?: string }> }} props
 */
export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Migas de pan" className="mb-5">
      <ol className="flex items-center gap-2 text-xs sm:text-sm text-text-muted min-w-0">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li className={isLast ? 'text-text-h truncate' : 'shrink-0'} aria-current={isLast ? 'page' : undefined}>
                {item.to && !isLast ? (
                  <Link to={item.to} className="hover:text-text-h transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="shrink-0">
                  <ChevronRight className="w-3.5 h-3.5" />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
