import { useState, useCallback } from 'react'

/**
 * Hook para alternar la visibilidad de un campo de contraseña.
 * @returns {{ isVisible: boolean, toggle: () => void, type: 'text' | 'password' }}
 */
export function usePasswordVisibility() {
  const [isVisible, setIsVisible] = useState(false)

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev)
  }, [])

  return {
    isVisible,
    toggle,
    type: isVisible ? 'text' : 'password',
  }
}
