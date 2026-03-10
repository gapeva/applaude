import axios from 'axios'
import { useAuthStore } from '@/store'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inject auth token on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401s — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────
export const authAPI = {
  getGitHubOAuthURL: () =>
    api.get<{ url: string }>('/auth/github/url').then((r) => r.data),

  handleCallback: (code: string) =>
    api.post<{ user: import('@/types').GitHubUser; token: string }>(
      '/auth/github/callback',
      { code }
    ).then((r) => r.data),

  getMe: () =>
    api.get<import('@/types').GitHubUser>('/auth/me').then((r) => r.data),

  logout: () => api.post('/auth/logout'),
}

// ─── Sessions ─────────────────────────────────────────────
export const sessionAPI = {
  create: (data: { repo_url: string; focus_prompt: string; branch_mode: string }) =>
    api.post<import('@/types').Session>('/sessions', data).then((r) => r.data),

  get: (sessionId: string) =>
    api.get<import('@/types').Session>(`/sessions/${sessionId}`).then((r) => r.data),

  applyFix: (sessionId: string, branchMode: string) =>
    api.post(`/sessions/${sessionId}/apply-fix`, { branch_mode: branchMode }).then((r) => r.data),

  revert: (sessionId: string) =>
    api.post(`/sessions/${sessionId}/revert`).then((r) => r.data),

  close: (sessionId: string) =>
    api.delete(`/sessions/${sessionId}`).then((r) => r.data),
}

// ─── GitHub Repos ─────────────────────────────────────────
export const githubAPI = {
  listRepos: () =>
    api.get<import('@/types').Repository[]>('/github/repos').then((r) => r.data),

  searchRepos: (query: string) =>
    api.get<import('@/types').Repository[]>('/github/repos/search', { params: { q: query } }).then((r) => r.data),
}

// ─── Payments ─────────────────────────────────────────────
export const paymentAPI = {
  initializePayment: (plan: string) =>
    api.post<{ authorization_url: string; reference: string }>(
      '/payments/initialize',
      { plan }
    ).then((r) => r.data),

  verifyPayment: (reference: string) =>
    api.post<{ subscription: import('@/types').Subscription }>(
      '/payments/verify',
      { reference }
    ).then((r) => r.data),

  getSubscription: () =>
    api.get<import('@/types').Subscription | null>('/payments/subscription').then((r) => r.data),
}
