import React from 'react'
import { cn } from '../lib/utils.js'
import { Button } from './ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.js'
import { Input } from './ui/input.js'
import { Label } from './ui/label.js'

export function LoginForm({
  slugWo,
  csrfToken,
  flashError,
  flashEmail,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  slugWo: string
  csrfToken: string
  flashError?: string
  flashEmail?: string
}) {
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
          {flashError && (
            <div className="p-3 mb-4 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium text-center">
              {flashError}
            </div>
          )}

          <form action={`/admin/${slugWo}/login`} method="POST" className="space-y-4">
            <input type="hidden" name="_csrf" value={csrfToken} />

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
                defaultValue={flashEmail || ''}
                required
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
                required
                className="border-[#E2E2E0] focus-visible:ring-[#111111]/5 focus-visible:border-[#111111]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm h-10 transition-all shadow-sm"
            >
              Masuk ke Dashboard
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#6E6E6C] border-t border-[#E2E2E0]/50 pt-4">
            Wedding Organizer baru?{' '}
            <a
              href="/admin/signup"
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
