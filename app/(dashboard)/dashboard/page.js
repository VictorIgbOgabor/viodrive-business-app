'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package, TrendingUp, Wallet,
  Clock, CheckCircle, XCircle,
  Plus, ArrowRight, Loader2
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatCard from '@/components/ui/StatCard'
import ShipmentRow from '@/components/ui/ShipmentRow'
import { ordersAPI, walletAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatCurrency, formatDateShort, CHART_COLORS } from '@/lib/helpers'

export default function DashboardPage() {
  const { user }                  = useAuthStore()
  const [orders,   setOrders]     = useState([])
  const [wallet,   setWallet]     = useState(null)
  const [loading,  setLoading]    = useState(true)
  const [stats,    setStats]      = useState(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, walletRes] = await Promise.all([
          ordersAPI.getMyOrders({ limit: 50, page: 1 }),
          walletAPI.getWallet(),
        ])

        const allOrders = ordersRes.data.data.orders
        setOrders(allOrders.slice(0, 8))
        setWallet(walletRes.data.data.wallet)

        // Compute stats
        const total     = ordersRes.data.total || 0
        const delivered = allOrders.filter(
          (o) => o.status === 'delivered').length
        const active    = allOrders.filter((o) =>
          ['pending','assigned','arrived',
           'picked_up','in_transit'].includes(o.status)).length
        const cancelled = allOrders.filter(
          (o) => o.status === 'cancelled').length
        const totalSpent = allOrders.reduce(
          (s, o) => s + parseFloat(o.total_amount || 0), 0)

        setStats({ total, delivered, active, cancelled, totalSpent })

        // Build chart data (last 7 days)
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          const label = formatDateShort(d)
          const dayOrders = allOrders.filter((o) => {
            const od = new Date(o.created_at)
            return od.toDateString() === d.toDateString()
          })
          return {
            date:     label,
            orders:   dayOrders.length,
            spending: dayOrders.reduce(
              (s, o) => s + parseFloat(o.total_amount || 0), 0
            ),
          }
        })
        setChartData(days)
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const pieData = stats ? [
    { name: 'Delivered',  value: stats.delivered, color: CHART_COLORS.green },
    { name: 'Active',     value: stats.active,    color: CHART_COLORS.ember },
    { name: 'Cancelled',  value: stats.cancelled, color: CHART_COLORS.red   },
  ] : []

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    )
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`${greeting()}, ${user?.first_name} 👋`}
    >
      <div className="animate-fade-up space-y-6">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Shipments"
            value={stats?.total || 0}
            subtitle="All time"
            color="chrome"
            icon={<Package size={14} />}
          />
          <StatCard
            title="Active"
            value={stats?.active || 0}
            subtitle="In progress"
            color="amber"
            icon={<Clock size={14} />}
          />
          <StatCard
            title="Delivered"
            value={stats?.delivered || 0}
            subtitle="Completed"
            color="green"
            icon={<CheckCircle size={14} />}
          />
          <StatCard
            title="Total Spent"
            value={formatCurrency(stats?.totalSpent || 0)}
            subtitle="Logistics spend"
            color="ember"
            icon={<TrendingUp size={14} />}
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Spending Chart */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider">
                Spending — Last 7 Days
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"
                      stopColor="#E8450A" stopOpacity={0.3} />
                    <stop offset="95%"
                      stopColor="#E8450A" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#C8C4BC', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#C8C4BC', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background:   '#1A1714',
                    border:       '1px solid rgba(232,69,10,0.2)',
                    borderRadius: '10px',
                    color:        '#F5EFE6',
                    fontSize:     '12px',
                  }}
                  formatter={(v) => [formatCurrency(v), 'Spending']}
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#E8450A"
                  strokeWidth={2}
                  fill="url(#spendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card flex flex-col">
            <p className="text-chrome text-xs font-medium uppercase
              tracking-wider mb-4">
              Order Breakdown
            </p>
            {stats?.total === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-chrome text-sm">No data yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name}
                      className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full"
                          style={{ background: d.color }} />
                        <span className="text-chrome text-xs">
                          {d.name}
                        </span>
                      </div>
                      <span className="text-sand text-xs font-semibold">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Wallet + Quick Actions ── */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Wallet */}
          <div className="card-ember relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32
              rounded-full bg-ember/5" />
            <p className="text-chrome text-xs font-medium uppercase
              tracking-wider mb-3">
              Wallet Balance
            </p>
            <p className="font-display text-3xl font-black text-sand mb-1">
              {wallet ? formatCurrency(wallet.balance) : '₦0'}
            </p>
            <p className="text-chrome text-xs mb-4">Available balance</p>
            <Link href="/wallet" className="btn-ghost text-sm py-2">
              View Transactions
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 card">
            <p className="text-chrome text-xs font-medium uppercase
              tracking-wider mb-4">
              Quick Actions
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  href:  '/shipments/new',
                  icon:  '📦',
                  label: 'New Shipment',
                  desc:  'Create a single waybill',
                  primary: true,
                },
                {
                  href:  '/shipments/bulk',
                  icon:  '📋',
                  label: 'Bulk Upload',
                  desc:  'Upload CSV for multiple',
                  primary: false,
                },
                {
                  href:  '/shipments',
                  icon:  '🔍',
                  label: 'Track Shipments',
                  desc:  'View all active orders',
                  primary: false,
                },
                {
                  href:  '/wallet',
                  icon:  '💳',
                  label: 'Manage Wallet',
                  desc:  'Top up or withdraw',
                  primary: false,
                },
              ].map(({ href, icon, label, desc, primary }) => (
                <Link key={href} href={href}>
                  <div className={`p-4 rounded-xl border
                    transition-all group cursor-pointer h-full ${
                    primary
                      ? 'bg-ember border-ember hover:bg-ember-light'
                      : 'bg-surface border-white/6 hover:border-white/12'
                  }`}>
                    <span className="text-xl">{icon}</span>
                    <p className={`text-sm font-semibold mt-2 ${
                      primary ? 'text-sand' : 'text-sand'
                    }`}>
                      {label}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      primary ? 'text-sand/70' : 'text-chrome'
                    }`}>
                      {desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Shipments ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-black text-sand">
              Recent Shipments
            </h3>
            <Link
              href="/shipments"
              className="flex items-center gap-1 text-ember
                text-sm hover:text-ember-light transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="card text-center py-12">
              <Package size={36} className="text-chrome mx-auto mb-3" />
              <p className="text-sand font-display font-black mb-2">
                No shipments yet
              </p>
              <p className="text-chrome text-sm mb-5">
                Create your first business shipment
              </p>
              <Link href="/shipments/new" className="btn-primary inline-flex">
                <Plus size={16} />
                New Shipment
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <ShipmentRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
