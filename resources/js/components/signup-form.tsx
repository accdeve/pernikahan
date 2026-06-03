import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils.js'
import { Button } from './ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.js'
import { Input } from './ui/input.js'
import { Label } from './ui/label.js'
import { supabase } from '../lib/supabase-client.js'

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('staffEmail') as string
    const password = formData.get('password') as string
    const woName = formData.get('woName') as string
    const woLocation = formData.get('woLocation') as string
    const staffName = formData.get('staffName') as string

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('wo-signup', {
        body: { email, password, woName, woLocation, staffName },
      })

      if (invokeError) throw invokeError

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      navigate(`/admin/${data.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-[#E2E2E0] shadow-md bg-white">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <span className="material-symbols-outlined text-4xl text-[#111111] font-light">
              business
            </span>
          </div>
          <CardTitle className="text-2xl font-serif font-medium tracking-tight text-[#111111]">
            Registrasi WO Baru
          </CardTitle>
          <CardDescription className="text-xs text-[#6E6E6C] font-sans mt-1">
            Daftarkan Wedding Organizer & Buat Akun Staff Admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 mb-4 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider border-b border-[#E2E2E0]/50 pb-1.5 mb-2">
                Informasi Wedding Organizer
              </h3>

              <div className="grid gap-1">
                <Label
                  htmlFor="woName"
                  className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
                >
                  Nama Wedding Organizer
                </Label>
                <Input
                  id="woName"
                  name="woName"
                  type="text"
                  placeholder="Contoh: Royal Wedding Organizer"
                  required
                  className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
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
                  required
                  className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider border-b border-[#E2E2E0]/50 pb-1.5 mb-2">
                Akun Staff Utama (Admin)
              </h3>

              <div className="grid gap-1">
                <Label
                  htmlFor="staffName"
                  className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
                >
                  Nama Lengkap Staff
                </Label>
                <Input
                  id="staffName"
                  name="staffName"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
                />
              </div>

              <div className="grid gap-1">
                <Label
                  htmlFor="staffEmail"
                  className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
                >
                  Email Login Staff
                </Label>
                <Input
                  id="staffEmail"
                  name="staffEmail"
                  type="email"
                  placeholder="admin@royalwo.com"
                  required
                  className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
                />
              </div>

              <div className="grid gap-1">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm h-10 transition-all shadow-sm mt-2 disabled:opacity-50"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar & Masuk Dashboard'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#6E6E6C] border-t border-[#E2E2E0]/50 pt-4">
            Sudah memiliki akun?{' '}
            <a
              href="/login"
              className="underline underline-offset-4 font-semibold text-[#111111] hover:text-[#333333]"
            >
              Masuk Sesi
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}