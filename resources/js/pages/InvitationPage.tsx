import * as React from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase-client.js'
import './../../css/app.css'
import { JavaStyleTheme, type InvitationData } from '../themes/java_style/index.js'
import type { StoryData } from '../themes/java_style/Story.js'
import type { GalleryData } from '../themes/java_style/Gallery.js'
import type { GuestData } from '../themes/java_style/Rsvp.js'

export function InvitationPage() {
  const { slug_wo, customer_id } = useParams()
  const [invitation, setInvitation] = React.useState<InvitationData | null>(null)
  const [stories, setStories] = React.useState<StoryData[]>([])
  const [galleries, setGalleries] = React.useState<GalleryData[]>([])
  const [guests, setGuests] = React.useState<GuestData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const fetchGuests = React.useCallback(async () => {
    if (!invitation) return
    const { data } = await supabase
      .from('admin_guests')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false })
    if (data) setGuests(data)
  }, [invitation])

  React.useEffect(() => {
    async function loadData() {
      if (!customer_id) {
        setError('Invalid invitation')
        setLoading(false)
        return
      }

      const { data: invitationData, error: invError } = await supabase
        .from('invitations')
        .select('*, customers(*)')
        .eq('customer_id', customer_id)
        .single()

      if (invError || !invitationData) {
        setError('Undangan tidak ditemukan')
        setLoading(false)
        return
      }

      setInvitation(invitationData)

      const [storiesRes, galleriesRes, guestsRes] = await Promise.all([
        supabase
          .from('stories')
          .select('*')
          .eq('invitation_id', invitationData.id)
          .order('sort_order'),
        supabase
          .from('galleries')
          .select('*')
          .eq('invitation_id', invitationData.id)
          .order('sort_order'),
        supabase
          .from('admin_guests')
          .select('*')
          .eq('invitation_id', invitationData.id)
          .order('created_at', { ascending: false }),
      ])

      if (storiesRes.data) setStories(storiesRes.data)
      if (galleriesRes.data) setGalleries(galleriesRes.data)
      if (guestsRes.data) setGuests(guestsRes.data)

      setLoading(false)
    }

    loadData()
  }, [customer_id])

  if (loading) {
    return (
      <div className="app-container">
        <div className="invitation-wrapper flex-center">
          <p className="text-muted">Memuat...</p>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="app-container">
        <div className="invitation-wrapper flex-center">
          <p className="text-muted">{error || 'Undangan tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  return (
    <JavaStyleTheme
      invitation={invitation}
      stories={stories}
      galleries={galleries}
      guests={guests}
      onRefreshGuests={fetchGuests}
    />
  )
}
