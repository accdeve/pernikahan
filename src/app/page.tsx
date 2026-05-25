'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { getMockInvitations } from '@/services/mockData'

export default function LandingPage() {
  const invitations = getMockInvitations()

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    
    body.classList.add('theme-landing')
    
    // Dynamically override global scroll lock for landing page
    html.style.overflow = 'auto'
    body.style.overflow = 'auto'
    html.style.height = 'auto'
    body.style.height = 'auto'
    
    return () => {
      body.classList.remove('theme-landing')
      html.style.overflow = ''
      body.style.overflow = ''
      html.style.height = ''
      body.style.height = ''
    }
  }, [])

  return (
    <div className="landing-showcase w-full">
      {/* Ambient Background Lighting */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      {/* Header Section */}
      <header className="landing-header">
        <div className="decor-circle">
          <span className="material-symbols-outlined">favorite</span>
        </div>
        <h1 className="landing-title">Undangan Pernikahan</h1>
        <p className="landing-subtitle">Galeri Tema Eksklusif &amp; Elegan</p>
        
        {/* Dynamic Template Counter Badge */}
        <div className="badge-container">
          <span className="template-badge">
            <span className="badge-pulse"></span>
            {invitations.length} Desain Premium Tersedia
          </span>
        </div>
      </header>

      {/* Showcase Grid */}
      <div className="showcase-grid">
        {invitations.map((invitation) => {
          const isModern = invitation.style === 'image_sequence'
          const routePath = isModern 
            ? `/modern/${invitation.slug}` 
            : `/java/${invitation.slug}`
          
          return (
            <div 
              key={invitation.id}
              className={`showcase-card ${isModern ? 'card-modern' : 'card-traditional'}`}
            >
              {/* Card Decorative Border Glow */}
              <div className="card-border-glow"></div>
              
              <div className="card-image-section">
                {isModern ? (
                  /* Modern Editorial Visual Placeholder */
                  <div className="visual-placeholder modern-visual">
                    <span className="material-symbols-outlined">auto_stories</span>
                    <div className="placeholder-caption">Modern Editorial</div>
                  </div>
                ) : (
                  /* Traditional Javanese Visual Placeholder */
                  <div className="visual-placeholder traditional-visual">
                    <span className="material-symbols-outlined">temple_hindu</span>
                    <div className="placeholder-caption">Javanese Heritage</div>
                  </div>
                )}
                
                <div className="style-tag">
                  {isModern ? 'Elegance Editorial' : 'Royal Traditional'}
                </div>
              </div>

              <div className="card-content-section">
                <h2 className="card-couple-names">
                  {invitation.brideNickname} &amp; {invitation.groomNickname}
                </h2>
                <p className="card-description">
                  {isModern 
                    ? 'Desain minimalis berestetika majalah mode dengan alur sekuen foto sinematik yang modern dan berkelas.'
                    : 'Desain klasik penuh keanggunan keraton Jawa dengan ornamen gunungan emas yang agung dan sakral.'
                  }
                </p>

                <div className="card-metadata">
                  <div className="meta-item">
                    <span className="material-symbols-outlined">location_on</span>
                    <span>{invitation.eventLocation}</span>
                  </div>
                  <div className="meta-item">
                    <span className="material-symbols-outlined">music_note</span>
                    <span>{isModern ? 'Instrumental Piano' : 'Gamelan Klasik'}</span>
                  </div>
                </div>

                <Link href={routePath} className="btn-select-theme">
                  <span>Buka Undangan</span>
                  <span className="material-symbols-outlined btn-arrow">arrow_forward</span>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Admin Quick Access and Info Footer */}
      <footer className="landing-footer">
        <p>Ingin mengelola data undangan ini?</p>
        <div className="admin-quick-access">
          <Link href="/admin" className="btn-admin-access">
            <span className="material-symbols-outlined">admin_panel_settings</span>
            <span>Masuk ke Dashboard Admin</span>
          </Link>
        </div>
        <div className="admin-credentials-hint">
          <p><strong>Demo Mode:</strong> Email: <code>admin@pernikahan.com</code> | Password: <code>admin12345</code></p>
        </div>
      </footer>
    </div>
  )
}
