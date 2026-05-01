import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

// Auto-attach token
api.interceptors.request.use((config) => {
  const stored = JSON.parse(localStorage.getItem('chatplug-auth') || '{}')
  const token = stored?.state?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('chatplug-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
