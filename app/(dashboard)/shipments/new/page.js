'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Loader2,
  MapPin, Package, CreditCard, CheckCircle
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ordersAPI, pricingAPI, paymentsAPI } from '@/lib/api'
import { formatCurrency, getVehicleLabel } from '@/lib/helpers'
import toast from 'react-hot-toast'

const STEPS = [
  { n: 1, label: 'Route'   },
  { n: 2, label: 'Package' },
  { n: 3, label: 'Review'  },
  { n: 4, label: 'Confirm' },
]

const PACKAGE_TYPES = [
  'document', 'bulk_item', 'electronics',
  'business_shipment', 'fragile', 'other',
]

const VEHICLES = [
  { value: 'bike',  label: '🏍 Bike',  desc: 'Up to 20kg'     },
  { value: 'car',   label: '🚗 Car',   desc: 'Up to 100kg'    },
  { value: 'van',   label: '🚐 Van',   desc: 'Up to 800kg'    },
  { value: 'truck', label: '🚛 Truck', desc: 'Up to 10,000kg' },
]

const defaultForm = {
  pickup_address:        '',
  pickup_city:           '',
  pickup_contact_name:   '',
  pickup_contact_phone:  '',
  pickup_notes:          '',
  dropoff_address:       '',
  dropoff_city:          '',
  dropoff_contact_name:  '',
  dropoff_contact_phone: '',
  dropoff_notes:         '',
  package_type:          'document',
  package_description:   '',
  quantity:              1,
  weight_kg:             '',
  length_cm:             '',
  width_cm:              '',
  height_cm:             '',
  vehicle_type:          'bike',
  payment_method:        'card',
}

