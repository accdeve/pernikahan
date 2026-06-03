import React from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils.js'
import { Button } from './ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.js'
import { Input } from './ui/input.js'
import { Label } from './ui/label.js'
import { supabase } from '../lib/supabase-client.js'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

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
          setError('Akun tidak memiliki akses WO. Hubungi administrator.')
          setLoading(false)
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-[#E2E2E0] shadow-md bg-white">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <span className="material-symbols-outlined text-4xl text-[#111111] font-light">
              admin_panel_settings
            </span>
          </div>
          <CardTitle className="text-2xl font-serif font-medium tracking-tight text-[#111111]">
            Login Staff WO
          </CardTitle>
          <CardDescription className="text-xs text-[#6E6E6C] font-sans mt-1">
            Masuk ke panel pengelolaan Heritage Wedding
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 mb-4 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-[#111111] uppercase tracking-wider"
              >
                Email Staff
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@wo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
              />
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-[#111111] uppercase tracking-wider"
                >
                  Password
                </Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm h-10 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#6E6E6C] border-t border-[#E2E2E0]/50 pt-4">
            Wedding Organizer baru?{' '}
            <a
              href="/signup"
              className="underline underline-offset-4 font-semibold text-[#111111] hover:text-[#333333]"
            >
              Daftar Sekarang
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
