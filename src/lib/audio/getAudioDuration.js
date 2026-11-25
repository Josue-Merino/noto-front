/**
 * Obtiene la duración en segundos de un archivo de audio o video
 * utilizando un elemento HTML temporal en el navegador.
 * @param {File | Blob} file
 * @returns {Promise<number>} Duración en segundos redondeada
 */
export function getAudioDuration(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve(0)
      return
    }

    const url = URL.createObjectURL(file)
    const isVideo = file.type?.includes('video') || file.name?.match(/\.(mp4|mov|m4v|mkv)$/i)
    const media = document.createElement(isVideo ? 'video' : 'audio')

    media.preload = 'metadata'
    media.src = url

    const cleanup = () => {
      URL.revokeObjectURL(url)
      media.removeAttribute('src')
      media.load()
    }

    media.onloadedmetadata = () => {
      const duration = media.duration
      cleanup()
      if (typeof duration === 'number' && !isNaN(duration) && duration > 0) {
        resolve(Math.round(duration))
      } else {
        resolve(0)
      }
    }

    media.onerror = () => {
      cleanup()
      // Si el navegador no puede decodificar los metadatos directamente,
      // no bloqueamos el flujo y retornamos 0
      resolve(0)
    }

    // Timeout de seguridad en caso de que no dispare eventos
    setTimeout(() => {
      cleanup()
      resolve(0)
    }, 5000)
  })
}
