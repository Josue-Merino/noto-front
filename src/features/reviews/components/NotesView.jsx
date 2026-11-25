import { Square } from 'lucide-react'
import { RichText } from './RichText'

const HEADING_STYLES = {
  heading1: 'text-lg sm:text-xl font-bold text-text-h mt-6 mb-2',
  heading2: 'text-base sm:text-lg font-bold text-text-h mt-5 mb-2',
  heading3: 'text-sm sm:text-base font-semibold text-text-h mt-4 mb-1.5',
  heading4: 'text-sm font-semibold text-text mt-3 mb-1',
}

const HEADING_TAGS = { heading1: 'h2', heading2: 'h3', heading3: 'h4', heading4: 'h5' }

const LIST_TYPES = ['bullet_list_item', 'numbered_list_item', 'todo_list_item']

/**
 * Agrupa los ítems de lista consecutivos del mismo tipo para renderizarlos en un solo <ul>/<ol>.
 * @param {Array<{ type: string, text: string, emoji: string | null }>} blocks
 */
function groupBlocks(blocks) {
  const groups = []
  for (const block of blocks) {
    const last = groups[groups.length - 1]
    if (LIST_TYPES.includes(block.type) && last?.listType === block.type) {
      last.items.push(block)
    } else if (LIST_TYPES.includes(block.type)) {
      groups.push({ listType: block.type, items: [block] })
    } else {
      groups.push({ block })
    }
  }
  return groups
}

/**
 * Intenta leer una tabla en formato markdown ("| a | b |"); devuelve null si no lo es.
 * @param {string} text
 * @returns {string[][] | null}
 */
function parseTable(text) {
  const rows = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('|') && !/^\|?\s*:?-{2,}/.test(line))
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
  return rows.length >= 2 ? rows : null
}

function TableBlock({ block }) {
  const rows = parseTable(block.text)
  if (!rows) {
    return <pre className="my-3 p-3 rounded-xl bg-bg-darker border border-border text-xs whitespace-pre-wrap">{block.text}</pre>
  }
  const [header, ...body] = rows
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border">
      {block.emoji && <p className="px-3 pt-2 text-sm">{block.emoji}</p>}
      <table className="w-full text-xs sm:text-sm text-left">
        <thead className="bg-surface-hover text-text-h">
          <tr>
            {header.map((cell, i) => (
              <th key={i} className="px-3 py-2 font-semibold"><RichText text={cell} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r} className="border-t border-border/60">
              {row.map((cell, c) => (
                <td key={c} className="px-3 py-2 text-text"><RichText text={cell} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Block({ block }) {
  if (HEADING_TAGS[block.type]) {
    const Tag = HEADING_TAGS[block.type]
    return (
      <Tag className={HEADING_STYLES[block.type]}>
        {block.emoji && <span className="mr-2" aria-hidden="true">{block.emoji}</span>}
        <RichText text={block.text} />
      </Tag>
    )
  }

  switch (block.type) {
    case 'quote':
      return (
        <blockquote className="my-3 pl-4 border-l-2 border-accent-border text-sm italic text-text">
          <RichText text={block.text} />
        </blockquote>
      )
    case 'callout':
      return (
        <div className="my-3 flex gap-3 p-3.5 rounded-xl bg-accent-muted/60 border border-accent-border/50 text-sm text-text-h">
          {block.emoji && <span aria-hidden="true">{block.emoji}</span>}
          <p><RichText text={block.text} /></p>
        </div>
      )
    case 'code':
      return (
        <pre className="my-3 p-3 rounded-xl bg-bg-darker border border-border text-xs text-text-h overflow-x-auto">
          <code>{block.text}</code>
        </pre>
      )
    case 'table':
      return <TableBlock block={block} />
    default:
      return (
        <p className="my-2 text-sm leading-relaxed text-text">
          <RichText text={block.text} />
        </p>
      )
  }
}

function ListGroup({ listType, items }) {
  if (listType === 'todo_list_item') {
    return (
      <ul className="my-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text">
            <Square className="w-4 h-4 mt-0.5 shrink-0 text-text-muted" aria-hidden="true" />
            <span><RichText text={item.text} /></span>
          </li>
        ))}
      </ul>
    )
  }

  const Tag = listType === 'numbered_list_item' ? 'ol' : 'ul'
  return (
    <Tag className={`my-2 pl-5 space-y-1 text-sm text-text ${Tag === 'ol' ? 'list-decimal' : 'list-disc'} marker:text-accent`}>
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed"><RichText text={item.text} /></li>
      ))}
    </Tag>
  )
}

function ExtraSection({ title, items }) {
  if (!items?.length) return null
  return (
    <section className="mt-6 p-4 rounded-xl bg-bg-darker border border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">{title}</h3>
      <ul className="pl-5 list-disc space-y-1 text-sm text-text marker:text-accent">
        {items.map((item, i) => (
          <li key={i}><RichText text={item} /></li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Vista de las notas generadas: resumen, bloques de contenido y secciones extra.
 * @param {object} props
 * @param {{ summary: string, blocks: Array<object>, actionItems: string[], supportMaterial: string[], homework: string[] }} props.notes
 */
export function NotesView({ notes }) {
  return (
    <article className="text-left">
      {notes.summary && (
        <section className="p-4 rounded-xl bg-accent-muted/40 border border-accent-border/50 mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-1.5">Resumen</h3>
          <p className="text-sm leading-relaxed text-text-h"><RichText text={notes.summary} /></p>
        </section>
      )}

      {groupBlocks(notes.blocks ?? []).map((group, i) =>
        group.listType ? (
          <ListGroup key={i} listType={group.listType} items={group.items} />
        ) : (
          <Block key={i} block={group.block} />
        )
      )}

      <ExtraSection title="Pendientes y acuerdos" items={notes.actionItems} />
      <ExtraSection title="Material de apoyo" items={notes.supportMaterial} />
      <ExtraSection title="Tarea" items={notes.homework} />
    </article>
  )
}
