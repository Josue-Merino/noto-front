/**
 * Tipos de salida que se pueden generar. El `id` es el valor que viaja al backend
 * (`outputType` de POST /generation/create) y el `title` es la etiqueta que se muestra.
 */
export const OUTPUT_TYPE_OPTIONS = Object.freeze([
  {
    id: 'flashcards',
    title: 'Solo Flashcards',
    subtitle: 'Tarjetas de memorización',
  },
  {
    id: 'quiz',
    title: 'Solo Cuestionario',
    subtitle: 'Test de autoevaluación',
  },
  {
    id: 'full',
    title: 'Notas completas',
    subtitle: 'Flashcards + Test + Síntesis',
  },
])

/** Ids válidos de `outputType`, en el mismo orden que las opciones. */
export const OUTPUT_TYPE_IDS = OUTPUT_TYPE_OPTIONS.map((opt) => opt.id)

/**
 * Etiqueta visible de un tipo de salida (si ya es una etiqueta, la devuelve tal cual).
 * @param {string} idOrLabel
 * @returns {string}
 */
export function getOutputTypeLabel(idOrLabel) {
  return OUTPUT_TYPE_OPTIONS.find((opt) => opt.id === idOrLabel)?.title ?? idOrLabel
}
