import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils.js'
import { Button } from './ui/button.js'
import { Input } from './ui/input.js'
import { Label } from './ui/label.js'
import { supabase } from '../lib/supabase-client.js'

export function OtpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Retrieve email and registration payload from state (or sessionStorage fallback)
  const locationState = location.state as { email?: string; password?: string; woName?: string; woLocation?: string; staffName?: string } | null
  const sessionBackup = React.useMemo(() => {
    try {
      const raw = sessionStorage.getItem('otp_signup_data')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }, [])
  const stateData = locationState || sessionBackup
  
  const [email, setEmail] = useState(stateData?.email || '')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [resending, setResending] = useState(false)
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Timer countdown for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendTimer])

  // Session recovery: If email is empty, try to recover from Supabase session
  useEffect(() => {
    const recoverSession = async () => {
      if (!email && stateData?.email) {
        setEmail(stateData.email)
        return
      }
      if (!email) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setEmail(session.user.email)
        }
      }
    }
    recoverSession()
  }, [])

  // Handle OTP digit changes
  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return // Allow only single digit numbers

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
  }

  // Handle backspace key to go to previous input
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  // Handle OTP pasting
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(pastedData)) return

    const digits = pastedData.split('')
    setOtp(digits)
    inputRefs[5].current?.focus()
  }

  // Handle OTP submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    const otpCode = otp.join('')
    if (otpCode.length < 6) {
      setError('Silakan masukkan 6 digit kode OTP lengkap.')
      return
    }

    if (!email) {
      setError('Sesi tidak valid. Silakan daftar ulang.')
      return
    }

    setLoading(true)

    try {
      // 1. Call verify-otp Edge Function via fetch to read exact error responses
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ email: email.toLowerCase(), otp: otpCode })
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Verifikasi OTP gagal.')
      }

      setSuccess('Verifikasi berhasil! Menyiapkan dashboard Anda...')
      sessionStorage.removeItem('otp_signup_data')

      if (resData.needsPasswordReauth) {
        setTimeout(() => {
          navigate('/login', { state: { infoMessage: 'Registrasi selesai. Silakan masuk dengan email dan kata sandi Anda.' } })
        }, 1500)
      } else {
        navigate(resData.redirectPath || `/admin/${resData.slug}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verifikasi OTP gagal.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0 || resending) return
    setError(null)
    setSuccess(null)
    setResending(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wo-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password: stateData?.password || '',
          woName: stateData?.woName || 'Organisasi Baru',
          woLocation: stateData?.woLocation || '',
          staffName: stateData?.staffName || ''
        })
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal mengirim ulang OTP.')
      }

      setSuccess('Kode OTP baru telah berhasil dikirim.')
      setResendTimer(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs[0].current?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim ulang OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className={cn('flex flex-col w-full gap-5', className)} {...props}>
      <div className="space-y-1.5 mb-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
          Verifikasi OTP
        </h1>
        <p className="text-sm text-[#6E6E6C]">
          Masukkan 6 digit kode OTP yang telah dikirimkan ke email <span className="font-semibold text-[#111111]">{email}</span>.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-1 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-1 rounded-lg bg-[#E8F5E9] border border-[#C6F6D5] text-[#2E7D32] text-xs font-medium text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {!stateData?.email && (
          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider">
              Alamat Email Pendaftaran
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111] rounded-lg h-10"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider mb-1">
            Kode Keamanan
          </Label>
          <div className="flex justify-between gap-2.5">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-bold border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111] rounded-xl bg-white shadow-sm"
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || otp.some(d => !d)}
          className="w-full bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm h-10 transition-all shadow-sm rounded-lg disabled:opacity-50"
        >
          {loading ? 'Memverifikasi...' : 'Verifikasi & Daftar'}
        </Button>
      </form>

      <div className="mt-2 text-center text-xs text-[#6E6E6C]">
        Tidak menerima kode?{' '}
        {resendTimer > 0 ? (
          <span className="text-[#6E6E6C] font-medium">Kirim ulang dalam {resendTimer} detik</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-[#2563EB] hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            {resending ? 'Mengirim...' : 'Kirim Ulang'}
          </button>
        )}
      </div>
    </div>
  )
}
