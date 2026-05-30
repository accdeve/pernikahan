// app/controllers/admin_controller.ts
// Multi-tenant Wedding Organizer Admin Controller using Supabase

import type { HttpContext } from '@adonisjs/core/http'
import { supabaseAdmin } from '#services/supabase_service'
import { DateTime } from 'luxon'

export default class AdminController {
  // Serve React SPA
  async renderSpa({ view }: HttpContext) {
    return view.render('pages/admin/spa')
  }

  // Map raw database columns to camelCase for views
  private mapInvitation(invitation: any) {
    if (!invitation) return null
    return {
      id: invitation.id,
      customerId: invitation.customer_id,
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
  }

  // 1. WO STAFF DASHBOARD (List of Couples / Customers)
  async dashboard({ view, session }: HttpContext) {
    const woId = session.get('supabase_wo_id')
    const woName = session.get('supabase_wo_name')
    const woLocation = session.get('supabase_wo_location')

    // Fetch all couples/customers belonging to this WO
    const { data: customersList } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('wo_id', woId)
      .order('created_at', { ascending: false })

    const customers = customersList || []

    // Fetch all invitations linked to these customers to check their activation states
    const customerIds = customers.map((c) => c.id)
    let invitations: any[] = []
    if (customerIds.length > 0) {
      const { data: invs } = await supabaseAdmin
        .from('invitations')
        .select('id, customer_id, slug, style')
        .in('customer_id', customerIds)
      invitations = invs || []
    }

    // Map activation states
    const mappedCustomers = customers.map((c) => {
      const linkedInv = invitations.find((i) => i.customer_id === c.id)
      return {
        id: c.id,
        maleName: c.male_name,
        femaleName: c.female_name,
        email: c.email,
        isActive: !!linkedInv,
        slug: linkedInv?.slug || '',
        style: linkedInv?.style || 'java_style',
      }
    })

    const totalCustomers = mappedCustomers.length
    const activeWeddings = mappedCustomers.filter(
      (c) => c.isActive && c.style === 'java_style'
    ).length
    const activeAnniversaries = mappedCustomers.filter(
      (c) => c.isActive && c.style === 'image_sequence'
    ).length

    return view.render('pages/admin/dashboard', {
      woName,
      woLocation,
      customers: mappedCustomers,
      totalCustomers,
      activeWeddings,
      activeAnniversaries,
      userEmail: session.get('supabase_user_email'),
    })
  }

  // 2. CREATE NEW CUSTOMER (Auto-initializes their Invitation record)
  async createCustomer({ request, response, session }: HttpContext) {
    const woId = session.get('supabase_wo_id')

    const maleName = request.input('maleName')
    const femaleName = request.input('femaleName')
    const email = request.input('email')

    // 1. Insert Customer Record
    const { data: customer, error: custError } = await supabaseAdmin
      .from('customers')
      .insert({
        wo_id: woId,
        male_name: maleName,
        female_name: femaleName,
        email: email,
      })
      .select()
      .single()

    if (custError || !customer) {
      session.flash('errors', `Gagal menyimpan customer: ${custError?.message}`)
      return response.redirect().back()
    }

    // Generate unique slug based on names
    const randSuffix = Math.floor(1000 + Math.random() * 9000)
    const baseSlug = `${maleName.toLowerCase()}-${femaleName.toLowerCase()}`.replace(
      /[^a-z0-9-]/g,
      ''
    )
    const finalSlug = `${baseSlug}-${randSuffix}`

    // 2. Auto-initialize corresponding Invitation
    const { error: invError } = await supabaseAdmin.from('invitations').insert({
      customer_id: customer.id,
      slug: finalSlug,
      groom_name: maleName,
      groom_nickname: maleName,
      bride_name: femaleName,
      bride_nickname: femaleName,
      event_location: 'Gedung Pernikahan',
      event_address: 'Alamat Acara',
      style: 'java_style',
      akad_datetime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      resepsi_datetime: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000 + 3 * 3600 * 1000
      ).toISOString(),
    })

    if (invError) {
      session.flash(
        'errors',
        `Customer dibuat, namun gagal menginisialisasi undangan: ${invError.message}`
      )
      return response.redirect().back()
    }

    session.flash('success', 'Customer baru berhasil ditambahkan!')
    return response.redirect().back()
  }

