import { create } from 'zustand'
import Cookies from 'js-cookie'

// ─── Auth Store ────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  user:    Cookies.get('vio_biz_user')
    ? JSON.parse(Cookies.get('vio_biz_user')) : null,
  token:   Cookies.get('vio_biz_token') || null,

  setAuth: (user, token) => {
    Cookies.set('vio_biz_token', token,               { expires: 7 })
    Cookies.set('vio_biz_user',  JSON.stringify(user), { expires: 7 })
    set({ user, token })
  },

  logout: () => {
    Cookies.remove('vio_biz_token')
    Cookies.remove('vio_biz_user')
    set({ user: null, token: null })
  },
}))

// ─── Orders Store ──────────────────────────────────────────
export const useOrderStore = create((set) => ({
  orders:  [],
  total:   0,
  loading: false,

  setOrders:  (orders, total) => set({ orders, total }),
  setLoading: (loading)       => set({ loading }),
}))

// ─── Analytics Store ───────────────────────────────────────
export const useAnalyticsStore = create((set) => ({
  stats:   null,
  setStats: (stats) => set({ stats }),
}))
