import Cookies from 'js-cookie'

// ─── Auth helpers ──────────────────────────────────────────
export const getUser  = () => {
  try {
    const u = Cookies.get('vio_biz_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}
export const getToken        = ()  => Cookies.get('vio_biz_token') || null
export const isAuthenticated = ()  => !!getToken()

// ─── Formatters ────────────────────────────────────────────
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style:                 'currency',
    currency:              'NGN',
    minimumFractionDigits: 0,
  }).format(amount || 0)

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))

export const formatDateShort = (date) =>
  new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))

// ─── Status helpers ────────────────────────────────────────
export const getStatusBadgeClass = (status) => ({
  pending:    'badge-pending',
  assigned:   'badge-assigned',
  arrived:    'badge-arrived',
  picked_up:  'badge-picked_up',
  in_transit: 'badge-in_transit',
  delivered:  'badge-delivered',
  returned:   'badge-returned',
  cancelled:  'badge-cancelled',
}[status] || 'badge-pending')

export const getStatusLabel = (status) => ({
  pending:    'Pending',
  assigned:   'Assigned',
  arrived:    'Driver Arrived',
  picked_up:  'Picked Up',
  in_transit: 'In Transit',
  delivered:  'Delivered',
  returned:   'Returned',
  cancelled:  'Cancelled',
}[status] || status)

// ─── Package & vehicle labels ──────────────────────────────
export const getPackageLabel = (type) => ({
  document:          '📄 Document',
  bulk_item:         '📦 Bulk Item',
  electronics:       '💻 Electronics',
  business_shipment: '🏢 Business Shipment',
  fragile:           '🔮 Fragile',
  perishable:        '🌡 Perishable',
  other:             '📫 Other',
}[type] || type)

export const getVehicleLabel = (type) => ({
  bike:  '🏍 Bike',
  car:   '🚗 Car',
  van:   '🚐 Van',
  truck: '🚛 Truck',
}[type] || type)

// ─── CSV parser for bulk uploads ───────────────────────────
export const parseCSV = (text) => {
  const lines  = text.trim().split('\n')
  const header = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim())
    return header.reduce((obj, key, i) => {
      obj[key] = vals[i] || ''
      return obj
    }, {})
  })
}

// ─── Chart color palette ───────────────────────────────────
export const CHART_COLORS = {
  ember:   '#E8450A',
  sand:    '#F5EFE6',
  chrome:  '#C8C4BC',
  green:   '#78C87A',
  amber:   '#FFB432',
  red:     '#FF7070',
  blue:    '#5B8DEF',
}
