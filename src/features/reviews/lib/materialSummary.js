/** Materiales que se pueden generar, en el orden en que se muestran. */
export const ALL_MATERIALS = ['notes', 'flashcards', 'quiz']

/**
 * Conteos del contenido generado.
 * @param {{ notes?: object | null, flashcards?: object | null, quiz?: object | null } | null} content
 */
export function materialCounts(content) {
  return {
    hasNotes: Boolean(content?.notes),
    flashcards: content?.flashcards?.cards?.length ?? 0,
    questions: content?.quiz?.questions?.length ?? 0,
    sections: (content?.notes?.blocks ?? []).filter((b) => b.type === 'heading1' || b.type === 'heading2').length,
  }
}

/**
 * "1 sección" / "8 secciones".
 * @param {number} n
 */
export const sectionsLabel = (n) => `${n} ${n === 1 ? 'sección' : 'secciones'}`

/**
 * "Apunte + 24 flashcards + cuestionario de 10 preguntas".
 * @param {object | null} content
 */
export function describeMaterial(content) {
  const { hasNotes, flashcards, questions } = materialCounts(content)
  const parts = []
  if (hasNotes) parts.push('Apunte')
  if (flashcards) parts.push(`${flashcards} flashcards`)
  if (questions) parts.push(`cuestionario de ${questions} preguntas`)
  return parts.join(' + ')
}

/**
 * Materiales que todavía no tiene el contenido.
 * @param {object | null} content
 * @returns {string[]}
 */
export function missingMaterials(content) {
  return ALL_MATERIALS.filter((key) => !content?.[key])
}
