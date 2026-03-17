'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, CheckCircle,
  XCircle, Loader2, Download, ArrowLeft
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ordersAPI } from '@/lib/api'
import { parseCSV, formatCurrency } from '@/lib/helpers'
import toast from 'react-hot-toast'
import Link from 'next/link'

const CSV_TEMPLATE = `pickup_address,pickup_contact_name,pickup_contact_phone,dropoff_address,dropoff_contact_name,dropoff_contact_phone,package_type,weight_kg,vehicle_type
"123 Marina Road Lagos","John Doe","08011111111","45 Lekki Phase 1","Jane Smith","08022222222","document","0.5","bike"
"67 Victoria Island","Mike Johnson","08033333333","12 Ikeja GRA","Sarah Brown","08044444444","bulk_item","5","van"`

export default function BulkShipmentPage() {
  const router    = useRouter()
  const fileRef   = useRef(null)
  const [file,     setFile]     = useState(null)
  const [rows,     setRows]     = useState([])
  const [errors,   setErrors]   = useState([])
  const [loading,  setLoading]  = useState(false)
  const [results,  setResults]  = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f) => {
    if (!f || !f.name.endsWith('.csv')) {
      return toast.error('Please upload a CSV file.')
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result)
      const errs   = []
      const valid  = parsed.map((row, i) => {
        if (!row.pickup_address)  errs.push(`Row ${i+2}: Missing pickup address`)
        if (!row.dropoff_address) errs.push(`Row ${i+2}: Missing dropoff address`)
        if (!row.weight_kg)       errs.push(`Row ${i+2}: Missing weight`)
        return row
      })
      setRows(valid)
      setErrors(errs)
    }
    reader.readAsText(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (errors.length > 0) {
      return toast.error('Please fix CSV errors before submitting.')
    }
    setLoading(true)
    const succeeded = []
    const failed    = []

    for (const row of rows) {
      try {
        const res = await ordersAPI.create({
          pickup_address:        row.pickup_address,
          pickup_contact_name:   row.pickup_contact_name,
          pickup_contact_phone:  row.pickup_contact_phone,
          dropoff_address:       row.dropoff_address,
          dropoff_contact_name:  row.dropoff_contact_name,
          dropoff_contact_phone: row.dropoff_contact_phone,
          package_type:          row.package_type || 'other',
          weight_kg:             parseFloat(row.weight_kg),
          vehicle_type:          row.vehicle_type || 'bike',
          pickup_lat:            6.5244,
          pickup_lng:            3.3792,
          dropoff_lat:           6.5244,
          dropoff_lng:           3.3792,
          distance_km:           10,
          estimated_duration_min: 30,
          payment_method:        'wallet',
          quantity:              1,
        })
        succeeded.push(res.data.data.order.waybill_number)
      } catch (err) {
        failed.push({
          address: row.pickup_address,
          error:   err.message,
        })
      }
    }

    setResults({ succeeded, failed })
    setLoading(false)

    if (succeeded.length > 0) {
      toast.success(`${succeeded.length} shipment(s) created!`)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'viodrive-bulk-template.csv'
    a.click()
  }

  return (
    <DashboardLayout
      title="Bulk Shipment Upload"
      subtitle="Upload a CSV to create multiple waybills at once"
    >
      <div className="animate-fade-up max-w-2xl space-y-6">

        {/* ── Back ── */}
        <Link
          href="/shipments/new"
          className="inline-flex items-center gap-2 text-chrome
            hover:text-sand text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          Back to New Shipment
        </Link>

        {/* ── Template Download ── */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sand text-sm font-semibold mb-1">
              Download CSV Template
            </p>
            <p className="text-chrome text-xs">
              Use this format for your bulk upload
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <Download size={14} />
            Template
          </button>
        </div>

        {/* ── Upload Zone ── */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12
            text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-ember bg-ember/5'
              : 'border-white/10 hover:border-white/20 hover:bg-white/2'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <Upload size={32} className="text-chrome mx-auto mb-3" />
          {file ? (
            <>
              <p className="text-sand font-semibold">{file.name}</p>
              <p className="text-chrome text-sm mt-1">
                {rows.length} rows detected
              </p>
            </>
          ) : (
            <>
              <p className="text-sand text-sm font-semibold mb-1">
                Drop your CSV here or click to browse
              </p>
              <p className="text-chrome text-xs">
                Supports .csv files only
              </p>
            </>
          )}
        </div>

        {/* ── Validation Errors ── */}
        {errors.length > 0 && (
          <div className="card border-red-400/20">
            <p className="text-red-400 text-sm font-semibold mb-3">
              ⚠️ {errors.length} validation error(s)
            </p>
            <div className="space-y-1">
              {errors.map((err, i) => (
                <p key={i} className="text-chrome text-xs">{err}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── Preview Table ── */}
        {rows.length > 0 && !results && (
          <div className="card overflow-hidden">
            <p className="text-chrome text-xs font-medium uppercase
              tracking-wider mb-4">
              Preview — {rows.length} Shipments
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    {['#', 'Pickup', 'Dropoff', 'Type', 'Weight', 'Vehicle']
                      .map((h) => (
                        <th key={h} className="text-chrome font-medium
                          text-left pb-2 pr-4">
                          {h}
                        </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 8).map((row, i) => (
                    <tr key={i} className="border-b border-white/5
                      last:border-0">
                      <td className="py-2 pr-4 text-chrome">{i + 1}</td>
                      <td className="py-2 pr-4 text-sand max-w-32 truncate">
                        {row.pickup_address}
                      </td>
                      <td className="py-2 pr-4 text-sand max-w-32 truncate">
                        {row.dropoff_address}
                      </td>
                      <td className="py-2 pr-4 text-chrome capitalize">
                        {row.package_type}
                      </td>
                      <td className="py-2 pr-4 text-chrome">
                        {row.weight_kg}kg
                      </td>
                      <td className="py-2 text-chrome capitalize">
                        {row.vehicle_type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 8 && (
                <p className="text-chrome text-xs mt-3 text-center">
                  + {rows.length - 8} more rows
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {results && (
          <div className="card-ember space-y-4">
            <p className="font-display text-base font-black text-sand">
              Upload Complete
            </p>
            {results.succeeded.length > 0 && (
              <div>
                <p className="text-green-400 text-sm font-semibold mb-2">
                  ✅ {results.succeeded.length} Created Successfully
                </p>
                <div className="space-y-1">
                  {results.succeeded.map((wb) => (
                    <p key={wb} className="text-chrome text-xs
                      font-display tracking-wider">
                      {wb}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {results.failed.length > 0 && (
              <div>
                <p className="text-red-400 text-sm font-semibold mb-2">
                  ❌ {results.failed.length} Failed
                </p>
                {results.failed.map((f, i) => (
                  <p key={i} className="text-chrome text-xs">
                    {f.address} — {f.error}
                  </p>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push('/shipments')}
              className="btn-primary w-full"
            >
              View All Shipments
            </button>
          </div>
        )}

        {/* ── Submit ── */}
        {rows.length > 0 && !results && (
          <button
            onClick={handleSubmit}
            disabled={loading || errors.length > 0}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating {rows.length} Shipments...
              </>
            ) : (
              <>
                <FileText size={16} />
                Create {rows.length} Shipments
              </>
            )}
          </button>
        )}
      </div>
    </DashboardLayout>
  )
}
