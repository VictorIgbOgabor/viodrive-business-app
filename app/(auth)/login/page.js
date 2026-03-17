'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Loader2, Building2 } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function BusinessLoginPage() {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.login(data)
      const { user, token } = res.data.data

      if (!['business', 'admin'].includes(user.role)) {
        return toast.error('This portal is for business accounts only.')
      }

      setAuth(user, token)
      toast.success(`Welcome back, ${user.first_name}!`)
      router.push('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center
      justify-center px-4 py-12">

      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full
          opacity-5"
          style={{ background: 'radial-gradient(circle, #E8450A, transparent)' }}
        />
      </div>

      <div className="w-full max-w-md animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-black tracking-tight">
            <span className="text-sand">VIO</span>
            <span className="text-ember">drive</span>
            <span className="text-ember">.</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1
            rounded-full bg-ember/10 border border-ember/20">
            <Building2 size={12} className="text-ember" />
            <span className="text-ember text-xs font-semibold uppercase
              tracking-wider">
              Business Portal
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="card-ember p-8">
          <h2 className="font-display text-xl font-black text-sand mb-1">
            Business Sign In
          </h2>
          <p className="text-chrome text-sm mb-8">
            Access your logistics dashboard
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sand-dim text-sm
                font-medium mb-2">
                Business Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="business@company.com"
                className="input-base"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sand-dim text-sm
                font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input-base pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                    text-chrome hover:text-sand transition-colors"
                >
                  {showPw
                    ? <EyeOff size={16} />
                    : <Eye size={16} />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-chrome text-xs">
              Not a business account?
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          
            href={`${process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || '#'}`}
            className="btn-ghost w-full text-center"
          >
            Go to Customer App
          </a>
        </div>

        <p className="text-center text-chrome text-xs mt-6">
          Need a business account?{' '}
          <a href="mailto:business@viodrive.com"
            className="text-ember hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
