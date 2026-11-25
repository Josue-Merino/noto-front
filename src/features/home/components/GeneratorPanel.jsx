import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFileUpload } from '../hooks/useFileUpload'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useGenerateMaterial } from '../hooks/useGenerateMaterial'
import { UploadDropzone } from './UploadDropzone'
import { RecorderCard } from './RecorderCard'
import { OutputTypeSelector } from './OutputTypeSelector'
import { GenerateFooter } from './GenerateFooter'
import { UploadProgressCard } from './UploadProgressCard'
import { GenerationProgressCard } from './GenerationProgressCard'
import { GenerationErrorCard } from './GenerationErrorCard'
import { DurationLimitCard } from './DurationLimitCard'
import { MicPermissionCard } from './MicPermissionCard'
import { FormAlert } from '@/components/ui/FormAlert'

const ACCEPTED_FILES = '.mp3,.wav,.mp4,.mov,audio/*,video/*'

/**
 * Panel generador del Home. Según el estado del trabajo muestra:
 * - `idle`: formulario (subir archivo / grabar + tipo de salida), con las tarjetas de
 *   "audio de más de 2 horas" (Home 14) y "micrófono sin permiso" (Home 15) cuando aplican.
 * - `uploading`: subida del audio con porcentaje.
 * - `processing`: pasos de la generación (Home 06-09).
 * - `failed`: error con reintento (Home 13).
 */
export function GeneratorPanel() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const generation = useGenerateMaterial()
  const {
    view,
    activeJob,
    uploadProgress,
    currentOutputType,
    currentFile,
    setOutputType,
    setFile,
    onSubmit,
    isProcessing,
    serverError,
    actionError,
    pendingAction,
    errors,
  } = generation

  // Manejo de archivo subido con compresión integrada
  const upload = useFileUpload({
    onFileSelected: (f, meta) => {
      if (f) {
        // Exclusión mutua: si sube archivo, se cancela la grabación activa
        recorder.cancelRecording()
      }
      setFile(f, meta ? { ...meta, originType: 'file' } : meta)
    },
  })

  // Manejo de grabación de audio ligera
  const recorder = useAudioRecorder({
    onAudioRecorded: (f, durationSec) => {
      if (f) {
        // Exclusión mutua: si graba audio, se quita el archivo subido previo
        upload.removeFile()
      }
      setFile(f, {
        originalName: f?.name || 'grabacion.webm',
        originalSize: f?.size || 0,
        compressedSize: f?.size || 0,
        savingsPercent: 0,
        originType: 'recording',
        durationSec: durationSec || undefined,
      })
    },
  })

  const handleRemoveCurrentFile = () => {
    upload.removeFile()
    recorder.resetRecording()
    setFile(null)
  }

  /** Abre el selector de archivos (desde las tarjetas de límite y de permisos). */
  const openFilePicker = () => {
    recorder.dismissPermissionError()
    fileInputRef.current?.click()
  }

  const handlePickedFile = (e) => {
    upload.handleFileInputChange(e)
    // Permite volver a elegir el mismo archivo
    e.target.value = ''
  }

  const isRecordingActive = recorder.isRecording || recorder.isPaused
  const isCompressing = upload.compression.isCompressing || upload.compression.isLoadingEngine
  const isFileSelected = Boolean(upload.file || upload.rawFile || (currentFile && !isRecordingActive))

  return (
    <section
      aria-label="Panel de generación de material con IA"
      className="relative w-full max-w-3xl mx-auto rounded-2xl bg-surface/60 border border-border p-4 sm:p-7 md:p-8 shadow-2xl backdrop-blur-sm"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILES}
        onChange={handlePickedFile}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {view === 'uploading' && (
        <UploadProgressCard file={currentFile} progress={uploadProgress} onCancel={generation.cancelUpload} />
      )}

      {view === 'processing' && activeJob && (
        <GenerationProgressCard
          job={activeJob}
          onCancel={pendingAction ? undefined : generation.cancelJob}
          onViewResult={() => navigate(`/generation/${activeJob.id}`)}
          actionError={actionError}
        />
      )}

      {view === 'failed' && activeJob && (
        <GenerationErrorCard
          job={activeJob}
          onRetry={generation.retryJob}
          onDismiss={generation.dismissJob}
          isRetrying={pendingAction === 'retry'}
          actionError={actionError}
        />
      )}

      {view === 'idle' && (
        <>
          {serverError && (
            <div className="mb-4">
              <FormAlert message={serverError} variant="error" />
            </div>
          )}

          {errors.file && !serverError && (
            <div className="mb-4">
              <FormAlert message={errors.file.message} variant="error" />
            </div>
          )}

          {upload.durationLimit ? (
            <DurationLimitCard
              limit={upload.durationLimit}
              onChooseAnother={openFilePicker}
              onDismiss={upload.removeFile}
            />
          ) : recorder.permissionDenied ? (
            <MicPermissionCard onRetry={recorder.startRecording} onUploadFile={openFilePicker} />
          ) : (
            /* Grid de 2 columnas para Subir archivo y Grabar audio */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UploadDropzone
                file={upload.file || (currentFile && !isRecordingActive ? currentFile : null)}
                rawFile={upload.rawFile}
                fileError={upload.fileError}
                fileDuration={upload.fileDuration}
                fileExtension={upload.fileExtension}
                formattedSize={upload.formattedSize}
                compressionMeta={upload.compressionMeta}
                compression={upload.compression}
                isDragging={upload.isDragging}
                onDragOver={upload.handleDragOver}
                onDragLeave={upload.handleDragLeave}
                onDrop={upload.handleDrop}
                onFileInputChange={upload.handleFileInputChange}
                onRemoveFile={handleRemoveCurrentFile}
                disabled={isProcessing || isRecordingActive}
              />

              <RecorderCard
                isRecording={recorder.isRecording}
                isPaused={recorder.isPaused}
                formattedTime={recorder.formattedTime}
                deviceLabel={recorder.deviceLabel}
                waveBars={recorder.waveBars}
                audioError={recorder.audioError}
                onStartRecording={recorder.startRecording}
                onPauseRecording={recorder.pauseRecording}
                onResumeRecording={recorder.resumeRecording}
                onStopRecording={recorder.stopRecording}
                onCancelRecording={recorder.cancelRecording}
                disabled={isProcessing || isFileSelected || isCompressing}
              />
            </div>
          )}

          {/* Selector de tipo de salida (Flashcards, Quiz, Notas completas) */}
          <OutputTypeSelector
            selectedType={currentOutputType}
            onTypeChange={setOutputType}
            disabled={isProcessing || isCompressing}
          />

          {/* Pie con estado contextual y botón de generación */}
          <GenerateFooter
            hasInput={Boolean(currentFile) && !isRecordingActive && !isCompressing}
            isRecording={isRecordingActive}
            isCompressing={isCompressing}
            isProcessing={isProcessing}
            onSubmit={onSubmit}
          />
        </>
      )}
    </section>
  )
}
