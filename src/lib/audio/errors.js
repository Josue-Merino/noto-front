/**
 * El audio dura más de lo permitido (regla RN4: 2 horas). Lleva la duración detectada para la UI.
 */
export class AudioTooLongError extends Error {
  /**
   * @param {number} durationSec
   * @param {number} maxDurationSec
   */
  constructor(durationSec, maxDurationSec) {
    super(
      `La duración del audio (${Math.round(durationSec / 60)} min) excede el límite máximo permitido de ${Math.round(maxDurationSec / 60)} minutos.`
    )
    this.name = 'AudioTooLongError'
    this.code = 'AUDIO_TOO_LONG'
    this.durationSec = durationSec
    this.maxDurationSec = maxDurationSec
  }
}
