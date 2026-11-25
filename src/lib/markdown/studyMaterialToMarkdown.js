/**
 * Convierte el material de estudio generado a Markdown (compatible con Obsidian y otros editores).
 * Las notas vienen como bloques tipo Notion (`heading1`, `bullet_list_item`, `callout`…), y las
 * flashcards y el cuestionario como listas.
 */

const HEADING_LEVEL = { heading1: 2, heading2: 3, heading3: 4, heading4: 5 }
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * @param {{ type: string, text?: string, emoji?: string | null }} block
 * @param {number} index - Posición dentro de una lista numerada.
 * @returns {string}
 */
function blockToMarkdown(block, index) {
  const text = block.text ?? ''
  const emoji = block.emoji ? `${block.emoji} ` : ''

  if (HEADING_LEVEL[block.type]) return `${'#'.repeat(HEADING_LEVEL[block.type])} ${emoji}${text}`

  switch (block.type) {
    case 'bullet_list_item':
      return `- ${text}`
    case 'numbered_list_item':
      return `${index}. ${text}`
    case 'todo_list_item':
      return `- [ ] ${text}`
    case 'quote':
      return text.split('\n').map((line) => `> ${line}`).join('\n')
    case 'callout':
      return `> [!note] ${emoji}\n${text.split('\n').map((line) => `> ${line}`).join('\n')}`
    case 'code':
      return `\`\`\`\n${text}\n\`\`\``
    case 'divider':
      return '---'
    default:
      // paragraph, table (ya viene en formato markdown) y cualquier otro tipo de texto
      return `${emoji}${text}`
  }
}

const LIST_TYPES = ['bullet_list_item', 'numbered_list_item', 'todo_list_item']

/**
 * @param {Array<object>} blocks
 * @returns {string}
 */
function blocksToMarkdown(blocks) {
  const out = []
  let numbered = 0
  blocks.forEach((block, i) => {
    numbered = block.type === 'numbered_list_item' ? numbered + 1 : 0
    const line = blockToMarkdown(block, numbered)
    const previous = blocks[i - 1]
    // Los ítems consecutivos de una misma lista van sin línea en blanco entre ellos
    const sameList = previous && LIST_TYPES.includes(block.type) && previous.type === block.type
    out.push(sameList ? `\n${line}` : `${out.length ? '\n\n' : ''}${line}`)
  })
  return out.join('')
}

/**
 * @param {string} title
 * @param {string[] | undefined} items
 */
function listSection(title, items) {
  if (!items?.length) return ''
  return `### ${title}\n\n${items.map((item) => `- ${item}`).join('\n')}`
}

/**
 * @param {object} params
 * @param {string} params.title
 * @param {{ notes?: object | null, flashcards?: object | null, quiz?: object | null }} params.content
 * @param {string} [params.sourceName] - Archivo de origen.
 * @param {string} [params.date] - Fecha ISO de creación.
 * @returns {string}
 */
export function studyMaterialToMarkdown({ title, content, sourceName, date }) {
  const sections = [`# ${title}`]

  const meta = []
  if (sourceName) meta.push(`Generado desde ${sourceName}`)
  if (date) meta.push(new Date(date).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }))
  if (meta.length) sections.push(`_${meta.join(' · ')}_`)

  const notes = content?.notes
  if (notes) {
    const parts = ['## Apunte']
    if (notes.summary) parts.push(`> ${notes.summary}`)
    if (notes.blocks?.length) parts.push(blocksToMarkdown(notes.blocks))
    for (const extra of [
      listSection('Pendientes y acuerdos', notes.actionItems),
      listSection('Material de apoyo', notes.supportMaterial),
      listSection('Tarea', notes.homework),
    ]) {
      if (extra) parts.push(extra)
    }
    sections.push(parts.join('\n\n'))
  }

  const cards = content?.flashcards?.cards
  if (cards?.length) {
    sections.push(
      [
        `## Flashcards (${cards.length})`,
        ...cards.map((card, i) => `**${i + 1}. ${card.front}**\n\n${card.back}`),
      ].join('\n\n')
    )
  }

  const questions = content?.quiz?.questions
  if (questions?.length) {
    sections.push(
      [
        `## Cuestionario (${questions.length})`,
        ...questions.map((q, i) => {
          const options = q.options.map((option, j) => `- ${LETTERS[j] ?? j + 1}) ${option}`).join('\n')
          const answer = `${LETTERS[q.correctOptionIndex] ?? q.correctOptionIndex + 1}) ${q.options[q.correctOptionIndex] ?? ''}`
          const explanation = q.explanation ? ` — ${q.explanation}` : ''
          return `**${i + 1}. ${q.question}**\n\n${options}\n\n> Respuesta: ${answer}${explanation}`
        }),
      ].join('\n\n')
    )
  }

  return `${sections.join('\n\n')}\n`
}

/**
 * Nombre de archivo seguro a partir del título.
 * @param {string} title
 */
export function markdownFileName(title) {
  const base = (title || 'apunte')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
  return `${base || 'apunte'}.md`
}

/**
 * Descarga el material como archivo .md.
 * @param {Parameters<typeof studyMaterialToMarkdown>[0]} params
 */
export function downloadStudyMaterialMarkdown(params) {
  const blob = new Blob([studyMaterialToMarkdown(params)], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = markdownFileName(params.title)
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
