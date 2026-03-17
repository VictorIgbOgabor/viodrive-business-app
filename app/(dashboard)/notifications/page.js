'use client'

import { useEffect, useState } from 'react'
import {
  Bell, CheckCheck, Package,
  Wallet, Info, Loader2
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { notificationsAPI } from '@/lib/api'
import { formatDate } from '@/lib/helpers'
import toast from 'react-hot-toast'

const getIcon = (type) => {
  const map = {
    order_update: Package,
    payment:      Wallet,
    system:       Info,
  }
  return map[type] || Bell
}

const getColor = (type) => ({
  order_update: 'text-ember bg-ember/10',
  payment:      'text-green-400 bg-green-400/10',
  system:       'text-blue-400 bg-blue-400/10',
}[type] || 'text-chrome bg-surface')

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [marking,       setMarking]       = useState(false)
  const [unread,        setUnread]        = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await notificationsAPI.getAll({ limit: 50 })
        setNotifications(res.data.data.notifications)
        setUnread(res.data.unread_count || 0)
      } catch {} finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id)
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
      setUnread((c) => Math.max(0, c - 1))
    } catch {}
  }

  const markAllRead = async () => {
    setMarking(true)
    try {
      await notificationsAPI.markAllRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true })))
      setUnread(0)
      toast.success('All notifications marked as read.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setMarking(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Notifications">
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Notifications"
      subtitle={unread > 0
        ? `${unread} unread notification${unread !== 1 ? 's' : ''}`
        : 'All caught up!'}
    >
      <div className="animate-fade-up max-w-2xl">

        {/* ── Mark All Read ── */}
        {unread > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={markAllRead}
              disabled={marking}
              className="btn-ghost text-sm flex items-center gap-2"
            >
              {marking
                ? <Loader2 size={14} className="animate-spin" />
                : <CheckCheck size={14} />
              }
              Mark all read
            </button>
          </div>
        )}

        {/* ── List ── */}
        {notifications.length === 0 ? (
          <div className="card text-center py-16">
            <Bell size={40} className="text-chrome mx-auto mb-4" />
            <p className="font-display font-black text-sand text-lg mb-2">
              No notifications
            </p>
            <p className="text-chrome text-sm">
              Shipment updates will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon  = getIcon(n.type)
              const color = getColor(n.type)
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`card flex gap-4 cursor-pointer
                    transition-all hover:border-white/10 ${
                    !n.is_read ? 'border-ember/20' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center
                    justify-center flex-shrink-0 ${color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${
                        n.is_read ? 'text-sand-dim' : 'text-sand'
                      }`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-ember
                          flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-chrome text-xs mt-1 leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-chrome/60 text-xs mt-2">
                      {formatDate(n.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
