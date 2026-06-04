import React from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils.js'
import { Button } from './ui/button.js'
import { Input } from './ui/input.js'
import { Label } from './ui/label.js'
import { supabase } from '../lib/supabase-client.js'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err === 'no_organization') {
      setError('Akun Google Anda belum terhubung dengan organisasi terdaftar. Silakan hubungi administrator atau daftarkan organisasi baru.')
    }

    const stateData = location.state as { infoMessage?: string } | null
    if (stateData?.infoMessage) {
      setInfo(stateData.infoMessage)
    }
  }, [location])

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      })
      if (authError) throw authError
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat masuk dengan Google.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      const userEmail = data.user?.email?.toLowerCase()
      const isAdmin = userEmail === 'admin@ablarsy.com' || data.user?.user_metadata?.role === 'admin'

      if (isAdmin) {
        navigate('/admin')
      } else {
        // Get slug_wo from user metadata
        const slugWo = data.user?.user_metadata?.wo_slug || data.user?.user_metadata?.slug_wo
        if (slugWo) {
          navigate(`/admin/${slugWo}`)
        } else {
          setError('Akun tidak memiliki akses organisasi. Hubungi administrator.')
          setLoading(false)
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col w-full gap-5', className)} {...props}>
      <div className="space-y-1.5 mb-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
          Selamat datang kembali
        </h1>
        <p className="text-sm text-[#6E6E6C]">
          Silakan masukkan detail akun Anda
        </p>
      </div>

      {info && (
        <div className="p-3 mb-1 rounded-lg bg-[#E8F5E9] border border-[#C6F6D5] text-[#2E7D32] text-xs font-medium text-center animate-fade-in">
          {info}
        </div>
      )}

      {error && (
        <div className="p-3 mb-1 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium text-center animate-shake">
          {error}
        </div>
      )}

      {/* Google Login at the top */}
      <Button
        type="button"
        disabled={loading}
        onClick={handleGoogleLogin}
        className="w-full border border-[#E2E2E0] bg-transparent hover:bg-[#FAF9F6] text-[#111111] font-semibold text-sm h-10 transition-all flex items-center justify-center gap-2 rounded-lg"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Masuk dengan Google
      </Button>

      {/* Divider */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#E2E2E0]/70" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-[#A3A3A3] text-[10px] font-semibold tracking-wider">atau</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-semibold text-[#111111] uppercase tracking-wider"
          >
            Alamat Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111] rounded-lg h-10"
          />
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-semibold text-[#111111] uppercase tracking-wider"
          >
            Kata Sandi
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111] rounded-lg h-10"
          />
        </div>

        <div className="flex items-center justify-between text-xs py-1">
          <label className="flex items-center gap-2 cursor-pointer text-[#6E6E6C] select-none">
            <input
              type="checkbox"
              className="rounded border-[#E2E2E0] text-[#111111] focus:ring-[#111111] w-4 h-4"
            />
            <span>Ingat saya selama 30 hari</span>
          </label>
          <a href="#" className="font-semibold text-[#2563EB] hover:underline">
            Lupa kata sandi?
          </a>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm h-10 transition-all shadow-sm rounded-lg disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>

      <div className="mt-2 text-center text-xs text-[#6E6E6C]">
        Belum memiliki akun?{' '}
        <Link
          to="/signup"
          className="font-semibold text-[#2563EB] hover:underline"
        >
          Daftar Sekarang
        </Link>
      </div>
    </div>
  )
}
