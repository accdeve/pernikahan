import * as React from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase-client.js'
import './../../css/app.css'
import type { InvitationData, BaseStoryData as StoryData, BaseGalleryData as GalleryData, BaseGuestData as GuestData } from '../themes/types.js'

export function InvitationPage() {
  const { slug_wo, slug } = useParams()
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
      if (!slug) {
        setError('Invalid invitation')
        setLoading(false)
        return
      }

      // Check if parameter is a valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug)
      
      let query = supabase
        .from('invitations')
        .select('*, customers(*)')

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

      // Parse and validate guest name signature to prevent parameter tampering
      const params = new URLSearchParams(window.location.search)
      const toParam = params.get('to') || ''
      const sParam = params.get('s') || ''

      let finalGuestName = ''
      if (toParam) {
        const secretKey = '7fff98e8209ed9e4'
        let hash = 0
        const hashStr = toParam + secretKey
        for (let i = 0; i < hashStr.length; i++) {
          const char = hashStr.charCodeAt(i)
          hash = (hash << 5) - hash + char
          hash |= 0
        }
        const expectedSig = Math.abs(hash).toString(16).substring(0, 8)

        if (sParam === expectedSig) {
          finalGuestName = toParam
        } else {
          // Fallback to generic guest name if signature verification fails
          finalGuestName = 'Tamu Undangan'
        }
      }

      // Extract date and time from datetime strings
      const parseDatetime = (dtStr?: string) => {
        if (!dtStr) return { date: '', time: '' }
        try {
          const dt = new Date(dtStr)
          if (isNaN(dt.getTime())) return { date: '', time: '' }
          const date = dt.toISOString().split('T')[0]
          const time = dt.toTimeString().split(' ')[0].substring(0, 5) // "HH:MM"
          return { date, time }
        } catch {
          return { date: '', time: '' }
        }
      }

      const akad = parseDatetime(invitationData.akad_datetime)
      const resepsi = parseDatetime(invitationData.resepsi_datetime)

      const mappedInvitation: InvitationData = {
        id: invitationData.id,
        groom_name: invitationData.groom_name,
        groom_nickname: invitationData.groom_nickname || '',
        groom_father: invitationData.groom_parent_father || '',
        groom_mother: invitationData.groom_parent_mother || '',
        bride_name: invitationData.bride_name,
        bride_nickname: invitationData.bride_nickname || '',
        bride_father: invitationData.bride_parent_father || '',
        bride_mother: invitationData.bride_parent_mother || '',
        wedding_date: invitationData.resepsi_datetime || invitationData.akad_datetime || '',
        akad_date: akad.date,
        akad_time: akad.time,
        akad_location: invitationData.event_location || '',
        akad_address: invitationData.event_address || '',
        akad_map_url: invitationData.google_maps_url || '',
        resepsi_date: resepsi.date,
        resepsi_time: resepsi.time,
        resepsi_location: invitationData.event_location || '',
        resepsi_address: invitationData.event_address || '',
        resepsi_map_url: invitationData.google_maps_url || '',
        bank_name: invitationData.bank_name || '',
        bank_account_number: invitationData.bank_account_number || '',
        bank_account_holder: invitationData.bank_account_holder || '',
        wallet_name: invitationData.wallet_name || '',
        wallet_number: invitationData.wallet_number || '',
        wallet_holder: invitationData.wallet_holder || '',
        audio_url: invitationData.bg_music_url || '',
        guest_name: finalGuestName,
        style: invitationData.style || 'java_style'
      }

      setInvitation(mappedInvitation)

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
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full relative">
        <div className="w-full max-w-[480px] h-full bg-[#16130b] shadow-[0_0_80px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col flex items-center justify-center">
          <p className="text-[#d0c5af]">Memuat...</p>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="flex justify-center items-center h-screen w-full relative">
        <div className="w-full max-w-[480px] h-full bg-[#16130b] shadow-[0_0_80px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col flex items-center justify-center">
          <p className="text-[#d0c5af]">{error || 'Undangan tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center h-screen w-full relative">
      <div className="w-full max-w-[480px] h-full bg-[#16130b] shadow-[0_0_80px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col items-center justify-center">
        <p className="text-[#d0c5af] text-lg font-serif">Undangan</p>
      </div>
    </div>
  )
}
