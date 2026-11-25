import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { generatorSchema } from '../schemas/generator.schemas'
import { generationService } from '../services/generation.service'
import { useReviewsStore } from '../store/reviews.store'

export function useGenerateMaterial() {
  const [status, setStatus] = useState('idle') // 'idle' | 'processing' | 'success' | 'error'
  const [serverError, setServerError] = useState(null)
  const [fileMetadata, setFileMetadata] = useState(null)
  const navigate = useNavigate()
  const addReview = useReviewsStore((s) => s.addReview)

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      outputType: 'full',
      file: null,
    },
  })

  const currentOutputType = useWatch({ control, name: 'outputType' })
  const currentFile = useWatch({ control, name: 'file' })

  const onSubmit = handleSubmit(async (data) => {
    setStatus('processing')
    setServerError(null)

    try {
      const generatedReview = await generationService.generateMaterial({
        ...data,
        metadata: fileMetadata,
      })
      addReview(generatedReview)
      setStatus('success')
      navigate(`/reviews/${generatedReview.id}`, { replace: true })
    } catch (err) {
      setStatus('error')
      setServerError(err.message || 'Ocurrió un error al generar el material de repaso.')
    }
  })

  return {
    currentOutputType,
    currentFile,
    fileMetadata,
    setOutputType: (type) => setValue('outputType', type, { shouldValidate: true }),
    setFile: (file, meta = null) => {
      setValue('file', file, { shouldValidate: true })
      setFileMetadata(meta)
    },
    onSubmit,
    errors,
    isProcessing: status === 'processing',
    serverError,
  }
}
