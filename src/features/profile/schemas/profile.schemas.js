import { z } from 'zod'

const optionalString = z
  .string()
  .trim()
  .max(60, 'No puede exceder 60 caracteres')
  .optional()
  .or(z.literal(''))
  .transform((val) => (val === '' ? '' : val))

export const profileSchema = z.object({
  firstName: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(60, 'El nombre no puede exceder 60 caracteres'),
  middleName: optionalString,
  lastName: z
    .string({ required_error: 'El primer apellido es obligatorio' })
    .trim()
    .min(1, 'El primer apellido es obligatorio')
    .max(60, 'El primer apellido no puede exceder 60 caracteres'),
  secondLastName: optionalString,
})
