import * as React from 'react'
import { toast } from 'sonner'

interface RsvpProps {
  customerId: string
  onGuestAdded?: () => void
}

export function Rsvp({ customerId, onGuestAdded }: RsvpProps) {
  const [name, setName] = React.useState('')
  const [attendance, setAttendance] = React.useState<'hadir' | 'tidak'>('hadir')
  const [comment, setComment] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nama harus diisi')
      return
    }

    setIsSubmitting(true)

    try {
      const { supabase } = await import('../../lib/supabase-client.js')
      const { error } = await supabase.from('admin_guests').insert({
        customer_id: customerId,
        name: name.trim(),
        attendance: attendance === 'hadir',
        comment: comment.trim(),
      })

      if (error) throw error

      toast.success('Ucapan berhasil terkirim!')
      setName('')
      setComment('')
      setAttendance('hadir')
      onGuestAdded?.()
    } catch (err) {
      console.error(err)
      toast.error('Terjadi kesalahan. Coba beberapa saat lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="editorial-rsvp" className="editorial-rsvp-section">
      <div className="editorial-container">
        <h2 className="editorial-section-title">RSVP</h2>

        <div className="rsvp-card-editorial">
          <form id="form-rsvp" onSubmit={handleSubmit}>
            <div className="form-group-editorial" style={{ marginBottom: '32px' }}>
              <label className="form-label-editorial">NAMA</label>
              <input
                type="text"
                className="form-input-editorial"
                placeholder="Nama lengkap Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group-editorial" style={{ marginBottom: '32px' }}>
              <label className="form-label-editorial">KEHADIRAN</label>
              <div style={{ display: 'flex', gap: '32px', marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="attendance"
                    value="hadir"
                    checked={attendance === 'hadir'}
                    onChange={() => setAttendance('hadir')}
                    className="form-radio-editorial"
                  />
                  <span className="form-radio-label">Hadir</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="attendance"
                    value="tidak"
                    checked={attendance === 'tidak'}
                    onChange={() => setAttendance('tidak')}
                    className="form-radio-editorial"
                  />
                  <span className="form-radio-label">Tidak Hadir</span>
                </label>
              </div>
            </div>

            <div className="form-group-editorial" style={{ marginBottom: '32px' }}>
              <label className="form-label-editorial">UCAPAN & DOA</label>
              <input
                type="text"
                id="comment"
                className="form-input-editorial"
                placeholder="Tulis ucapan dan doa terbaik Anda..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-submit-editorial"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'MENGIRIM...' : 'KIRIM UCAPAN'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
