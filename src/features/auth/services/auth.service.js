import { apiClient } from '@/lib/apiClient'

/**
 * Servicio de autenticación conectado a la API Express / Supabase.
 */
export const authService = {
  /**
   * Inicia sesión con credenciales.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: object, session: object }>}
   */
  async login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },

  /**
   * Registra una nueva cuenta de usuario.
   * @param {object} data
   * @returns {Promise<{ user: object, message?: string }>}
   */
  async register(data) {
    const payload = {
      firstName: data.firstName,
      middleName: data.middleName || undefined,
      lastName: data.firstLastName || data.lastName,
      secondLastName: data.secondLastName || undefined,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    }
    return apiClient.post('/auth/register', payload)
  },

  /**
   * Reenvía el correo de verificación.
   * @param {{ email: string }} data
   */
  async resendVerification({ email }) {
    return apiClient.post('/auth/resend-verification', { email })
  },

  /**
   * Cierra la sesión activa en el servidor.
   */
  async logout() {
    return apiClient.post('/auth/logout', {})
  },

  /**
   * Consulta el usuario autenticado actual.
   * @returns {Promise<object>}
   */
  async me() {
    return apiClient.get('/auth/me')
  },

  /**
   * Actualiza los datos de perfil del usuario actual.
   * @param {object} profileData
   * @returns {Promise<object>}
   */
  async updateProfile(profileData) {
    return apiClient.patch('/auth/profile', profileData)
  },

  /**
   * Solicita el correo de recuperación de contraseña.
   * @param {{ email: string }} data
   */
  async forgotPassword({ email }) {
    return apiClient.post('/auth/forgot-password', { email })
  },

  /**
   * Define la nueva contraseña con el token de recuperación.
   * @param {{ password: string, confirmPassword: string }} data
   */
  async resetPassword({ password, confirmPassword }) {
    return apiClient.post('/auth/reset-password', { password, confirmPassword })
  },
}
