// Marcas inline que genera la IA: **negrita**, `resaltado` y __subrayado__
const INLINE_MARKS_RE = /(\*\*[^*]+\*\*|`[^`]+`|__[^_]+__)/g

/**
 * Renderiza texto con las marcas inline de las notas, sin usar HTML crudo.
 * @param {object} props
 * @param {string} props.text
 */
export function RichText({ text }) {
  const parts = (text || '').split(INLINE_MARKS_RE).filter(Boolean)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-text-h">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <mark key={i} className="px-1 rounded bg-accent-muted text-accent">
          {part.slice(1, -1)}
        </mark>
      )
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return (
        <u key={i} className="decoration-accent underline-offset-2">
          {part.slice(2, -2)}
        </u>
      )
    }
    return <span key={i}>{part}</span>
  })
}
