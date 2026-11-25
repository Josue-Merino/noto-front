import { ChevronDown } from 'lucide-react'

/**
 * Encabezado de la página de inicio con Pill de versión, título principal y subtítulo.
 */
export function HomeHero() {
  return (
    <section className="flex flex-col items-center text-center max-w-2xl mx-auto mb-6 sm:mb-8 select-none">
      {/* Pill centrada de versión con chevron */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border text-xs text-text shadow-sm mb-4 cursor-default transition-colors hover:border-border-light">
        <span
          className="w-2 h-2 rounded-full bg-accent shrink-0 shadow-[0_0_8px_rgb(242_184_75/0.8)]"
          aria-hidden="true"
        />
        <span className="font-semibold text-text-h">Noto AI v2.4</span>
        <span className="text-text-muted" aria-hidden="true">·</span>
        <span className="text-text-muted">Transformador de Material de Estudio</span>
        <ChevronDown className="w-3 h-3 text-text-muted shrink-0" aria-hidden="true" />
      </div>

      {/* Título principal */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-h tracking-tight leading-tight mb-3">
        ¿Qué vamos a transformar hoy?
      </h1>

      {/* Subtítulo descriptivo */}
      <p className="text-xs sm:text-sm md:text-base text-text max-w-xl leading-relaxed">
        Sube un video, conferencia o graba tu clase para convertirlo en notas estructuradas, fichas mnemotécnicas y esquemas de síntesis.
      </p>
    </section>
  )
}
