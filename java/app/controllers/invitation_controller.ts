import { HttpContext } from '@adonisjs/core/http'
import Invitation from '#models/invitation'
import Guest from '#models/guest'

// Valid theme keys — add new themes here as they are created
const VALID_THEMES = ['java_style', 'image_sequence'] as const
type ThemeKey = (typeof VALID_THEMES)[number]

export default class InvitationController {
  async show({ params, request, view, response }: HttpContext) {
    const slug = params.slug

    // Fetch invitation by slug
    const invitation = await Invitation.query()
      .where('slug', slug)
      .preload('stories', (query) => {
        query.orderBy('sortOrder', 'asc')
      })
      .preload('galleries', (query) => {
        query.orderBy('sortOrder', 'asc')
      })
      .preload('guests', (query) => {
        query.orderBy('createdAt', 'desc')
      })
      .first()

    if (!invitation) {
      return response.notFound('Undangan tidak ditemukan')
    }

    const guestName = request.input('to', '')

    // Allow ?theme= query param to override the DB style at runtime.
    // Useful for previewing a different template without changing the database.
    const themeOverride = request.input('theme', '') as string
    const activeStyle: ThemeKey = VALID_THEMES.includes(themeOverride as ThemeKey)
      ? (themeOverride as ThemeKey)
      : ((invitation.style as ThemeKey) ?? 'java_style')

    return view.render('pages/home', {
      invitation,
      stories: invitation.stories,
      galleries: invitation.galleries,
      guests: invitation.guests,
      guestName,
      activeStyle,
    })
  }

  async rsvp({ params, request, response }: HttpContext) {
    const slug = params.slug
    
    const invitation = await Invitation.query().where('slug', slug).firstOrFail()
    
    const name = request.input('name')
    const attendance = request.input('attendance')
    const comment = request.input('comment')

    // Create guest RSVP
    await Guest.create({
      invitationId: invitation.id,
      name,
      attendance,
      comment,
    })

    // Fetch all updated guests for real-time guestbook refresh
    const updatedGuests = await Guest.query()
      .where('invitationId', invitation.id)
      .orderBy('createdAt', 'desc')

    // Return JSON if requested via AJAX/Fetch
    if (request.ajax()) {
      return response.json({
        success: true,
        guests: updatedGuests,
      })
    }

    return response.redirect().back()
  }
}
