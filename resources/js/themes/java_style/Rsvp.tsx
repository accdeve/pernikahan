import * as React from 'react'
import { supabase } from '../../lib/supabase-client.js'

export interface GuestData {
  id: string
  name: string
  attendance?: 'hadir' | 'tidak' | null
  message?: string
  created_at: string
}

interface RsvpProps {
  invitationId: string
  guests: GuestData[]
  onRefreshGuests: () => void
}

export function Rsvp({ invitationId, guests, onRefreshGuests }: RsvpProps) {
  const [name, setName] = React.useState('')
  const [attendance, setAttendance] = React.useState<'hadir' | 'tidak' | ''>('')
  const [message, setMessage] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast('Nama harus diisi')
      return
    }
    if (!attendance) {
      showToast('Silakan pilih konfirmasi kehadiran')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('admin_guests').insert({
        invitation_id: invitationId,
        name: name.trim(),
        attendance,
        message: message.trim() || null,
      })

      if (error) throw error

      showToast('Terima kasih! Konfirmasi Anda telah tercatat')
      setName('')
      setAttendance('')
      setMessage('')
      onRefreshGuests()
    } catch (err) {
      console.error('RSVP error:', err)
      showToast('Gagal mengirim. Silakan coba lagi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section id="rsvp" className="section-padding text-center">
      <div className="heritage-divider-gold" />

      <div className="section-title mb-6">
        <h2 className="font-cursive text-gold">RSVP & Ucapan</h2>
        <p className="section-subtitle">Kehadiran & Doa</p>
      </div>

      <div className="rsvp-container max-w-sm mx-auto">
        <div className="glass-card">
          <h3 className="form-title font-cursive text-gold">Konfirmasi Kehadiran</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="rsvp-name">Nama</label>
              <input
                id="rsvp-name"
                type="text"
                className="form-control-heritage"
                placeholder="Nama lengkap Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kehadiran</label>
              <div className="attendance-grid">
                <label className="attendance-card">
                  <input
                    type="radio"
                    name="attendance"
                    value="hadir"
                    checked={attendance === 'hadir'}
                    onChange={() => setAttendance('hadir')}
                    disabled={isSubmitting}
                  />
                  <span>Hadir</span>
                  <div className="attendance-card-border" />
                </label>
                <label className="attendance-card">
                  <input
                    type="radio"
                    name="attendance"
                    value="tidak"
                    checked={attendance === 'tidak'}
                    onChange={() => setAttendance('tidak')}
                    disabled={isSubmitting}
                  />
                  <span>Tidak Hadir</span>
                  <div className="attendance-card-border" />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rsvp-message">Ucapan & Doa</label>
              <textarea
                id="rsvp-message"
                className="form-control-heritage"
                rows={3}
                placeholder="Tulis ucapan dan doa terbaik Anda..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="btn-send-heritage"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Mengirim...</span>
              ) : (
                <span>Kirim Konfirmasi</span>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8">
          <div className="flex-align-center-gap mb-6">
            <div className="flex-grow-line" />
            <span className="whitespace-nowrap text-muted font-label-caps">Buku Tamu</span>
            <div className="flex-grow-line" />
          </div>

          <div className="comments-container-heritage custom-scrollbar">
            {guests.length === 0 ? (
              <p className="text-muted">Belum ada ucapan. Jadilah yang pertama!</p>
            ) : (
              guests.map((guest) => (
                <div key={guest.id} className="comment-card-heritage">
                  <div className="comment-card-header">
                    <span className="comment-card-author">{guest.name}</span>
                    {guest.attendance && (
                      <span className={`comment-badge ${guest.attendance === 'hadir' ? 'badge-hadir' : 'badge-tidak'}`}>
                        {guest.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                      </span>
                    )}
                  </div>
                  {guest.message && (
                    <p className="comment-card-text">{guest.message}</p>
                  )}
                  <span className="comment-card-time">{formatTime(guest.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={`toast-toast ${toast ? 'show' : ''}`}>{toast}</div>
    </section>
  )
}
