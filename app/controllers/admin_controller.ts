import { HttpContext } from '@adonisjs/core/http'

export default class AdminController {
  // 1. DASHBOARD OVERVIEW
  async dashboard({ view }: HttpContext) {
    const { getMockInvitations } = await import('#services/mock_data')
    const invitation = getMockInvitations()[0]

    // Fetch and filter guests
    const guestsList = invitation.guests
    const totalGuests = guestsList.length
    const attendingCount = guestsList.filter(g => g.attendance === 'hadir').length
    const decliningCount = guestsList.filter(g => g.attendance === 'tidak').length
    const recentGuests = guestsList.slice(0, 5)

    return view.render('pages/admin/dashboard', {
      invitation,
      totalGuests,
      attendingCount,
      decliningCount,
      recentGuests,
    })
  }

  // 2. EDIT INVITATION DETAIL
  async edit({ view }: HttpContext) {
    const { getMockInvitations } = await import('#services/mock_data')
    const invitation = getMockInvitations()[0]
    return view.render('pages/admin/edit_invitation', { invitation })
  }

  async update({ response, session }: HttpContext) {
    session.flash('success', 'Informasi undangan pernikahan berhasil diperbarui! (Demo Mode: Berhasil disimulasikan)')
    return response.redirect().back()
  }

  // 3. MANAGE LOVE STORIES
  async stories({ view }: HttpContext) {
    const { getMockInvitations } = await import('#services/mock_data')
    const invitation = getMockInvitations()[0]
    const stories = invitation.stories

    return view.render('pages/admin/manage_stories', { stories })
  }

  async createStory({ response, session }: HttpContext) {
    session.flash('success', 'Momen kisah berhasil ditambahkan! (Demo Mode: Berhasil disimulasikan)')
    return response.redirect().back()
  }

  async deleteStory({ response, session }: HttpContext) {
    session.flash('success', 'Momen kisah berhasil dihapus! (Demo Mode: Berhasil disimulasikan)')
    return response.redirect().back()
  }

  // 4. MANAGE GALLERY PHOTOS
  async gallery({ view }: HttpContext) {
    const { getMockInvitations } = await import('#services/mock_data')
    const invitation = getMockInvitations()[0]
    const galleries = invitation.galleries

    return view.render('pages/admin/manage_gallery', { galleries })
  }

  async createGallery({ response, session }: HttpContext) {
    session.flash('success', 'Foto galeri berhasil ditambahkan! (Demo Mode: Berhasil disimulasikan)')
    return response.redirect().back()
  }

  async deleteGallery({ response, session }: HttpContext) {
    session.flash('success', 'Foto galeri berhasil dihapus! (Demo Mode: Berhasil disimulasikan)')
    return response.redirect().back()
  }

  // 5. MANAGE GUESTS & RSVPS
  async guests({ view }: HttpContext) {
    const { getMockInvitations } = await import('#services/mock_data')
    const invitation = getMockInvitations()[0]
    const guests = invitation.guests

    return view.render('pages/admin/manage_guests', { guests, invitation })
  }

  async deleteGuest({ response, session }: HttpContext) {
    session.flash('success', 'Data tamu / ucapan berhasil dihapus! (Demo Mode: Berhasil disimulasikan)')
    return response.redirect().back()
  }
}
