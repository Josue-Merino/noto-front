import { useEffect, useState } from 'react'

/**
 * Hora actual que se refresca cada `intervalMs` mientras `enabled` sea verdadero
 * (para estimaciones de progreso que dependen del tiempo transcurrido).
 * @param {boolean} enabled
 * @param {number} [intervalMs]
 */
export function useNow(enabled, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!enabled) return undefined
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [enabled, intervalMs])

  return now
}
