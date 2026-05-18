import { create } from 'zustand'
import { authAPI } from '../api/client'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.login({ email, password })
      localStorage.setItem('token', data.data.token)
      set({ user: data.data.user, token: data.data.token, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error || 'Login failed', loading: false })
      return false
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.register({ name, email, password })
      localStorage.setItem('token', data.data.token)
      set({ user: data.data.user, token: data.data.token, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error || 'Registration failed', loading: false })
      return false
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await authAPI.me()
      set({ user: data.data })
    } catch {
      set({ user: null, token: null })
      localStorage.removeItem('token')
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
