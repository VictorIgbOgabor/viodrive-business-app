'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, PackagePlus,
  Wallet, Settings, Bell, LogOut,
  Building2, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

const navItems = [
  { href: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard'     },
  { href: '/shipments',      icon: Package,         label: 'Shipments'     },
  { href: '/shipments/new',  icon: PackagePlus,     label: 'New Shipment'  },
  { href: '/wallet',         icon: Wallet,          label: 'Wallet'        },
  { href: '/notifications',  icon: Bell,            label: 'Notifications' },
  { href: '/settings',       icon: Settings,        label: 'Settings'      },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-carbon border-r
      border-white/5 flex flex-col">

      {/* ── Logo ── */}
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard">
          <h1 className="font-display text-2xl font-black tracking-tight">
            <span className="text-sand">VIO</span>
            <span className="text-ember">drive</span>
            <span className="text-ember">.</span>
          </h1>
        </Link>
        <div className="flex items-center gap-1.5 mt-2">
          <Building2 size={11} className="text-ember" />
          <span className="text-ember text-xs font-semibold
            uppercase tracking-wider">
            Business
          </span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5
                  rounded-xl text-sm font-medium transition-all
                  group ${
                  active
                    ? 'bg-ember/10 text-ember'
                    : 'text-chrome hover:text-sand hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={active
                  ? 'text-ember' : 'text-chrome group-hover:text-sand'
                } />
                {label}
                {active && (
                  <ChevronRight size={14}
                    className="text-ember ml-auto" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── User ── */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-ember/20 flex
            items-center justify-center flex-shrink-0">
            <span className="font-display text-xs font-black text-ember">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sand text-sm font-semibold truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-chrome text-xs truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2
            rounded-xl text-red-400 hover:bg-red-400/5
            transition-all text-sm"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