  // 3. SCOPED CLIENT WORKSPACE (Timeline milestones, photo galleries, guests, metadata)
  async customerDetail({ params, view, session }: HttpContext) {
    const customerId = params.customer_id

    // Fetch customer details
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (!customer) {
      session.flash('errors', 'Klien tidak ditemukan')
      return view.render('pages/errors/not_found')
    }

    // Fetch corresponding invitation metadata
    const { data: invitation } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('customer_id', customerId)
      .single()

    if (!invitation) {
      return view.render('pages/admin/customer_detail', {
        customer,
        invitation: null,
        stories: [],
        galleries: [],
        guests: [],
        totalGuests: 0,
        attendingCount: 0,
        decliningCount: 0,
      })
    }

    // Fetch timeline stories
    const { data: stories } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('sort_order', { ascending: true })

    // Fetch photo galleries
    const { data: galleries } = await supabaseAdmin
      .from('galleries')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('sort_order', { ascending: true })

    // Fetch guest RSVPs
    const { data: guestsList } = await supabaseAdmin
      .from('admin_guests')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false })

    const guests = guestsList || []
    const totalGuests = guests.length
    const attendingCount = guests.filter((g: any) => g.attendance === 'hadir').length
    const decliningCount = guests.filter((g: any) => g.attendance === 'tidak').length

    // Map guests
    const mappedGuests = guests.map((g: any) => ({
      id: g.id,
      name: g.name,
      attendance: g.attendance,
      comment: g.comment,
      createdAt: DateTime.fromISO(g.created_at),
    }))

    return view.render('pages/admin/customer_detail', {
      customer,
      invitation: this.mapInvitation(invitation),
      stories: stories || [],
      galleries: galleries || [],
      guests: mappedGuests,
      totalGuests,
      attendingCount,
      decliningCount,
      userEmail: session.get('supabase_user_email'),
    })
  }

  // 4. UPDATE METADATA (Bridal info, dates, banks)
  async updateCustomerMetadata({ params, request, response, session }: HttpContext) {
    const customerId = params.customer_id

    const { data: invitation } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('customer_id', customerId)
      .single()

    if (!invitation) {
      session.flash('errors', 'Profil undangan tidak ditemukan')
      return response.redirect().back()
    }

    const { error } = await supabaseAdmin
      .from('invitations')
      .update({
        groom_name: request.input('groomName'),
        groom_nickname: request.input('groomNickname'),
        groom_parent_father: request.input('groomParentFather'),
        groom_parent_mother: request.input('groomParentMother'),
        bride_name: request.input('brideName'),
        bride_nickname: request.input('brideNickname'),
        bride_parent_father: request.input('brideParentFather'),
        bride_parent_mother: request.input('brideParentMother'),
        akad_datetime: request.input('akadDatetime'),
        resepsi_datetime: request.input('resepsiDatetime'),
        event_location: request.input('eventLocation'),
        event_address: request.input('eventAddress'),
        google_maps_url: request.input('googleMapsUrl'),
        bank_name: request.input('bankName'),
        bank_account_number: request.input('bankAccountNumber'),
        bank_account_holder: request.input('bankAccountHolder'),
        wallet_name: request.input('walletName'),
        wallet_number: request.input('walletNumber'),
        wallet_holder: request.input('walletHolder'),
        slug: request.input('slug'),
        bg_music_url: request.input('bgMusicUrl'),
        style: request.input('style'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (error) {
      session.flash('errors', `Gagal memperbarui: ${error.message}`)
      return response.redirect().back()
    }

    session.flash('success', 'Detail informasi klien pengantin berhasil diperbarui!')
    return response.redirect().back()
  }

  // 5. MANAGE TIMELINE STORIES (Milestones)
  async createStory({ params, request, response, session }: HttpContext) {
    const customerId = params.customer_id

    const { data: invitation } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('customer_id', customerId)
      .single()

    if (!invitation) {
      session.flash('errors', 'Profil undangan tidak ditemukan')
      return response.redirect().back()
    }

    const { error } = await supabaseAdmin.from('stories').insert({
      invitation_id: invitation.id,
      milestone_date: request.input('milestoneDate'),
      title: request.input('title'),
      description: request.input('description'),
      image_url: request.input('imageUrl'),
      sort_order: Number(request.input('sortOrder', 0)),
    })

    if (error) {
      session.flash('errors', `Gagal menambahkan: ${error.message}`)
      return response.redirect().back()
    }

    session.flash('success', 'Momen kisah perjalanan kasih berhasil ditambahkan!')
    return response.redirect().back()
  }

  async deleteStory({ response, session, params }: HttpContext) {
    const { error } = await supabaseAdmin.from('stories').delete().eq('id', params.id)

    if (error) {
      session.flash('errors', `Gagal menghapus: ${error.message}`)
      return response.redirect().back()
    }

    session.flash('success', 'Momen kisah berhasil dihapus!')
    return response.redirect().back()
  }

  // 6. MANAGE PRE-WED GALLERY PHOTOS
  async createGallery({ params, request, response, session }: HttpContext) {
    const customerId = params.customer_id

    const { data: invitation } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('customer_id', customerId)
      .single()

    if (!invitation) {
      session.flash('errors', 'Profil undangan tidak ditemukan')
      return response.redirect().back()
    }

    const { error } = await supabaseAdmin.from('galleries').insert({
      invitation_id: invitation.id,
      image_url: request.input('imageUrl'),
      caption: request.input('caption'),
      sort_order: Number(request.input('sortOrder', 0)),
    })

    if (error) {
      session.flash('errors', `Gagal menambahkan foto: ${error.message}`)
      return response.redirect().back()
    }

    session.flash('success', 'Foto galeri berhasil ditambahkan!')
    return response.redirect().back()
  }

  async deleteGallery({ params, response, session }: HttpContext) {
    const { error } = await supabaseAdmin.from('galleries').delete().eq('id', params.id)

    if (error) {
      session.flash('errors', `Gagal menghapus foto: ${error.message}`)
      return response.redirect().back()
    }

    session.flash('success', 'Foto galeri berhasil dihapus!')
    return response.redirect().back()
  }

  // 7. MANAGE GUESTS / RSVPS
  async deleteGuest({ params, response, session }: HttpContext) {
    const { error } = await supabaseAdmin.from('admin_guests').delete().eq('id', params.id)

    if (error) {
      session.flash('errors', `Gagal menghapus data tamu: ${error.message}`)
      return response.redirect().back()
    }

    session.flash('success', 'Data tamu / konfirmasi RSVP berhasil dihapus!')
    return response.redirect().back()
  }
}
