import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { cn } from '../lib/utils.js'
import { Button } from './ui/button.js'
import { Input } from './ui/input.js'
import { Label } from './ui/label.js'
import { supabase } from '../lib/supabase-client.js'

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [popupError, setPopupError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isGoogleOAuth, setIsGoogleOAuth] = useState(false)
  const [step, setStep] = useState(1)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    const providerParam = params.get('provider')
    if (emailParam && providerParam === 'google') {
      setEmail(emailParam)
      setIsGoogleOAuth(true)
    }
  }, [])

  const handleNext = () => {
    const woNameEl = document.getElementById('woName') as HTMLInputElement
    const woLocationEl = document.getElementById('woLocation') as HTMLInputElement
    if (woNameEl?.checkValidity() && woLocationEl?.checkValidity()) {
      setStep(2)
    } else {
      woNameEl?.reportValidity() || woLocationEl?.reportValidity()
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const woName = formData.get('woName') as string
    const woLocation = formData.get('woLocation') as string
    const staffName = formData.get('staffName') as string

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wo-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ email: email.toLowerCase(), password: password || '', woName, woLocation, staffName })
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Pendaftaran gagal.')
      }

      // Persist signup data to sessionStorage as backup (in case location.state is lost on refresh)
      const signupPayload = {
        email: email.toLowerCase(),
        password: password || '',
        woName,
        woLocation,
        staffName
      }
      sessionStorage.setItem('otp_signup_data', JSON.stringify(signupPayload))

      // Redirect to OTP verification page passing signup payload to state
      navigate('/otp', {
        state: signupPayload
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pendaftaran gagal.'
      if (response?.status === 401) {
        setPopupError(errorMessage)
        setShowErrorPopup(true)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col w-full gap-5', className)} {...props}>
      <div className="space-y-1.5 mb-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
          Buat Akun Baru
        </h1>
        <p className="text-sm text-[#6E6E6C]">
          Daftarkan organisasi Anda dan mulai kelola undangan pernikahan
        </p>
      </div>

      {error && (
        <div className="p-3 mb-1 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex gap-1.5 mb-2">
          <div
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              step >= 1 ? 'bg-[#111111]' : 'bg-[#E2E2E0]'
            }`}
          />
          <div
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              step >= 2 ? 'bg-[#111111]' : 'bg-[#E2E2E0]'
            }`}
          />
        </div>

        {/* Step 1: Informasi Organisasi / Bisnis */}
        <div className={`space-y-4 ${step === 1 ? 'block animate-fade-in' : 'hidden'}`}>
          <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider border-b border-[#E2E2E0]/70 pb-1.5 mb-2">
            Informasi Organisasi / Bisnis
          </h3>

          <div className="grid gap-1">
            <Label
              htmlFor="woName"
              className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
            >
              Nama Organisasi
            </Label>
            <Input
              id="woName"
              name="woName"
              type="text"
              placeholder="Contoh: Royal Wedding Organizer"
              required={step === 1}
              className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111] rounded-lg h-10"
            />
          </div>

          <div className="grid gap-1">
            <Label
              htmlFor="woLocation"
              className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
            >
              Domisili / Kota
            </Label>
            <Input
              id="woLocation"
              name="woLocation"
              type="text"
              placeholder="Contoh: Yogyakarta"
              required={step === 1}
              className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111] rounded-lg h-10"
            />
          </div>

          <Button
            type="button"
            onClick={handleNext}
            className="w-full bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm h-10 transition-all shadow-sm mt-4 rounded-lg"
          >
            Lanjut
          </Button>
        </div>

        {/* Step 2: Informasi Akun Utama */}
        <div className={`space-y-4 ${step === 2 ? 'block animate-fade-in' : 'hidden'}`}>
          <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider border-b border-[#E2E2E0]/70 pb-1.5 mb-2">
            Informasi Akun Utama
          </h3>

          <div className="grid gap-1">
            <Label
              htmlFor="staffName"
              className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
            >
              Nama Lengkap
            </Label>
            <Input
              id="staffName"
              name="staffName"
              type="text"
              placeholder="Contoh: Budi Santoso"
              required={step === 2}
              className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111] rounded-lg h-10"
            />
          </div>

          <div className="grid gap-1">
            <Label
              htmlFor="staffEmail"
              className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
            >
              Alamat Email
            </Label>
            <Input
              id="staffEmail"
              name="staffEmail"
              type="email"
              placeholder="admin@email.com"
              required={step === 2}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || isGoogleOAuth}
              className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111] disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-[#FAF9F6] rounded-lg h-10"
            />
          </div>

          {!isGoogleOAuth && (
            <div className="grid gap-1">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
              >
                Kata Sandi
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required={step === 2 && !isGoogleOAuth}
                className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111] rounded-lg h-10"
              />
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 border border-[#E2E2E0] bg-transparent hover:bg-[#FAF9F6] text-[#111111] font-semibold text-sm h-10 transition-all rounded-lg"
            >
              Kembali
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm h-10 transition-all shadow-sm rounded-lg disabled:opacity-50"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar'}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-2 text-center text-xs text-[#6E6E6C]">
        Sudah memiliki akun?{' '}
        <Link
          to="/login"
          className="font-semibold text-[#2563EB] hover:underline"
        >
          Masuk
        </Link>
      </div>

      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111111] mb-2">Pendaftaran Gagal</h3>
            <p className="text-sm text-[#6E6E6C] mb-4">{popupError}</p>
            <Button onClick={() => setShowErrorPopup(false)} className="w-full bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm h-10 transition-all shadow-sm rounded-lg">Tutup</Button>
          </div>
        </div>
      )}
    </div>
  )
}