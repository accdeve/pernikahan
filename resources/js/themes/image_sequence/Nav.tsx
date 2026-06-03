import * as React from 'react'

interface NavProps {
  activeSection?: string
  onNavClick?: (sectionId: string) => void
}

export function Nav({ activeSection = 'cover', onNavClick }: NavProps) {
  const sectionIds = ['cover', 'editorial-sequence-container', 'editorial-event', 'editorial-rsvp']

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    onNavClick?.(sectionId)
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="editorial-header">
        <a href="#cover" className="header-logo" onClick={(e) => handleNavClick(e, 'cover')}>
          W
        </a>
        <nav className="header-nav-links">
          {sectionIds.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={`editorial-nav-link ${activeSection === id ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, id)}
            >
              {id === 'cover'
                ? 'HOME'
                : id === 'editorial-sequence-container'
                  ? 'COUPLE'
                  : id === 'editorial-event'
                    ? 'EVENT'
                    : 'RSVP'}
            </a>
          ))}
        </nav>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="editorial-bottom-nav">
        {sectionIds.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className={`editorial-bottom-nav-btn ${activeSection === id ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, id)}
          >
            <span>
              {id === 'cover'
                ? '⌂'
                : id === 'editorial-sequence-container'
                  ? '♥'
                  : id === 'editorial-event'
                    ? '📍'
                    : '✉'}
            </span>
          </a>
        ))}
      </nav>
    </>
  )
}
