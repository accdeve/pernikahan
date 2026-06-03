import { useState } from 'react'
import { supabase } from '../../lib/supabase-client.js'
import { Button } from '../ui/button.js'
import { Input } from '../ui/input.js'
import { Label } from '../ui/label.js'

interface RsvpFormProps {
  invitationId: string
  onSuccess?: () => void
}

export function RsvpForm({ invitationId, onSuccess }: RsvpFormProps) {
  const [name, setName] = useState('')
  const [attendance, setAttendance] = useState<'hadir' | 'tidak' | ''>('')
  const [guestCount, setGuestCount] = useState(1)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nama harus diisi')
      return
    }
    if (!attendance) {
      setError('Silakan pilih konfirmasi kehadiran')
      return
    }

    setIsSubmitting(true)
    try {
      const { error: supabaseError } = await supabase.from('admin_guests').insert({
        invitation_id: invitationId,
        name: name.trim(),
        attendance,
        guest_count: guestCount,
        comment: comment.trim() || null,
      })

      if (supabaseError) throw supabaseError

      setName('')
      setAttendance('')
      setGuestCount(1)
      setComment('')
      onSuccess?.()
    } catch (err) {
      console.error('RSVP error:', err)
      setError('Gagal mengirim. Silakan coba lagi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rsvp-form">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rsvp-name">Nama</Label>
          <Input
            id="rsvp-name"
            type="text"
            placeholder="Nama lengkap Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label>Kehadiran</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="attendance"
                value="hadir"
                checked={attendance === 'hadir'}
                onChange={() => setAttendance('hadir')}
                disabled={isSubmitting}
              />
              <span>Hadir</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="attendance"
                value="tidak"
                checked={attendance === 'tidak'}
                onChange={() => setAttendance('tidak')}
                disabled={isSubmitting}
              />
              <span>Tidak Hadir</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rsvp-guest-count">Jumlah Tamu</Label>
          <Input
            id="rsvp-guest-count"
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rsvp-comment">Ucapan & Doa</Label>
          <textarea
            id="rsvp-comment"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            placeholder="Tulis ucapan dan doa terbaik Anda..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
            rows={3}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
        </Button>
      </form>
    </div>
  )
}
