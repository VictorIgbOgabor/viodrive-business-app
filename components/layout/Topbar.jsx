'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import { notificationsAPI } from '@/lib/api'

export default function Topbar({ title, subtitle }) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsAPI.getAll({
          unread_only: true, limit: 1
        })
        setUnread(res.data.unread_count || 0)
      } catch {}
    }
    fetchUnread()
  }, [])

  return (
    <header className="h-16 glass border-b border-white/5
      flex items-center justify-between px-6 sticky top-0 z-10">

      {/* Title */}
      <div>
        {title && (
          <h2 className="font-display text-base font-black
            text-sand leading-none">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-chrome text-xs mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="hidden md:flex items-center gap-2
          bg-surface border border-white/6 rounded-lg
          px-3 py-2 w-56">
          <Search size={14} className="text-chrome flex-shrink-0" />
          <input
            type="text"
            placeholder="Search shipments..."
            className="bg-transparent text-sm text-sand
              placeholder:text-chrome outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg text-chrome
            hover:text-sand hover:bg-white/5 transition-all"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4
              bg-ember rounded-full text-xs text-sand
              flex items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        {/* New Shipment CTA */}
        <Link href="/shipments/new" className="btn-primary py-2 text-sm">
          + New Shipment
        </Link>
      </div>
    </header>
  )
}
