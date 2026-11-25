import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

export function AuthLayout() {
  return (
    <div className="relative min-h-dvh w-full flex flex-col justify-between items-center bg-bg text-text px-4 py-6 sm:py-10 selection:bg-accent-muted selection:text-accent">
      {/* Fondo con degradado radial ámbar tenue */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgb(242_184_75/0.07)_0%,transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_40%,rgb(242_184_75/0.03)_0%,transparent_60%)]"
        aria-hidden="true"
      />

      {/* Header centrado con Logo */}
      <header className="relative z-10 w-full flex justify-center py-2">
        <Logo />
      </header>

      {/* Contenido principal centrado */}
      <main className="relative z-10 w-full flex justify-center items-center my-6">
        <Outlet />
      </main>

      {/* Footer inferior */}
      <footer className="relative z-10 w-full max-w-lg text-center text-xs text-text-muted leading-relaxed select-none">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <a href="#privacidad" className="hover:text-text transition-colors">
            Privacidad
          </a>
          <span aria-hidden="true">·</span>
          <a href="#terminos" className="hover:text-text transition-colors">
            Términos
          </a>
          <span aria-hidden="true">·</span>
          <a href="#ayuda" className="hover:text-text transition-colors">
            Ayuda
          </a>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span className="w-full sm:w-auto">
            © 2024 Noto Systems. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  )
}
