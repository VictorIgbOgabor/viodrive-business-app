'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Package,
  User, Phone, Clock, CheckCircle,
  XCircle, Loader2, AlertTriangle
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ordersAPI } from '@/lib/api'
import {
  formatCurrency, formatDate,
  getStatusBadgeClass, getStatusLabel,
  getVehicleLabel, getPackageLabel
} from '@/lib/helpers'
import toast from 'react-hot-toast'

export default function ShipmentDetailPage() {
  const { id }    = useParams()
  const router    = useRouter()
  const [order,   setOrder]   = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCancel,    setShowCancel]    = useState(false)
  const [cancelReason,  setCancelReason]  = useState('')
  const [cancelling,    setCancelling]    = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [orderRes, historyRes] = await Promise.all([
          ordersAPI.getOne(id),
          ordersAPI.getHistory(id),
        ])
        setOrder(orderRes.data.data.order)
        setHistory(historyRes.data.data.history)
      } catch {
        toast.error('Shipment not found.')
        router.push('/shipments')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      return toast.error('Please provide a cancellation reason.')
    }
    setCancelling(true)
    try {
      await ordersAPI.cancel(id, { reason: cancelReason })
      toast.success('Shipment cancelled.')
      setShowCancel(false)
      const res = await ordersAPI.getOne(id)
      setOrder(res.data.data.order)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Shipment Details">
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    )
  }

  if (!order) return null

  const canCancel = ['pending', 'assigned'].includes(order.status)

  return (
    <DashboardLayout title="Shipment Details">
      <div className="animate-fade-up max-w-3xl">

        {/* ── Back ── */}
        <Link
          href="/shipments"
          className="inline-flex items-center gap-2 text-chrome
            hover:text-sand text-sm transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to Shipments
        </Link>

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="font-display text-xs font-black text-ember
              tracking-wider mb-1">
              {order.waybill_number}
            </p>
            <h1 className="font-display text-2xl font-black text-sand">
              Shipment Details
            </h1>
            <p className="text-chrome text-sm mt-1">
              {formatDate(order.created_at)}
            </p>
          </div>
          <span className={`badge ${getStatusBadgeClass(order.status)}
            text-xs px-3 py-1.5`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">

          {/* ── Route ── */}
          <div className="card-ember md:col-span-2">
            <p className="text-chrome text-xs font-medium uppercase
              tracking-wider mb-4">
              Route
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-ember" />
                  <p className="text-chrome text-xs">Pickup</p>
                </div>
                <p className="text-sand text-sm font-medium mb-2">
                  {order.pickup_address}
                </p>
                {order.pickup_contact_name && (
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5
                      text-chrome text-xs">
                      <User size={11} />
                      {order.pickup_contact_name}
                    </span>
                    <span className="flex items-center gap-1.5
                      text-chrome text-xs">
                      <Phone size={11} />
                      {order.pickup_contact_phone}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-sand-dim" />
                  <p className="text-chrome text-xs">Dropoff</p>
                </div>
                <p className="text-sand text-sm font-medium mb-2">
                  {order.dropoff_address}
                </p>
                {order.dropoff_contact_name && (
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5
                      text-chrome text-xs">
                      <User size={11} />
                      {order.dropoff_contact_name}
                    </span>
                    <span className="flex items-center gap-1.5
                      text-chrome text-xs">
                      <Phone size={11} />
                      {order.dropoff_contact_phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4
              border-t border-white/5">
              <div>
                <p className="text-chrome text-xs">Distance</p>
                <p className="text-sand text-sm font-semibold">
                  {parseFloat(order.distance_km || 0).toFixed(1)} km
                </p>
              </div>
              <div>
                <p className="text-chrome text-xs">Duration</p>
                <p className="text-sand text-sm font-semibold">
                  {order.estimated_duration_min || '—'} mins
                </p>
              </div>
              <div>
                <p className="text-chrome text-xs">Vehicle</p>
                <p className="text-sand text-sm font-semibold">
                  {getVehicleLabel(order.vehicle_type)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Package ── */}
          <div className="card">
            <p className="text-chrome text-xs font-medium uppercase
              tracking-wider mb-3">
              Package
            </p>
            {[
              ['Type',      getPackageLabel(order.package_type)],
              ['Weight',    `${order.weight_kg} kg`],
              ['Quantity',  order.quantity || 1],
              ['Chargeable Weight',
                `${order.chargeable_weight_kg || order.weight_kg} kg`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2
                border-b border-white/5 last:border-0">
                <span className="text-chrome text-xs">{k}</span>
                <span className="text-sand text-xs font-medium">{v}</span>
              </div>
            ))}
          </div>

          {/* ── Pricing ── */}
          <div className="card">
            <p className="text-chrome text-xs font-medium uppercase
              tracking-wider mb-3">
              Pricing
            </p>
            {[
              ['Base Fare',    formatCurrency(order.base_fare)],
              ['Distance',     formatCurrency(order.distance_fare)],
              ['Weight',       formatCurrency(order.weight_fare)],
              ['Insurance',    formatCurrency(order.insurance_fee)],
              ['Platform Fee', formatCurrency(order.platform_fee)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2
                border-b border-white/5 last:border-0">
                <span className="text-chrome text-xs">{k}</span>
                <span className="text-sand text-xs">{v}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 mt-1">
              <span className="text-sand text-sm font-semibold">
                Total
              </span>
              <span className="font-display text-lg font-black text-ember">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>

          {/* ── Driver ── */}
          {order.driver_name && (
            <div className="card md:col-span-2">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider mb-3">
                Assigned Driver
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ember/20 flex
                  items-center justify-center font-display font-black
                  text-ember text-sm">
                  {order.driver_name?.split(' ')
                    .map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sand text-sm font-semibold">
                    {order.driver_name}
                  </p>
                  <p className="text-chrome text-xs">Delivery driver</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Timeline ── */}
          {history.length > 0 && (
            <div className="card md:col-span-2">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider mb-4">
                Timeline
              </p>
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={h.id || i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex
                        items-center justify-center flex-shrink-0 ${
                        i === 0 ? 'bg-ember/20' : 'bg-surface'
                      }`}>
                        {i === 0
                          ? <CheckCircle size={12}
                              className="text-ember" />
                          : <Clock size={12}
                              className="text-chrome" />
                        }
                      </div>
                      {i < history.length - 1 && (
                        <div className="w-px flex-1 bg-white/8 my-1"/>
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="text-sand text-sm font-medium capitalize">
                        {h.new_status?.replace('_', ' ')}
                      </p>
                      {h.note && (
                        <p className="text-chrome text-xs mt-0.5">
                          {h.note}
                        </p>
                      )}
                      <p className="text-chrome text-xs mt-1">
                        {formatDate(h.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        {canCancel && (
          <button
            onClick={() => setShowCancel(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl
              border border-red-400/20 text-red-400
              hover:bg-red-400/5 transition-all text-sm"
          >
            <XCircle size={14} />
            Cancel Shipment
          </button>
        )}

        {/* ── Cancel Modal ── */}
        {showCancel && (
          <div className="fixed inset-0 z-50 flex items-center
            justify-center p-4 bg-black/70">
            <div className="card-ember w-full max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-amber-400" />
                <h3 className="font-display text-base font-black text-sand">
                  Cancel Shipment?
                </h3>
              </div>
              <p className="text-chrome text-sm mb-4">
                Please provide a reason for cancellation.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={3}
                className="input-base resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancel(false)}
                  className="btn-ghost flex-1"
                >
                  Keep Shipment
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 btn-primary"
                  style={{ background: '#ef4444' }}
                >
                  {cancelling
                    ? <Loader2 size={14} className="animate-spin" />
                    : 'Cancel'
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
