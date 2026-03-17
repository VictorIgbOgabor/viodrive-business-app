import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import {
  formatCurrency, formatDate,
  getStatusBadgeClass, getStatusLabel,
  getVehicleLabel
} from '@/lib/helpers'

export default function ShipmentRow({ order }) {
  return (
    <Link href={`/shipments/${order.id}`}>
      <div className="flex items-center gap-4 p-4 rounded-xl
        border border-white/5 bg-carbon hover:border-ember/20
        hover:bg-ember/3 transition-all group cursor-pointer">

        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          order.status === 'delivered'  ? 'bg-green-400' :
          order.status === 'in_transit' ? 'bg-ember'     :
          order.status === 'cancelled'  ? 'bg-red-400'   :
          'bg-chrome'
        }`} />

        {/* Waybill */}
        <div className="w-36 flex-shrink-0">
          <p className="font-display text-xs font-black text-ember
            tracking-wider truncate">
            {order.waybill_number}
          </p>
          <p className="text-chrome text-xs mt-0.5">
            {formatDate(order.created_at)}
          </p>
        </div>

        {/* Route */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full
              bg-ember flex-shrink-0" />
            <p className="text-sand text-xs truncate">
              {order.pickup_address}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full
              bg-sand-dim flex-shrink-0" />
            <p className="text-chrome text-xs truncate">
              {order.dropoff_address}
            </p>
          </div>
        </div>

        {/* Package type */}
        <div className="hidden md:block w-28 flex-shrink-0">
          <p className="text-sand-dim text-xs capitalize">
            {order.package_type?.replace('_', ' ')}
          </p>
          <p className="text-chrome text-xs mt-0.5">
            {getVehicleLabel(order.vehicle_type)}
          </p>
        </div>

        {/* Status badge */}
        <div className="w-28 flex-shrink-0">
          <span className={`badge ${getStatusBadgeClass(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Amount */}
        <div className="w-24 text-right flex-shrink-0">
          <p className="font-display text-sm font-black text-sand">
            {formatCurrency(order.total_amount)}
          </p>
        </div>

        <ArrowRight size={14} className="text-chrome flex-shrink-0
          group-hover:text-ember group-hover:translate-x-0.5
          transition-all" />
      </div>
    </Link>
  )
}
