'use client'

import { useState } from 'react'
import {
  Building2, Mail, Phone, Globe,
  Save, Loader2, Check
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore()
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [profile, setProfile] = useState({
    first_name:     user?.first_name     || '',
    last_name:      user?.last_name      || '',
    email:          user?.email          || '',
    phone:          user?.phone          || '',
    business_name:  '',
    business_email: '',
    business_phone: '',
    business_address: '',
    industry:       '',
    rc_number:      '',
  })

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/users/me', {
        first_name: profile.first_name,
        last_name:  profile.last_name,
        phone:      profile.phone,
      })
      setSaved(true)
      toast.success('Settings saved successfully.')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      toast.error(err.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const sections = [
    {
      title: 'Personal Information',
      icon:  <Mail size={14} className="text-ember" />,
      fields: [
        { key: 'first_name', label: 'First Name',  type: 'text' },
        { key: 'last_name',  label: 'Last Name',   type: 'text' },
        { key: 'email',      label: 'Email',       type: 'email', disabled: true },
        { key: 'phone',      label: 'Phone',       type: 'tel'  },
      ],
    },
    {
      title: 'Business Information',
      icon:  <Building2 size={14} className="text-ember" />,
      fields: [
        { key: 'business_name',    label: 'Business Name',    type: 'text' },
        { key: 'rc_number',        label: 'RC Number (CAC)',  type: 'text' },
        { key: 'business_email',   label: 'Business Email',   type: 'email' },
        { key: 'business_phone',   label: 'Business Phone',   type: 'tel' },
        { key: 'industry',         label: 'Industry',         type: 'text' },
        { key: 'business_address', label: 'Business Address', type: 'text' },
      ],
    },
  ]

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account and business profile"
    >
      <div className="animate-fade-up max-w-2xl space-y-6">

        {/* ── Account Badge ── */}
        <div className="card-ember flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-ember/20 flex
            items-center justify-center font-display font-black
            text-ember text-xl flex-shrink-0">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <p className="text-sand font-display font-black text-lg">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-chrome text-sm">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 size={11} className="text-ember" />
              <span className="text-ember text-xs font-semibold
                uppercase tracking-wider">
                Business Account
              </span>
            </div>
          </div>
        </div>

        {/* ── Sections ── */}
        {sections.map(({ title, icon, fields }) => (
          <div key={title} className="card">
            <div className="flex items-center gap-2 mb-5">
              {icon}
              <p className="text-sand text-sm font-semibold">{title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ key, label, type, disabled }) => (
                <div key={key}
                  className={key === 'business_address' ? 'col-span-2' : ''}>
                  <label className="block text-chrome text-xs
                    font-medium mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={profile[key]}
                    onChange={(e) => !disabled && set(key, e.target.value)}
                    disabled={disabled}
                    className={`input-base ${disabled
                      ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ── Notification Preferences ── */}
        <div className="card">
          <p className="text-sand text-sm font-semibold mb-4">
            Notification Preferences
          </p>
          {[
            { label: 'Email notifications for new shipments', default: true },
            { label: 'Email notifications for deliveries',    default: true },
            { label: 'Weekly spending report',                default: false },
            { label: 'Driver assignment alerts',              default: true },
          ].map(({ label, default: def }) => (
            <label key={label} className="flex items-center justify-between
              py-3 border-b border-white/5 last:border-0 cursor-pointer">
              <span className="text-sand-dim text-sm">{label}</span>
              <div className="relative">
                <input
                  type="checkbox"
                  defaultChecked={def}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-surface rounded-full
                  peer peer-checked:bg-ember transition-colors
                  border border-white/10" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4
                  bg-white rounded-full transition-transform
                  peer-checked:translate-x-4" />
              </div>
            </label>
          ))}
        </div>

        {/* ── Save Button ── */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>

      </div>
    </DashboardLayout>
  )
}
