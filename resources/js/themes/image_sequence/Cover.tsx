import * as React from 'react'

interface CoverProps {
  groomName: string
  brideName: string
  weddingDate: string
  onOpen: () => void
}

export function Cover({ groomName, brideName, weddingDate, onOpen }: CoverProps) {
  return (
    <section id="cover" className="editorial-cover">
      <div
        className="cover-bg-image"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80)`,
        }}
      />
      <div className="cover-overlay" />
      <div className="cover-content">
        <span className="cover-subtitle">WEDDING INVITATION</span>
        <h1 className="cover-title">
          {groomName} & {brideName}
        </h1>
        <div className="cover-divider" />
        <p className="cover-date">{weddingDate}</p>
        <div className="guest-card-editorial">
          <span className="guest-label">TO</span>
          <span className="guest-name">BELOVED GUEST</span>
        </div>
        <button id="btn-open-invitation" className="btn-open-editorial" onClick={onOpen}>
          BUKA UNDANGAN
        </button>
      </div>
    </section>
  )
}
