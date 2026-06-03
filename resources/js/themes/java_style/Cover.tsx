import * as React from 'react'

interface CoverProps {
  groomName: string
  brideName: string
  weddingDate: string
  guestName?: string
  onOpen: () => void
}

export function Cover({ groomName, brideName, weddingDate, guestName, onOpen }: CoverProps) {
  return (
    <div className="cover-overlay" id="cover">
      <div className="cover-content">
        <div className="gunungan-mini-ornament" />

        <p className="javanese-label">Undangan Pernikahan</p>

        <h1 className="cover-names font-cursive text-gold">
          {groomName} &amp; {brideName}
        </h1>

        <p className="cover-date">{weddingDate}</p>

        {guestName && (
          <div className="guest-card">
            <p className="guest-label">Kepada Yth.</p>
            <p className="guest-prefix">Bapak/Ibu/Saudara/i</p>
            <p className="guest-name">{guestName}</p>
            <p className="guest-note">di Tempat</p>
          </div>
        )}

        <button
          id="btn-open-invitation"
          className="btn-primary-gold mt-8"
          onClick={onOpen}
          type="button"
        >
          Buka Undangan
        </button>
      </div>
    </div>
  )
}
