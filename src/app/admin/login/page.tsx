'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If already logged in, bypass login
    const isLoggedIn = localStorage.getItem('is_admin_logged_in') === 'true'
    if (isLoggedIn) {
      router.push('/admin')
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@pernikahan.com' && password === 'admin12345') {
      localStorage.setItem('is_admin_logged_in', 'true')
      router.push('/admin')
    } else {
      setError('Email atau password administrator salah')
    }
  }

  return (
    <div 
      className="app-container"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #15110a 0%, #080604 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="landing-showcase max-w-sm px-4">
        {/* Header */}
        <header className="landing-header mb-8">
          <div className="decor-circle">
            <span className="material-symbols-outlined">admin_panel_settings</span>
          </div>
          <h1 className="landing-title" style={{ fontSize: '2rem' }}>Admin Panel</h1>
          <p className="landing-subtitle" style={{ fontSize: '0.75rem', letterSpacing: '0.2em' }}>Kelola Undangan Pernikahan</p>
        </header>

        {/* Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div 
                className="p-3 rounded text-center" 
                style={{
                  backgroundColor: 'rgba(229, 115, 115, 0.1)',
                  border: '1px solid rgba(229, 115, 115, 0.3)',
                  color: '#e57373',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group space-y-2">
              <label className="font-label-caps text-on-surface-variant block" style={{ fontSize: '0.7rem' }}>EMAIL ADMINISTRATOR</label>
              <input 
                type="email" 
                className="form-control-heritage" 
                placeholder="admin@pernikahan.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group space-y-2">
              <label className="font-label-caps text-on-surface-variant block" style={{ fontSize: '0.7rem' }}>PASSWORD</label>
              <input 
                type="password" 
                className="form-control-heritage" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button className="btn-send-heritage mt-6 w-full" type="submit">
              <span className="material-symbols-outlined text-on-primary">login</span>
              <span className="font-label-caps text-on-primary">MASUK DASHBOARD</span>
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="btn-admin-access" style={{ padding: '0.5rem 1rem' }}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Inline fallback Link component since we are using 'next/link'
import Link from 'next/link'
