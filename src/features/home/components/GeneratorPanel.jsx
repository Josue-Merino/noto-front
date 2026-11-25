import { useFileUpload } from '../hooks/useFileUpload'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useGenerateMaterial } from '../hooks/useGenerateMaterial'
import { UploadDropzone } from './UploadDropzone'
import { RecorderCard } from './RecorderCard'
import { OutputTypeSelector } from './OutputTypeSelector'
import { GenerateFooter } from './GenerateFooter'
import { FormAlert } from '@/components/ui/FormAlert'

/**
 * Tarjeta panel generadora que orquesta UploadDropzone, RecorderCard, OutputTypeSelector y GenerateFooter,
 * integrando la optimización y compresión de audio previa en el navegador.
 */
export function GeneratorPanel() {
  const {
    currentOutputType,
    currentFile,
    setOutputType,
    setFile,
    onSubmit,
    isProcessing,
    serverError,
    errors,
  } = useGenerateMaterial()

  // Manejo de archivo subido con compresión integrada
  const upload = useFileUpload({
    onFileSelected: (f, meta) => {
      if (f) {
        // Exclusión mutua: si sube archivo, se cancela la grabación activa
        recorder.cancelRecording()
      }
      setFile(f, meta)
    },
  })

  // Manejo de grabación de audio ligera
  const recorder = useAudioRecorder({
    onAudioRecorded: (f) => {
      if (f) {
        // Exclusión mutua: si graba audio, se quita el archivo subido previo
        upload.removeFile()
      }
      setFile(f, {
        originalName: f?.name || 'grabacion.webm',
        originalSize: f?.size || 0,
        compressedSize: f?.size || 0,
        savingsPercent: 0,
      })
    },
  })

  const handleRemoveCurrentFile = () => {
    upload.removeFile()
    recorder.resetRecording()
    setFile(null)
  }

  const isRecordingActive = recorder.isRecording || recorder.isPaused
  const isCompressing = upload.compression.isCompressing || upload.compression.isLoadingEngine
  const isFileSelected = Boolean(upload.file || upload.rawFile || (currentFile && !isRecordingActive))

  return (
    <section
      aria-label="Panel de generación de material con IA"
      className="relative w-full max-w-3xl mx-auto rounded-2xl bg-surface/60 border border-border p-4 sm:p-7 md:p-8 shadow-2xl backdrop-blur-sm"
    >
      {/* Alerta de error global */}
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

      {/* Grid de 2 columnas para Subir archivo y Grabar audio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta Subir archivo multimedia */}
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

        {/* Tarjeta Grabar audio de clase */}
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
    </section>
  )
}
