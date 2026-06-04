import React, { useState, useEffect } from 'react'
import { LoginForm } from '../../components/login-form.js'
import { SignupForm } from '../../components/signup-form.js'
import { OtpForm } from '../../components/otp-form.js'

interface AuthPageProps {
  mode: 'login' | 'signup' | 'otp'
}

export function AuthPage({ mode }: AuthPageProps) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans bg-white overflow-hidden">
      {/* Left Column: Logo, Animating Forms, and Footer */}
      <div className="flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-20 min-h-screen relative z-10 bg-white">
        {/* Brand Logo Text */}
        <div className="flex items-center gap-2 mb-8 lg:mb-0">
          <span className="text-2xl font-bold tracking-tight text-[#111111] font-serif">
            Wednity.
          </span>
        </div>

        {/* Form Container with Premium Sliding Cross-Fade */}
        <div className="w-full max-w-[380px] mx-auto my-auto py-8 relative">
          <div className="relative w-full min-h-[380px]">
            {/* Login Form Layer */}
            <div
              className={`w-full transition-all duration-500 ease-in-out transform ${
                mode === 'login'
                  ? 'opacity-100 translate-x-0 scale-100 blur-0 relative z-10 pointer-events-auto'
                  : 'opacity-0 -translate-x-12 scale-95 blur-[2px] absolute inset-x-0 top-0 z-0 pointer-events-none'
              }`}
            >
              <LoginForm />
            </div>

            {/* Signup Form Layer */}
            <div
              className={`w-full transition-all duration-500 ease-in-out transform ${
                mode === 'signup'
                  ? 'opacity-100 translate-x-0 scale-100 blur-0 relative z-10 pointer-events-auto'
                  : 'opacity-0 translate-x-12 scale-95 blur-[2px] absolute inset-x-0 top-0 z-0 pointer-events-none'
              }`}
            >
              <SignupForm />
            </div>

            {/* OTP Form Layer */}
            <div
              className={`w-full transition-all duration-500 ease-in-out transform ${
                mode === 'otp'
                  ? 'opacity-100 translate-x-0 scale-100 blur-0 relative z-10 pointer-events-auto'
                  : 'opacity-0 translate-y-12 scale-95 blur-[2px] absolute inset-x-0 top-0 z-0 pointer-events-none'
              }`}
            >
              <OtpForm />
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="text-xs text-[#A3A3A3] mt-auto">
          © {new Date().getFullYear()} Wednity. Hak Cipta Dilindungi.
        </div>
      </div>

      {/* Right Column: Cinematic Ken Burns + Slow Cross-Fade Images */}
      <div className="hidden lg:block relative h-screen w-full overflow-hidden bg-[#F5F5F3]">
        {/* Login Image */}
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200"
          alt="Dekorasi Pernikahan Indah"
          className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-1000 ease-in-out ${
            mode === 'login' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />

        {/* Signup Image */}
        <img
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200"
          alt="Momen Pernikahan Bahagia"
          className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-1000 ease-in-out ${
            mode === 'signup' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />

        {/* OTP Image */}
        <img
          src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=1200"
          alt="Proses Verifikasi Keamanan"
          className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-1000 ease-in-out ${
            mode === 'otp' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />

        {/* Elegant Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-end p-16" />

        {/* Overlay Texts with Cinematic Transitions */}
        <div className="absolute bottom-16 left-16 right-16 z-10 text-white">
          <div
            className={`transition-all duration-700 ease-in-out transform ${
              mode === 'login'
                ? 'opacity-100 translate-y-0 scale-100 blur-0'
                : 'opacity-0 translate-y-4 scale-95 blur-[2px] absolute inset-x-0 bottom-0 pointer-events-none'
            }`}
          >
            <h2 className="text-3xl font-serif font-semibold mb-3 tracking-wide leading-tight">
              Wujudkan Pernikahan Impian Anda
            </h2>
            <p className="text-sm font-light text-white/80 max-w-md leading-relaxed">
              Kelola detail undangan pernikahan impian Anda secara praktis, indah, dan profesional dalam satu platform digital terpadu.
            </p>
          </div>

          <div
            className={`transition-all duration-700 ease-in-out transform ${
              mode === 'signup'
                ? 'opacity-100 translate-y-0 scale-100 blur-0'
                : 'opacity-0 translate-y-4 scale-95 blur-[2px] absolute inset-x-0 bottom-0 pointer-events-none'
            }`}
          >
            <h2 className="text-3xl font-serif font-semibold mb-3 tracking-wide leading-tight">
              Mulai Perjalanan Anda Bersama Wednity
            </h2>
            <p className="text-sm font-light text-white/80 max-w-md leading-relaxed">
              Daftarkan bisnis wedding organizer Anda sekarang dan tingkatkan kualitas pelayanan pengelolaan acara dengan teknologi terdepan.
            </p>
          </div>

          <div
            className={`transition-all duration-700 ease-in-out transform ${
              mode === 'otp'
                ? 'opacity-100 translate-y-0 scale-100 blur-0'
                : 'opacity-0 translate-y-4 scale-95 blur-[2px] absolute inset-x-0 bottom-0 pointer-events-none'
            }`}
          >
            <h2 className="text-3xl font-serif font-semibold mb-3 tracking-wide leading-tight">
              Keamanan Akun Anda Adalah Prioritas Kami
            </h2>
            <p className="text-sm font-light text-white/80 max-w-md leading-relaxed">
              Silakan masukkan kode OTP yang dikirimkan ke email Anda untuk menyelesaikan verifikasi kepemilikan akun sebelum masuk ke sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
