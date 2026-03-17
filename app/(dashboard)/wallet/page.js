'use client'

import { useEffect, useState } from 'react'
import {
  Wallet, ArrowUpRight, ArrowDownLeft,
  RefreshCw, TrendingUp
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { walletAPI } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/helpers'

const TX_LABELS = {
  order_payment:       'Order Payment',
  escrow_hold:         'Escrow Hold',
  escrow_release:      'Escrow Release',
  platform_commission: 'Platform Fee',
  wallet_topup:        'Wallet Top-up',
  refund:              'Refund',
  penalty_deduction:   'Penalty',
}

export default function WalletPage() {
  const [wallet,       setWallet]       = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState('')
  const [page,         setPage]         = useState(1)
  const [total,        setTotal]        = useState(0)
  const LIMIT = 20

  useEffect(() => {
    const init = async () => {
      try {
        const res = await walletAPI.getWallet()
        setWallet(res.data.data.wallet)
      } catch {} finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    fetchTx()
  }, [filter, page])

  const fetchTx = async () => {
    try {
      const params = { page, limit: LIMIT }
      if (filter) params.type = filter
      const res = await walletAPI.getTransactions(params)
      setTransactions(res.data.data.transactions)
      setTotal(res.data.total || 0)
    } catch {}
  }

  const totalPages = Math.ceil(total / LIMIT)

  if (loading) {
    return (
      <DashboardLayout title="Wallet">
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Wallet"
      subtitle="Manage your business balance"
    >
      <div className="animate-fade-up max-w-3xl space-y-6">

        {/* ── Balance Card ── */}
        <div className="relative overflow-hidden rounded-2xl p-7"
          style={{
            background: 'linear-gradient(135deg, #E8450A, #FF6B35)'
          }}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40
            rounded-full bg-white/5" />
          <div className="absolute -bottom-12 right-8 w-56 h-56
            rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-sand/70" />
                <span className="text-sand/70 text-sm">
                  Business Wallet
                </span>
              </div>
              <button
                onClick={async () => {
                  const res = await walletAPI.getWallet()
                  setWallet(res.data.data.wallet)
                }}
                className="p-1.5 rounded-lg bg-white/10
                  hover:bg-white/20 transition-all"
              >
                <RefreshCw size={14} className="text-sand" />
              </button>
            </div>
            <p className="font-display text-4xl font-black text-sand mb-1">
              {wallet ? formatCurrency(wallet.balance) : '₦0'}
            </p>
            <p className="text-sand/60 text-sm">
              {wallet?.currency || 'NGN'} · Available balance
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <ArrowDownLeft size={14} className="text-green-400" />
              <span className="text-chrome text-xs">Total Credits</span>
            </div>
            <p className="font-display text-xl font-black text-sand">
              {formatCurrency(
                transactions
                  .filter((t) => t.transaction_type === 'credit')
                  .reduce((s, t) => s + parseFloat(t.amount), 0)
              )}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpRight size={14} className="text-ember" />
              <span className="text-chrome text-xs">Total Spent</span>
            </div>
            <p className="font-display text-xl font-black text-sand">
              {formatCurrency(
                transactions
                  .filter((t) => t.transaction_type === 'debit')
                  .reduce((s, t) => s + parseFloat(t.amount), 0)
              )}
            </p>
          </div>
        </div>

        {/* ── Transactions ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-black text-sand">
              Transactions
            </h3>
            <div className="flex gap-2">
              {['', 'credit', 'debit'].map((v) => (
                <button
                  key={v}
                  onClick={() => { setFilter(v); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-xs
                    font-medium transition-all ${
                    filter === v
                      ? 'bg-ember text-sand'
                      : 'bg-surface text-chrome hover:text-sand'
                  }`}
                >
                  {v === '' ? 'All' : v === 'credit' ? 'Credits' : 'Debits'}
                </button>
              ))}
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="card text-center py-12">
              <TrendingUp size={32} className="text-chrome mx-auto mb-3" />
              <p className="text-sand font-medium">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="card flex items-center
                  justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center
                      justify-center flex-shrink-0 ${
                      tx.transaction_type === 'credit'
                        ? 'bg-green-500/10' : 'bg-ember/10'
                    }`}>
                      {tx.transaction_type === 'credit'
                        ? <ArrowDownLeft size={14}
                            className="text-green-400" />
                        : <ArrowUpRight size={14}
                            className="text-ember" />
                      }
                    </div>
                    <div>
                      <p className="text-sand text-sm font-medium">
                        {TX_LABELS[tx.reference_type] || tx.reference_type}
                      </p>
                      {tx.waybill_number && (
                        <p className="text-ember text-xs font-display
                          font-black tracking-wider mt-0.5">
                          {tx.waybill_number}
                        </p>
                      )}
                      <p className="text-chrome text-xs mt-0.5">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display text-sm font-black ${
                      tx.transaction_type === 'credit'
                        ? 'text-green-400' : 'text-ember'
                    }`}>
                      {tx.transaction_type === 'credit' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      tx.status === 'successful'
                        ? 'text-green-400/60' : 'text-chrome'
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-chrome text-sm">
                {page} / {totalPages}
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
        </div>
      </div>
    </DashboardLayout>
  )
}
