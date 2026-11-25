import { useState, useRef, useEffect, useCallback } from 'react'
import { MAX_DURATION_SECONDS } from '../schemas/generator.schemas'

const DEFAULT_DEVICE_LABEL = 'Micrófono (MacBook Pro Unidad) (Mono, 48k)'

/**
 * Detecta el mejor formato soportado por el navegador para capturar voz ligera en Opus.
 * Prioridad: audio/webm;codecs=opus -> audio/ogg;codecs=opus -> audio/mp4.
 */
function getBestSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
    return { mimeType: '', extension: 'webm' }
  }

  const formats = [
    { mime: 'audio/webm;codecs=opus', ext: 'webm' },
    { mime: 'audio/ogg;codecs=opus', ext: 'ogg' },
    { mime: 'audio/mp4', ext: 'mp4' },
    { mime: 'audio/webm', ext: 'webm' },
  ]

  for (const fmt of formats) {
    if (MediaRecorder.isTypeSupported(fmt.mime)) {
      return { mimeType: fmt.mime, extension: fmt.ext }
    }
  }

  return { mimeType: '', extension: 'webm' }
}

/**
 * Hook para grabar audio desde el micrófono configurado específicamente para voz ligera:
 * mono, 16 kHz, supresión de ruido y eco, 32 kbps de bitrate Opus.
 * La grabación ya sale comprimida y ligera directamente del navegador.
 *
 * @param {object} options
 * @param {(file: File | null, durationSec?: number) => void} options.onAudioRecorded - Callback cuando se finaliza la grabación (con su duración en segundos).
 */
export function useAudioRecorder({ onAudioRecorded }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordedFile, setRecordedFile] = useState(null)
  const [audioError, setAudioError] = useState(null)
  // El navegador negó el micrófono: el panel muestra la tarjeta de permisos (pantalla Home 15)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [deviceLabel, setDeviceLabel] = useState(DEFAULT_DEVICE_LABEL)
  const [waveBars, setWaveBars] = useState(() =>
    [25, 40, 65, 30, 85, 55, 75, 45, 90, 60, 80, 50, 95, 70, 85, 40, 65, 50, 75, 35, 60, 45, 80, 30, 50, 35, 45, 20]
  )

  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const waveAnimRef = useRef(null)
  const chunksRef = useRef([])
  const activeExtRef = useRef('webm')
  // Duración vigente para entregarla junto al archivo (los callbacks de MediaRecorder la verían vieja)
  const secondsRef = useRef(0)

  useEffect(() => {
    secondsRef.current = recordingSeconds
  }, [recordingSeconds])

  // Detener y procesar audio
  const stopRecording = useCallback(() => {
    setIsTranscribing(true)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // Fallback si ya estaba detenido
      }
    } else {
      // Mock / fallback de desarrollo si no había stream físico real
      setTimeout(() => {
        const dummyBlob = new Blob(['mock audio content'], { type: 'audio/webm' })
        const file = new File([dummyBlob], 'Audio_Clase_Grabada.webm', {
          type: 'audio/webm',
        })
        setRecordedFile(file)
        if (onAudioRecorded) onAudioRecorded(file, secondsRef.current)
        setIsRecording(false)
        setIsPaused(false)
        setIsTranscribing(false)
      }, 500)
    }
  }, [onAudioRecorded])

  // Pausar grabación
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
    }
    setIsPaused(true)
  }, [])

  // Reanudar grabación
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
    }
    setIsPaused(false)
  }, [])

  // Cancelar y descartar grabación
  const cancelRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (waveAnimRef.current) clearInterval(waveAnimRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // Noop
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsRecording(false)
    setIsPaused(false)
    setIsTranscribing(false)
    setRecordingSeconds(0)
    setRecordedFile(null)
    setAudioError(null)
    chunksRef.current = []
    if (onAudioRecorded) onAudioRecorded(null)
  }, [onAudioRecorded])

  // Detener pistas de audio al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (waveAnimRef.current) clearInterval(waveAnimRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Cronómetro con límite estricto de 2 horas
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= MAX_DURATION_SECONDS) {
            stopRecording()
            setAudioError('La grabación se detuvo al alcanzar el límite máximo de 2 horas.')
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording, isPaused, stopRecording])

  // Animación suave de ecualizador
  useEffect(() => {
    if (isRecording && !isPaused) {
      waveAnimRef.current = setInterval(() => {
        setWaveBars((prev) =>
          prev.map(() => Math.floor(Math.random() * 75) + 20)
        )
      }, 140)
    } else {
      if (waveAnimRef.current) clearInterval(waveAnimRef.current)
    }
    return () => {
      if (waveAnimRef.current) clearInterval(waveAnimRef.current)
    }
  }, [isRecording, isPaused])

  const startRecording = useCallback(async () => {
    setAudioError(null)
    setPermissionDenied(false)
    setRecordedFile(null)
    chunksRef.current = []

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback interactivo si el entorno no cuenta con soporte directo
        setIsRecording(true)
        setIsPaused(false)
        setRecordingSeconds(0)
        return
      }

      // Constraints optimizadas para voz: mono, 16 kHz, cancelación de eco y ruido
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      const track = stream.getAudioTracks()[0]
      if (track?.label) {
        setDeviceLabel(track.label)
      } else {
        setDeviceLabel(DEFAULT_DEVICE_LABEL)
      }

      const { mimeType, extension } = getBestSupportedMimeType()
      activeExtRef.current = extension

      // MediaRecorder configurado a 32 kbps de bitrate de audio
      const recorderOptions = {
        audioBitsPerSecond: 32000,
      }
      if (mimeType) {
        recorderOptions.mimeType = mimeType
      }

      const recorder = new MediaRecorder(stream, recorderOptions)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const finalMime = mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: finalMime })
        const now = new Date()
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
        const file = new File([blob], `grabacion-${timestamp}.${activeExtRef.current}`, {
          type: finalMime,
        })

        setRecordedFile(file)
        if (onAudioRecorded) onAudioRecorded(file, secondsRef.current)

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
        setIsRecording(false)
        setIsPaused(false)
        setIsTranscribing(false)
      }

      mediaRecorderRef.current = recorder
      recorder.start(1000)
      setRecordingSeconds(0)
      setIsRecording(true)
      setIsPaused(false)
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true)
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setIsRecording(true)
        setIsPaused(false)
        setRecordingSeconds(0)
      } else {
        setIsRecording(true)
        setIsPaused(false)
        setRecordingSeconds(0)
      }
    }
  }, [onAudioRecorded])

  const dismissPermissionError = useCallback(() => setPermissionDenied(false), [])

  const resetRecording = useCallback(() => {
    cancelRecording()
  }, [cancelRecording])

  const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0')
  const secs = String(recordingSeconds % 60).padStart(2, '0')
  const formattedTime = `${mins}:${secs}`

  return {
    isRecording,
    isPaused,
    isTranscribing,
    recordingSeconds,
    formattedTime,
    recordedFile,
    audioError,
    permissionDenied,
    dismissPermissionError,
    deviceLabel,
    waveBars,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  }
}
