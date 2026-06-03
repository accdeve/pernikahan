import * as React from 'react'

interface NavProps {
  activeSection: string
  onNavigate: (sectionId: string) => void
}

const navItems = [
  { id: 'couple', label: 'Mempelai', icon: '💑' },
  { id: 'event', label: 'Acara', icon: '📅' },
  { id: 'story', label: 'Kisah', icon: '💕' },
  { id: 'gallery', label: 'Galeri', icon: '📷' },
  { id: 'rsvp', label: 'RSVP', icon: '✉️' },
  { id: 'closing', label: 'Kado', icon: '🎁' },
]

export function Nav({ activeSection, onNavigate }: NavProps) {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${activeSection === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
          type="button"
        >
          <span>{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
