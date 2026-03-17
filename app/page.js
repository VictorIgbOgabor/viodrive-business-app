'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/helpers'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-display text-3xl font-black tracking-tight">
          <span className="text-sand">VIO</span>
          <span className="text-ember">drive</span>
          <span className="text-ember">.</span>
        </h1>
        <p className="text-chrome text-sm uppercase tracking-widest">
          Business
        </p>
        <div className="spinner" />
      </div>
    </div>
  )
}
