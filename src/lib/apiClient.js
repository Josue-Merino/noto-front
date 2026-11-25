import { useAuthStore } from '@/features/auth/store/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

/**
 * Error normalizado de la API de Noto.
 */
export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', details = null, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
    this.status = status
  }
}

let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback)
}

/**
 * Cliente HTTP unificado con refresco automático de token ante 401.
 */
export async function apiClient(endpoint, options = {}, isRetry = false) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`
  const token = useAuthStore.getState().session?.accessToken
  // Con FormData el navegador arma el Content-Type multipart con su boundary: no hay que fijarlo
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  let response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión.',
      'NETWORK_ERROR',
      null,
      0
    )
  }

  // Manejo de token expirado (401)
  if (response.status === 401 && !isRetry) {
    const isAuthRoute =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/register') ||
      endpoint.includes('/auth/refresh')

    if (!isAuthRoute) {
      const currentSession = useAuthStore.getState().session
      const refreshToken = currentSession?.refreshToken

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true

          try {
            const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            })

            const refreshJson = await refreshRes.json().catch(() => ({}))

            if (refreshRes.ok && refreshJson.success && refreshJson.data) {
              const newSession = {
                ...currentSession,
                accessToken: refreshJson.data.accessToken,
                refreshToken: refreshJson.data.refreshToken || refreshToken,
                expiresAt: refreshJson.data.expiresAt,
              }

              useAuthStore.getState().setSession({
                user: useAuthStore.getState().user,
                session: newSession,
              })

              isRefreshing = false
              onRefreshed(newSession.accessToken)

              // Reintentar la petición original con el nuevo token
              return apiClient(endpoint, options, true)
            } else {
              throw new Error('Refresh failed')
            }
          } catch {
            isRefreshing = false
            refreshSubscribers = []
            useAuthStore.getState().clearSession()
            window.location.href = '/login'
            throw new ApiError('Tu sesión ha expirado. Por favor ingresa de nuevo.', 'UNAUTHORIZED', null, 401)
          }
        } else {
          // Si ya hay un refresco en curso, esperar al nuevo token
          return new Promise((resolve, reject) => {
            addRefreshSubscriber((newToken) => {
              const retryOptions = {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${newToken}`,
                },
              }
              apiClient(endpoint, retryOptions, true).then(resolve).catch(reject)
            })
          })
        }
      }
    }
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const errorPayload = data?.error || {}
    throw new ApiError(
      errorPayload.message || 'Ocurrió un error en la solicitud.',
      errorPayload.code || 'REQUEST_FAILED',
      errorPayload.details || null,
      response.status
    )
  }

  // Devolver el payload desanidado o la respuesta completa
  return data?.data !== undefined ? data.data : data
}

apiClient.get = (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'GET' })
apiClient.post = (endpoint, body, options = {}) =>
  apiClient(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) })
apiClient.put = (endpoint, body, options = {}) =>
  apiClient(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) })
apiClient.patch = (endpoint, body, options = {}) =>
  apiClient(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) })
apiClient.delete = (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'DELETE' })
/** POST multipart/form-data (subida de archivos). Reutiliza el Bearer, el refresh ante 401 y el desanidado de `data`. */
apiClient.postForm = (endpoint, formData, options = {}) =>
  apiClient(endpoint, { ...options, method: 'POST', body: formData })
