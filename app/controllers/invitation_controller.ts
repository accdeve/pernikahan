// app/controllers/invitation_controller.ts
// Public multi-tenant invitation controller using Supabase

import type { HttpContext } from '@adonisjs/core/http'
import { supabaseAdmin } from '#services/supabase_service'
import { DateTime } from 'luxon'

const VALID_THEMES = ['java_style', 'image_sequence'] as const
type ThemeKey = (typeof VALID_THEMES)[number]

export default class InvitationController {
  // Helper to fetch the invitation by either UUID or slug, and verify WO association
  private async getInvitationAndVerifyWO(slugWo: string, customerId: string) {
    // 1. Fetch wedding organization by slug
    const { data: wo } = await supabaseAdmin
      .from('wedding_organization')
      .select('id')
      .eq('slug', slugWo)
      .single()

    if (!wo) return null

    // 2. Fetch invitation by UUID customer_id or by slug!
    let query = supabaseAdmin.from('invitations').select('*')
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      customerId
    )

    if (isUuid) {
      query = query.eq('customer_id', customerId)
    } else {
      query = query.eq('slug', customerId)
    }

    const { data: invitation } = await query.single()
    if (!invitation) return null

    // 3. Verify cross-tenant association
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('wo_id')
      .eq('id', invitation.customer_id)
      .single()

    if (!customer || customer.wo_id !== wo.id) return null

    return invitation
  }

  // Render the invitation template dynamically
  async show({ params, request, view, response }: HttpContext) {
    const slugWo = params.slug_wo
    const customerId = params.customer_id

    const invitation = await this.getInvitationAndVerifyWO(slugWo, customerId)
    if (!invitation) {
      return response.notFound('Undangan tidak ditemukan atau akses ditolak')
    }

    // Fetch related couples details (stories, galleries, and RSVPs)
    const { data: stories } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('sort_order', { ascending: true })

    const { data: galleries } = await supabaseAdmin
      .from('galleries')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('sort_order', { ascending: true })

    const { data: guests } = await supabaseAdmin
      .from('admin_guests')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false })

    const guestName = request.input('to', '')

    // Allow theme overrides via query parameter (?theme=)
    const themeOverride = request.input('theme', '') as string
    const activeStyle: ThemeKey = VALID_THEMES.includes(themeOverride as ThemeKey)
      ? (themeOverride as ThemeKey)
      : ((invitation.style as ThemeKey) ?? 'java_style')

    // Map snake_case columns to camelCase for the views
    const mappedInvitation = {
      id: invitation.id,
      slug: invitation.slug,
      brideName: invitation.bride_name,
      brideNickname: invitation.bride_nickname,
      brideParentFather: invitation.bride_parent_father,
      brideParentMother: invitation.bride_parent_mother,
      groomName: invitation.groom_name,
      groomNickname: invitation.groom_nickname,
      groomParentFather: invitation.groom_parent_father,
      groomParentMother: invitation.groom_parent_mother,
      akadDatetime: invitation.akad_datetime ? DateTime.fromISO(invitation.akad_datetime) : null,
      resepsiDatetime: invitation.resepsi_datetime
        ? DateTime.fromISO(invitation.resepsi_datetime)
        : null,
      eventLocation: invitation.event_location,
      eventAddress: invitation.event_address,
      googleMapsUrl: invitation.google_maps_url,
      bankName: invitation.bank_name,
      bankAccountNumber: invitation.bank_account_number,
      bankAccountHolder: invitation.bank_account_holder,
      walletName: invitation.wallet_name,
      walletNumber: invitation.wallet_number,
      walletHolder: invitation.wallet_holder,
      bgMusicUrl: invitation.bg_music_url,
      style: invitation.style,
    }

    const mappedStories = (stories || []).map((s: any) => ({
      id: s.id,
      milestoneDate: s.milestone_date,
      title: s.title,
      description: s.description,
      imageUrl: s.image_url,
      sortOrder: s.sort_order,
    }))

    const mappedGalleries = (galleries || []).map((g: any) => ({
      id: g.id,
      imageUrl: g.image_url,
      caption: g.caption,
      sortOrder: g.sort_order,
    }))

    const mappedGuests = (guests || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      attendance: g.attendance,
      comment: g.comment,
      createdAt: DateTime.fromISO(g.created_at),
    }))

    return view.render('pages/home', {
      invitation: mappedInvitation,
      stories: mappedStories,
      galleries: mappedGalleries,
      guests: mappedGuests,
      guestName,
      activeStyle,
    })
  }

  // Scope guest RSVP submission to the resolved customer wedding organization
  async rsvp({ params, request, response }: HttpContext) {
    const slugWo = params.slug_wo
    const customerId = params.customer_id

    const invitation = await this.getInvitationAndVerifyWO(slugWo, customerId)
    if (!invitation) {
      return response.notFound('Undangan tidak ditemukan atau akses ditolak')
    }

    const name = request.input('name')
    const attendance = request.input('attendance')
    const comment = request.input('comment')

    // Insert guest RSVP
    await supabaseAdmin.from('admin_guests').insert({
      invitation_id: invitation.id,
      name,
      attendance,
      comment,
    })

    // Fetch updated guests for instant guestbook updates
    const { data: updatedGuests } = await supabaseAdmin
      .from('admin_guests')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false })

    const mappedGuests = (updatedGuests || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      attendance: g.attendance,
      comment: g.comment,
      createdAt: DateTime.fromISO(g.created_at),
    }))

    if (request.ajax()) {
      return response.json({
        success: true,
        guests: mappedGuests,
      })
    }

    return response.redirect().back()
  }

  async showB2bWedding({ params, view }: HttpContext) {
    return view.render('pages/b2b/templates/wedding', { slug: params.slug })
  }

  async showB2bAnniversary({ params, view }: HttpContext) {
    return view.render('pages/b2b/templates/anniversary', { slug: params.slug })
  }
}
