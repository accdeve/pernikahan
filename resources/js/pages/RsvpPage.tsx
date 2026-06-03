import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase-client.js'
import { RsvpForm } from '../components/public/RsvpForm.js'
import { Guestbook } from '../components/public/Guestbook.js'

interface Guest {
  id: string
  name: string
  attendance: string | null
  comment: string | null
  created_at: string
}

interface InvitationData {
  id: string
  customer_id: string
  groom_name: string
  bride_name: string
}

export function RsvpPage() {
  const { slug_wo, customer_id } = useParams()
  const [invitationId, setInvitationId] = useState<string | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchGuests = useCallback(async () => {
    if (!invitationId) return
    const { data } = await supabase
      .from('admin_guests')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false })
    if (data) setGuests(data)
  }, [invitationId])

  useEffect(() => {
    async function loadData() {
      if (!customer_id) {
        setError('Invalid invitation')
        setLoading(false)
        return
      }

      const { data: invitationData, error: invError } = await supabase
        .from('invitations')
        .select('id, customer_id, groom_name, bride_name')
        .eq('customer_id', customer_id)
        .single()

      if (invError || !invitationData) {
        setError('Undangan tidak ditemukan')
        setLoading(false)
        return
      }

      setInvitationId(invitationData.id)

      const { data: guestsData } = await supabase
        .from('admin_guests')
        .select('*')
        .eq('invitation_id', invitationData.id)
        .order('created_at', { ascending: false })

      if (guestsData) setGuests(guestsData)
      setLoading(false)
    }

    loadData()
  }, [customer_id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    )
  }

  if (error || !invitationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{error || 'Undangan tidak ditemukan'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">RSVP</h1>
          <p className="text-muted-foreground">Konfirmasi Kehadiran Anda</p>
        </div>

        <RsvpForm invitationId={invitationId} onSuccess={fetchGuests} />

        <Guestbook guests={guests} />
      </div>
    </div>
  )
}
