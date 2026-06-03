import React from 'react'
import { LoginForm } from '../../components/login-form.js'

export function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-[#0F0E0A] via-[#1A1813] to-[#0F0E0A] p-4 relative overflow-hidden font-sans">
      {/* Decorative premium elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#f2ca50]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#f2ca50]/5 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        <LoginForm />
      </div>
    </div>
  )
}
