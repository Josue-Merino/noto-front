import { z } from 'zod'

// Supabase Auth del proyecto exige minúscula, mayúscula, número y uno de estos símbolos
const PASSWORD_SYMBOL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
})

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'El nombre es obligatorio')
      .max(60, 'El nombre no puede exceder 60 caracteres'),
    middleName: z
      .string()
      .trim()
      .max(60, 'El segundo nombre no puede exceder 60 caracteres')
      .optional()
      .or(z.literal('')),
    firstLastName: z
      .string()
      .trim()
      .min(1, 'El primer apellido es obligatorio')
      .max(60, 'El primer apellido no puede exceder 60 caracteres'),
    secondLastName: z
      .string()
      .trim()
      .max(60, 'El segundo apellido no puede exceder 60 caracteres')
      .optional()
      .or(z.literal('')),
    email: z
      .string()
      .trim()
      .min(1, 'El correo electrónico es obligatorio')
      .email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
      .regex(PASSWORD_SYMBOL_RE, 'La contraseña debe contener al menos un símbolo (por ejemplo ! @ # $ %)'),
    confirmPassword: z
      .string()
      .min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
      .regex(PASSWORD_SYMBOL_RE, 'La contraseña debe contener al menos un símbolo (por ejemplo ! @ # $ %)'),
    confirmPassword: z
      .string()
      .min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