export default function NewShipmentPage() {
  const router    = useRouter()
  const [step,     setStep]    = useState(1)
  const [form,     setForm]    = useState(defaultForm)
  const [estimate, setEstimate] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [orderId,  setOrderId]  = useState(null)
  const [success,  setSuccess]  = useState(false)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleEstimate = async () => {
    if (!form.weight_kg || parseFloat(form.weight_kg) <= 0) {
      return toast.error('Please enter the package weight.')
    }
    setLoading(true)
    try {
      const res = await pricingAPI.estimate({
        vehicle_type: form.vehicle_type,
        distance_km:  10,
        weight_kg:    parseFloat(form.weight_kg),
        length_cm:    form.length_cm || undefined,
        width_cm:     form.width_cm  || undefined,
        height_cm:    form.height_cm || undefined,
      })
      setEstimate(res.data.data.estimate)
      setStep(3)
    } catch (err) {
      toast.error(err.message || 'Could not calculate fare.')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const res = await ordersAPI.create({
        ...form,
        weight_kg:  parseFloat(form.weight_kg),
        quantity:   parseInt(form.quantity),
        pickup_lat:  6.5244,
        pickup_lng:  3.3792,
        dropoff_lat: 6.5244,
        dropoff_lng: 3.3792,
        distance_km:            10,
        estimated_duration_min: 30,
      })

      const order = res.data.data.order
      setOrderId(order.id)

      if (form.payment_method === 'card') {
        const payRes = await paymentsAPI.initialize({ order_id: order.id })
        window.location.href = payRes.data.data.authorization_url
        return
      }

      setSuccess(true)
      toast.success('Shipment created successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to create shipment.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <DashboardLayout title="New Shipment">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-full bg-green-500/10
            flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-black text-sand mb-2">
            Shipment Created!
          </h2>
          <p className="text-chrome text-sm mb-8">
            Your waybill has been created and we are finding a driver.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/shipments/${orderId}`)}
              className="btn-primary w-full"
            >
              View Shipment
            </button>
            <button
              onClick={() => {
                setForm(defaultForm)
                setStep(1)
                setEstimate(null)
                setSuccess(false)
              }}
              className="btn-ghost w-full"
            >
              Create Another
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="New Shipment">
      <div className="animate-fade-up max-w-2xl">

        {/* ── Step Indicator ── */}
        <div className="flex items-center mb-8">
          {STEPS.map(({ n, label }, i) => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center
                  justify-center text-xs font-display font-black
                  transition-all ${
                  step === n ? 'bg-ember text-sand scale-110' :
                  step > n   ? 'bg-ember/30 text-ember'       :
                  'bg-surface text-chrome'
                }`}>
                  {step > n ? '✓' : n}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${
                  step >= n ? 'text-sand' : 'text-chrome'
                }`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 transition-all ${
                  step > n ? 'bg-ember/40' : 'bg-white/8'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Route ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="card-ember">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider mb-4">
                Pickup Details
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sand-dim text-sm
                    font-medium mb-2">
                    Pickup Address *
                  </label>
                  <input value={form.pickup_address}
                    onChange={(e) => set('pickup_address', e.target.value)}
                    placeholder="Full pickup address"
                    className="input-base" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-chrome text-xs mb-1.5">
                      Contact Name
                    </label>
                    <input value={form.pickup_contact_name}
                      onChange={(e) =>
                        set('pickup_contact_name', e.target.value)}
                      placeholder="Sender name"
                      className="input-base text-sm" />
                  </div>
                  <div>
                    <label className="block text-chrome text-xs mb-1.5">
                      Contact Phone
                    </label>
                    <input value={form.pickup_contact_phone}
                      onChange={(e) =>
                        set('pickup_contact_phone', e.target.value)}
                      placeholder="08012345678"
                      className="input-base text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card-ember">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider mb-4">
                Dropoff Details
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sand-dim text-sm
                    font-medium mb-2">
                    Dropoff Address *
                  </label>
                  <input value={form.dropoff_address}
                    onChange={(e) => set('dropoff_address', e.target.value)}
                    placeholder="Full dropoff address"
                    className="input-base" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-chrome text-xs mb-1.5">
                      Recipient Name
                    </label>
                    <input value={form.dropoff_contact_name}
                      onChange={(e) =>
                        set('dropoff_contact_name', e.target.value)}
                      placeholder="Recipient name"
                      className="input-base text-sm" />
                  </div>
                  <div>
                    <label className="block text-chrome text-xs mb-1.5">
                      Recipient Phone
                    </label>
                    <input value={form.dropoff_contact_phone}
                      onChange={(e) =>
                        set('dropoff_contact_phone', e.target.value)}
                      placeholder="08012345678"
                      className="input-base text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-chrome text-xs mb-1.5">
                    Delivery Notes
                  </label>
                  <textarea value={form.dropoff_notes}
                    onChange={(e) => set('dropoff_notes', e.target.value)}
                    placeholder="Special delivery instructions..."
                    rows={2}
                    className="input-base resize-none text-sm" />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!form.pickup_address || !form.dropoff_address) {
                  return toast.error('Please enter both addresses.')
                }
                setStep(2)
              }}
              className="btn-primary w-full"
            >
              Continue to Package
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Package ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="card-ember">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider mb-4">
                Package Details
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sand-dim text-sm
                    font-medium mb-2">
                    Package Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PACKAGE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => set('package_type', type)}
                        className={`px-3 py-2 rounded-xl text-xs
                          font-medium text-left capitalize transition-all
                          border ${
                          form.package_type === type
                            ? 'border-ember bg-ember/10 text-sand'
                            : 'border-white/6 bg-surface text-chrome'
                        }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sand-dim text-sm
                      font-medium mb-2">
                      Weight (kg) *
                    </label>
                    <input
                      type="number" min="0.1" step="0.1"
                      value={form.weight_kg}
                      onChange={(e) => set('weight_kg', e.target.value)}
                      placeholder="0.0"
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sand-dim text-sm
                      font-medium mb-2">
                      Quantity
                    </label>
                    <input
                      type="number" min="1"
                      value={form.quantity}
                      onChange={(e) => set('quantity', e.target.value)}
                      className="input-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-chrome text-xs
                    font-medium mb-2">
                    Dimensions in cm (optional)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['length_cm','width_cm','height_cm'].map((key, i) => (
                      <input
                        key={key}
                        type="number" min="0"
                        value={form[key]}
                        onChange={(e) => set(key, e.target.value)}
                        placeholder={['L','W','H'][i]}
                        className="input-base text-center text-sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-ember">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider mb-4">
                Vehicle Type
              </p>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => set('vehicle_type', value)}
                    className={`p-4 rounded-xl border text-left
                      transition-all ${
                      form.vehicle_type === value
                        ? 'border-ember bg-ember/10'
                        : 'border-white/6 bg-surface'
                    }`}
                  >
                    <p className="text-sand text-sm mb-0.5">{label}</p>
                    <p className="text-chrome text-xs">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn-ghost flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={handleEstimate}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" />
                  Calculating...</>
                ) : (
                  <>Get Estimate <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && estimate && (
          <div className="space-y-4">
            <div className="card-ember">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider mb-4">
                Route
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-ember mt-1.5
                    flex-shrink-0" />
                  <div>
                    <p className="text-chrome text-xs">Pickup</p>
                    <p className="text-sand text-sm">{form.pickup_address}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-sand-dim mt-1.5
                    flex-shrink-0" />
                  <div>
                    <p className="text-chrome text-xs">Dropoff</p>
                    <p className="text-sand text-sm">{form.dropoff_address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-ember">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider mb-4">
                Fare Breakdown
              </p>
              <div className="space-y-2.5">
                {[
                  ['Base Fare',    estimate.breakdown.base_fare],
                  ['Distance',     estimate.breakdown.distance_fare],
                  ['Weight',       estimate.breakdown.weight_fare],
                  ['Insurance',    estimate.breakdown.insurance_fee],
                  ['Platform Fee', estimate.breakdown.platform_fee],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-chrome text-sm">{k}</span>
                    <span className="text-sand text-sm">
                      {formatCurrency(v)}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-white/8
                  flex justify-between">
                  <span className="font-display font-black text-sand">
                    Total
                  </span>
                  <span className="font-display text-2xl font-black
                    text-ember">
                    {formatCurrency(estimate.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-ghost
                flex items-center gap-2">
                <ArrowLeft size={16} />
                Back
              </button>
              <button onClick={() => setStep(4)} className="btn-primary flex-1">
                Proceed to Payment <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Payment ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="card-ember">
              <p className="text-chrome text-xs font-medium uppercase
                tracking-wider mb-4">
                Payment Method
              </p>
              <div className="space-y-3">
                {[
                  { value: 'card',   label: '💳 Debit / Credit Card',
                    desc: 'Pay via Paystack' },
                  { value: 'wallet', label: '👜 VIOdrive Wallet',
                    desc: 'Pay from balance' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => set('payment_method', value)}
                    className={`w-full flex items-center gap-4 p-4
                      rounded-xl border text-left transition-all ${
                      form.payment_method === value
                        ? 'border-ember bg-ember/8'
                        : 'border-white/6 bg-surface'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sand text-sm font-semibold">
                        {label}
                      </p>
                      <p className="text-chrome text-xs mt-0.5">{desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      form.payment_method === value
                        ? 'border-ember bg-ember'
                        : 'border-chrome'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-ghost
                flex items-center gap-2">
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" />
                  Processing...</>
                ) : (
                  <>
                    {form.payment_method === 'card'
                      ? `Pay ${estimate ? formatCurrency(estimate.total_amount) : ''}`
                      : 'Confirm Shipment'
                    }
                    <CreditCard size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
