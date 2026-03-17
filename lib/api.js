import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('vio_biz_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong.'
    if (status === 401) {
      Cookies.remove('vio_biz_token')
      Cookies.remove('vio_biz_user')
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return Promise.reject({ status, message })
  }
)

// ─── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
}

// ─── Business Profile ──────────────────────────────────────
export const businessAPI = {
  getProfile:    ()     => api.get('/users/business-profile'),
  updateProfile: (data) => api.patch('/users/business-profile', data),
}

// ─── Orders ────────────────────────────────────────────────
export const ordersAPI = {
  create:      (data)   => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOne:      (id)     => api.get(`/orders/${id}`),
  getHistory:  (id)     => api.get(`/orders/${id}/history`),
  cancel:      (id, data) => api.patch(`/orders/${id}/cancel`, data),
}

// ─── Pricing ───────────────────────────────────────────────
export const pricingAPI = {
  estimate:  (data) => api.post('/pricing/estimate', data),
  getConfig: ()     => api.get('/pricing/config'),
}

// ─── Payments ──────────────────────────────────────────────
export const paymentsAPI = {
  initialize: (data)      => api.post('/payments/initialize', data),
  verify:     (reference) => api.get(`/payments/verify/${reference}`),
}

// ─── Wallet ────────────────────────────────────────────────
export const walletAPI = {
  getWallet:       ()       => api.get('/wallets/me'),
  getTransactions: (params) => api.get('/wallets/me/transactions', { params }),
}

// ─── Notifications ─────────────────────────────────────────
export const notificationsAPI = {
  getAll:      (params) => api.get('/notifications', { params }),
  markRead:    (id)     => api.patch(`/notifications/${id}/read`),
  markAllRead: ()       => api.patch('/notifications/read-all'),
}

export default api
