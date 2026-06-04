import React from 'react'
import { LoginForm } from '../../components/login-form.js'

export function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans bg-white">
      {/* Left Column: Logo, Form, and Footer */}
      <div className="flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-20 min-h-screen">
        {/* Brand Logo Text */}
        <div className="flex items-center gap-2 mb-8 lg:mb-0">
          <span className="text-2xl font-bold tracking-tight text-[#111111] font-serif">
            Wednity.
          </span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[380px] mx-auto my-auto py-8">
          <LoginForm />
        </div>

        {/* Minimal Footer */}
        <div className="text-xs text-[#A3A3A3] mt-auto">
          © {new Date().getFullYear()} Wednity. Hak Cipta Dilindungi.
        </div>
      </div>

      {/* Right Column: Premium Cover Image with text overlay */}
      <div className="hidden lg:block relative h-screen w-full overflow-hidden bg-[#F5F5F3]">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200"
          alt="Dekorasi Pernikahan Indah"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
        {/* Dark elegant overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-end p-16" />
        <div className="absolute bottom-16 left-16 right-16 z-10 text-white">
          <h2 className="text-3xl font-serif font-semibold mb-3 tracking-wide leading-tight">
            Wujudkan Pernikahan Impian Anda
          </h2>
          <p className="text-sm font-light text-white/80 max-w-md leading-relaxed">
            Kelola detail undangan pernikahan impian Anda secara praktis, indah, dan profesional dalam satu platform digital terpadu.
          </p>
        </div>
      </div>
    </div>
  )
}

