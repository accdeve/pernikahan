import React from 'react'
import { SignupForm } from '../../components/signup-form.js'

export function SignupPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-[#0F0E0A] via-[#1A1813] to-[#0F0E0A] p-6 relative overflow-hidden font-sans">
      {/* Decorative premium elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#f2ca50]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#f2ca50]/5 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-[540px] relative z-10 animate-fade-in my-8">
        <SignupForm />
      </div>
    </div>
  )
}