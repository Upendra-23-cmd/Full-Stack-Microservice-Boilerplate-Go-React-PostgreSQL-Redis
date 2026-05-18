import axios from 'axios'

// VITE_API_URL  — set at build time (e.g. https://api.example.com)
// If not set, requests go to /api/... which Nginx proxies to the backend.
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/me'),
}

export const productsAPI = {
  list: () => api.get('/products'),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
}

export const ordersAPI = {
  list: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
}

export default api
