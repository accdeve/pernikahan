import { HttpContext } from '@adonisjs/core/http'
import Invitation from '#models/invitation'
import Story from '#models/story'
import Gallery from '#models/gallery'
import Guest from '#models/guest'
import { DateTime } from 'luxon'

export default class AdminController {
  // 1. DASHBOARD OVERVIEW
  async dashboard({ view }: HttpContext) {
    const invitation = await Invitation.firstOrFail()

    // Fetch and filter guests
    const guestsList = await Guest.query().where('invitationId', invitation.id)
    const totalGuests = guestsList.length
    const attendingCount = guestsList.filter(g => g.attendance === 'hadir').length
    const decliningCount = guestsList.filter(g => g.attendance === 'tidak').length

    const recentGuests = await Guest.query()
      .where('invitationId', invitation.id)
      .orderBy('createdAt', 'desc')
      .limit(5)

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
    const invitation = await Invitation.firstOrFail()
    return view.render('pages/admin/edit_invitation', { invitation })
  }

  async update({ request, response, session }: HttpContext) {
    const invitation = await Invitation.firstOrFail()

    // Bind all inputs
    invitation.groomName = request.input('groomName')
    invitation.groomNickname = request.input('groomNickname')
    invitation.groomParentFather = request.input('groomParentFather')
    invitation.groomParentMother = request.input('groomParentMother')

    invitation.brideName = request.input('brideName')
    invitation.brideNickname = request.input('brideNickname')
    invitation.brideParentFather = request.input('brideParentFather')
    invitation.brideParentMother = request.input('brideParentMother')

    invitation.akadDatetime = DateTime.fromISO(request.input('akadDatetime'))
    invitation.resepsiDatetime = DateTime.fromISO(request.input('resepsiDatetime'))

    invitation.eventLocation = request.input('eventLocation')
    invitation.eventAddress = request.input('eventAddress')
    invitation.googleMapsUrl = request.input('googleMapsUrl')

    invitation.bankName = request.input('bankName')
    invitation.bankAccountNumber = request.input('bankAccountNumber')
    invitation.bankAccountHolder = request.input('bankAccountHolder')

    invitation.walletName = request.input('walletName')
    invitation.walletNumber = request.input('walletNumber')
    invitation.walletHolder = request.input('walletHolder')

    invitation.slug = request.input('slug')
    invitation.bgMusicUrl = request.input('bgMusicUrl')

    await invitation.save()

    session.flash('success', 'Informasi undangan pernikahan berhasil diperbarui!')
    return response.redirect().back()
  }

  // 3. MANAGE LOVE STORIES
  async stories({ view }: HttpContext) {
    const invitation = await Invitation.firstOrFail()
    const stories = await Story.query().where('invitationId', invitation.id).orderBy('sortOrder', 'asc')

    return view.render('pages/admin/manage_stories', { stories })
  }

  async createStory({ request, response, session }: HttpContext) {
    const invitation = await Invitation.firstOrFail()

    await Story.create({
      invitationId: invitation.id,
      milestoneDate: request.input('milestoneDate'),
      title: request.input('title'),
      imageUrl: request.input('imageUrl'),
      description: request.input('description'),
      sortOrder: Number(request.input('sortOrder', 0)),
    })

    session.flash('success', 'Momen kisah berhasil ditambahkan!')
    return response.redirect().back()
  }

  async deleteStory({ params, response, session }: HttpContext) {
    const story = await Story.findOrFail(params.id)
    await story.delete()

    session.flash('success', 'Momen kisah berhasil dihapus!')
    return response.redirect().back()
  }

  // 4. MANAGE GALLERY PHOTOS
  async gallery({ view }: HttpContext) {
    const invitation = await Invitation.firstOrFail()
    const galleries = await Gallery.query().where('invitationId', invitation.id).orderBy('sortOrder', 'asc')

    return view.render('pages/admin/manage_gallery', { galleries })
  }

  async createGallery({ request, response, session }: HttpContext) {
    const invitation = await Invitation.firstOrFail()

    await Gallery.create({
      invitationId: invitation.id,
      imageUrl: request.input('imageUrl'),
      caption: request.input('caption'),
      sortOrder: Number(request.input('sortOrder', 0)),
    })

    session.flash('success', 'Foto galeri berhasil ditambahkan!')
    return response.redirect().back()
  }

  async deleteGallery({ params, response, session }: HttpContext) {
    const photo = await Gallery.findOrFail(params.id)
    await photo.delete()

    session.flash('success', 'Foto galeri berhasil dihapus!')
    return response.redirect().back()
  }

  // 5. MANAGE GUESTS & RSVPS
  async guests({ view }: HttpContext) {
    const invitation = await Invitation.firstOrFail()
    const guests = await Guest.query().where('invitationId', invitation.id).orderBy('createdAt', 'desc')

    return view.render('pages/admin/manage_guests', { guests, invitation })
  }

  async deleteGuest({ params, response, session }: HttpContext) {
    const guest = await Guest.findOrFail(params.id)
    await guest.delete()

    session.flash('success', 'Data tamu / ucapan berhasil dihapus!')
    return response.redirect().back()
  }
}
