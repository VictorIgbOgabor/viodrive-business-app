'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Download,
  Package, Loader2, Filter
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ShipmentRow from '@/components/ui/ShipmentRow'
import { ordersAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/helpers'

const STATUSES = [
  { value: '',           label: 'All'         },
  { value: 'pending',    label: 'Pending'      },
  { value: 'in_transit', label: 'In Transit'   },
  { value: 'delivered',  label: 'Delivered'    },
  { value: 'cancelled',  label: 'Cancelled'    },
]

export default function ShipmentsPage() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [status,   setStatus]   = useState('')
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const LIMIT = 20

  useEffect(() => {
    fetchOrders()
  }, [status, page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (status) params.status = status
      const res = await ordersAPI.getMyOrders(params)
      setOrders(res.data.data.orders)
      setTotal(res.data.total || 0)
    } catch {} finally {
      setLoading(false)
    }
  }

  const filtered = orders.filter((o) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.waybill_number?.toLowerCase().includes(q) ||
      o.pickup_address?.toLowerCase().includes(q)  ||
      o.dropoff_address?.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(total / LIMIT)

  // CSV export
  const exportCSV = () => {
    const headers = [
      'Waybill', 'Status', 'Pickup', 'Dropoff',
      'Package', 'Amount', 'Date'
    ]
    const rows = orders.map((o) => [
      o.waybill_number, o.status,
      `"${o.pickup_address}"`, `"${o.dropoff_address}"`,
      o.package_type, o.total_amount, o.created_at
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `viodrive-shipments-${Date.now()}.csv`
    a.click()
  }

  return (
    <DashboardLayout
      title="Shipments"
      subtitle={`${total} total shipments`}
    >
      <div className="animate-fade-up space-y-4">

        {/* ── Actions Bar ── */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4
              top-1/2 -translate-y-1/2 text-chrome" />
            <input
              type="text"
              placeholder="Search by waybill or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
            />
          </div>

          {/* Export */}
          <button
            onClick={exportCSV}
            className="btn-ghost flex items-center gap-2"
          >
            <Download size={14} />
            Export CSV
          </button>

          {/* New */}
          <Link href="/shipments/new" className="btn-primary">
            <Plus size={14} />
            New Shipment
          </Link>
        </div>

        {/* ── Status Filters ── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setStatus(value); setPage(1) }}
              className={`flex-shrink-0 px-4 py-2 rounded-lg
                text-sm font-medium transition-all ${
                status === value
                  ? 'bg-ember text-sand'
                  : 'bg-surface text-chrome hover:text-sand border border-white/6'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Table Header ── */}
        <div className="hidden md:grid grid-cols-[16px_144px_1fr_112px_112px_96px_24px]
          gap-4 px-4 py-2">
          <div />
          <p className="text-chrome text-xs font-medium uppercase tracking-wider">
            Waybill
          </p>
          <p className="text-chrome text-xs font-medium uppercase tracking-wider">
            Route
          </p>
          <p className="text-chrome text-xs font-medium uppercase tracking-wider">
            Package
          </p>
          <p className="text-chrome text-xs font-medium uppercase tracking-wider">
            Status
          </p>
          <p className="text-chrome text-xs font-medium uppercase tracking-wider
            text-right">
            Amount
          </p>
          <div />
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <Package size={40} className="text-chrome mx-auto mb-4" />
            <p className="font-display font-black text-sand text-lg mb-2">
              No shipments found
            </p>
            <p className="text-chrome text-sm mb-6">
              {search
                ? 'Try a different search term'
                : 'Create your first shipment'
              }
            </p>
            {!search && (
              <Link href="/shipments/new" className="btn-primary inline-flex">
                <Plus size={14} />
                New Shipment
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {filtered.map((order) => (
                <ShipmentRow key={order.id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost px-4 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-chrome text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
