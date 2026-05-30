import React from 'react'
import { cn } from '../lib/utils.js'
import { Button } from './ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.js'
import { Input } from './ui/input.js'
import { Label } from './ui/label.js'

export function SignupForm({
  csrfToken,
  flashError,
  flashData,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  csrfToken: string
  flashError?: string
  flashData?: any
}) {
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
          {flashError && (
            <div className="p-3 mb-4 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium text-center">
              {flashError}
            </div>
          )}

          <form action="/admin/signup" method="POST" className="space-y-5">
            <input type="hidden" name="_csrf" value={csrfToken} />

            {/* Section 1: WO Details */}
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
                  defaultValue={flashData?.woName || ''}
                  required
                  className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
                />
              </div>

              <div className="grid gap-1">
                <Label
                  htmlFor="woEmail"
                  className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider"
                >
                  Email Resmi WO
                </Label>
                <Input
                  id="woEmail"
                  name="woEmail"
                  type="email"
                  placeholder="info@royalwo.com"
                  defaultValue={flashData?.woEmail || ''}
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
                  defaultValue={flashData?.woLocation || ''}
                  required
                  className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
                />
              </div>
            </div>

            {/* Section 2: Admin Staff Details */}
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
                  defaultValue={flashData?.staffName || ''}
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
                  defaultValue={flashData?.staffEmail || ''}
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
              className="w-full bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm h-10 transition-all shadow-sm mt-2"
            >
              Daftar & Masuk Dashboard
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#6E6E6C] border-t border-[#E2E2E0]/50 pt-4">
            Sudah memiliki akun?{' '}
            <a
              href="/admin/royal-wo/login"
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
