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

export function RsvpPage() {
  const { slug_wo, slug } = useParams()
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
      if (!slug) {
        setError('Invalid invitation')
        setLoading(false)
        return
      }

      // Check if parameter is a valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug)
      
      let query = supabase
        .from('invitations')
        .select('id, customer_id, slug, groom_name, bride_name')

      if (isUuid) {
        query = query.or(`slug.eq."${slug}",customer_id.eq."${slug}"`)
      } else {
        query = query.eq('slug', slug)
      }

      const { data: invitationData, error: invError } = await query.single()

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
  }, [slug])

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
