/**
 * Cargador perezoso y singleton reutilizable de ffmpeg.wasm.
 * Se descarga solo la primera vez que se necesita comprimir un archivo
 * y utiliza los archivos del núcleo autoalojados en /ffmpeg/.
 */

let ffmpegInstance = null
let loadPromise = null

/**
 * Obtiene la instancia activa de FFmpeg o la inicializa si no existe.
 * @param {object} [options]
 * @param {(progress: { progress: number, time: number }) => void} [options.onProgress]
 * @param {(message: { type: string, message: string }) => void} [options.onLog]
 * @returns {Promise<import('@ffmpeg/ffmpeg').FFmpeg>}
 */
export async function getFFmpeg(options = {}) {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    if (options.onProgress) {
      ffmpegInstance.on('progress', options.onProgress)
    }
    return ffmpegInstance
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = (async () => {
    // Importación diferida para no penalizar el bundle inicial
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
      import('@ffmpeg/ffmpeg'),
      import('@ffmpeg/util'),
    ])

    const instance = new FFmpeg()

    if (options.onProgress) {
      instance.on('progress', options.onProgress)
    }
    if (options.onLog) {
      instance.on('log', options.onLog)
    }

    // Rutas absolutas a los archivos del núcleo autoalojados en public/ffmpeg/
    const baseURL = window.location.origin + '/ffmpeg'
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')

    await instance.load({
      coreURL,
      wasmURL,
    })

    ffmpegInstance = instance
    return instance
  })()

  try {
    const result = await loadPromise
    return result
  } catch (err) {
    ffmpegInstance = null
    loadPromise = null
    throw err
  } finally {
    loadPromise = null
  }
}

/**
 * Termina el worker de FFmpeg y libera memoria.
 */
export function terminateFFmpeg() {
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate()
    } catch {
      // Ignorar errores al terminar
    }
    ffmpegInstance = null
    loadPromise = null
  }
}

/**
 * Indica si el motor de FFmpeg ya se encuentra cargado en memoria.
 * @returns {boolean}
 */
export function isFFmpegLoaded() {
  return Boolean(ffmpegInstance && ffmpegInstance.loaded)
}
