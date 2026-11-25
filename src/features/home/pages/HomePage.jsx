import { HomeHero } from '../components/HomeHero'
import { GeneratorPanel } from '../components/GeneratorPanel'

/**
 * Página principal de Noto para usuarios autenticados.
 */
export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full my-auto py-4">
      <HomeHero />
      <GeneratorPanel />
    </div>
  )
}
