import * as React from 'react'

interface GiftAccount {
  type: 'bank' | 'wallet'
  name: string
  accountNumber: string
  holder: string
}

interface ClosingProps {
  groomName: string
  brideName: string
  bankAccounts?: GiftAccount[]
  walletAccounts?: GiftAccount[]
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  return (
    <button className="btn-copy-gold" onClick={handleCopy} type="button">
      {copied ? 'Tersalin!' : 'Salin'}
    </button>
  )
}

export function Closing({ groomName, brideName, bankAccounts = [], walletAccounts = [] }: ClosingProps) {
  const allGifts = [
    ...bankAccounts.map((a) => ({ ...a, icon: '🏦' })),
    ...walletAccounts.map((a) => ({ ...a, icon: '💳' })),
  ]

  return (
    <section id="closing" className="section-padding bg-surface-variant text-center">
      <div className="heritage-divider-gold" />

      <div className="section-title mb-6">
        <h2 className="font-cursive text-gold">Kado Pernikahan</h2>
        <p className="section-subtitle">Wishes</p>
      </div>

      <p className="gifts-description text-muted max-w-sm mx-auto mb-8">
        Tanpa mengurangi rasa hormat, bagi yang ingin memberikan kado pernikahan,
        silakan dapat dikirim melalui rekening berikut:
      </p>

      {allGifts.length > 0 ? (
        <div className="gifts-grid max-w-sm mx-auto">
          {allGifts.map((gift, index) => (
            <div key={index} className="gift-card glass-card">
              <div className="gift-icon">{gift.icon}</div>
              <h4 className="bank-name font-cursive text-gold">{gift.name}</h4>
              <p className="account-number">{gift.accountNumber}</p>
              <p className="account-holder text-muted">a.n. {gift.holder}</p>
              <CopyButton text={gift.accountNumber} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">Terima kasih atas doa dan restu Anda.</p>
      )}

      <div className="closing-prayer max-w-sm mx-auto">
        <div className="heritage-divider-gold mt-8" />

        <p className="prayer-text text-muted mt-6">
          "Semoga Allah menghimpun kalian dalam kebaikan dan menjadikanlah
          pernikahan kalian penuh berkah. Aamiin."
        </p>

        <div className="mt-8">
          <p className="sig-label text-muted">Yang berbahagia</p>
          <p className="sig-names font-cursive text-gold">
            {groomName} &amp; {brideName}
          </p>
          <p className="sig-families mt-4">Bersama keluarga besar</p>
        </div>
      </div>
    </section>
  )
}
