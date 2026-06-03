import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase-client'

interface RsvpData {
  invitationId: string
  name: string
  attendance: 'hadir' | 'tidak'
  guestCount?: number
  comment?: string
}

export function useRsvp(invitationId?: string) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guests, setGuests] = useState<any[]>([])

  const fetchGuests = useCallback(async () => {
    if (!invitationId) return
    const { data } = await supabase
      .from('admin_guests')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false })
    if (data) setGuests(data)
  }, [invitationId])

  const submitRsvp = useCallback(async (data: RsvpData) => {
    setSubmitting(true)
    setError(null)
    try {
      const { error: err } = await supabase.from('admin_guests').insert({
        invitation_id: data.invitationId,
        name: data.name,
        attendance: data.attendance,
        guest_count: data.guestCount || 1,
        comment: data.comment || '',
      })
      if (err) throw err
      await fetchGuests()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setSubmitting(false)
    }
  }, [fetchGuests])

  return { submitting, error, guests, fetchGuests, submitRsvp }
}
