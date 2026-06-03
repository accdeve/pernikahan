import * as React from 'react'

interface GiftAccount {
  bank: string
  accountNumber: string
  accountName: string
}

interface ClosingProps {
  groomName: string
  brideName: string
  giftAccounts?: GiftAccount[]
}

export function Closing({ groomName, brideName, giftAccounts = [] }: ClosingProps) {
  const handleCopy = (accountNumber: string) => {
    navigator.clipboard
      .writeText(accountNumber.replace(/\s/g, ''))
      .then(() => {
        const toast = document.getElementById('copy-toast-editorial')
        if (toast) {
          toast.classList.add('show')
          setTimeout(() => toast.classList.remove('show'), 2000)
        }
      })
      .catch((err) => console.error('Failed to copy:', err))
  }

  return (
    <section className="editorial-closing-section">
      <div
        className="closing-bg-image"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80)`,
        }}
      />
      <div className="closing-overlay" />
      <div className="closing-content">
        <span className="closing-subtitle">THANK YOU</span>
        <h2 className="closing-title">
          {groomName} & {brideName}
        </h2>
        <div className="closing-line" />
        <p className="closing-desc">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i
          berkenan hadir untuk memberikan doa restu kepada kedua putra-putri kami.
        </p>
        <p className="closing-names">
          {groomName} & {brideName}
        </p>
      </div>

      {giftAccounts.length > 0 && (
        <div className="registry-grid" style={{ marginTop: '80px' }}>
          {giftAccounts.map((gift, index) => (
            <div key={index} className="registry-card">
              <div className="registry-card-header">
                <div>
                  <span className="registry-card-label">REKENING</span>
                  <p className="registry-card-bank">{gift.bank}</p>
                </div>
              </div>
              <p className="registry-number-label">NOMOR REKENING</p>
              <p id={`registry-number-${index}`} className="registry-number">
                {gift.accountNumber}
              </p>
              <p className="registry-card-label">NAMA REKENING</p>
              <p className="registry-card-bank" style={{ fontSize: '16px' }}>
                {gift.accountName}
              </p>
              <button
                className="btn-copy"
                onClick={() => handleCopy(gift.accountNumber)}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                SALIN NOMOR
              </button>
            </div>
          ))}
        </div>
      )}

      <div id="copy-toast-editorial" className="copy-toast-editorial">
        Nomor berhasil disalin!
      </div>
    </section>
  )
}
