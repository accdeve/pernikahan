import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

// Valid theme keys — add new themes here as they are created
const VALID_THEMES = ['java_style', 'image_sequence'] as const
type ThemeKey = (typeof VALID_THEMES)[number]

export default class InvitationController {
  async show({ params, request, view, response }: HttpContext) {
    const slug = params.slug
    const { getMockInvitationBySlug } = await import('#services/mock_data')
    const invitation = getMockInvitationBySlug(slug)
    
    if (!invitation) {
      return response.notFound('Undangan tidak ditemukan')
    }

    const guestName = request.input('to', '')
    const urlPath = request.url()
    let activeStyle: ThemeKey = 'java_style'
    if (urlPath.startsWith('/modern')) {
      activeStyle = 'image_sequence'
    } else if (urlPath.startsWith('/java')) {
      activeStyle = 'java_style'
    } else {
      const themeOverride = request.input('theme', '') as string
      activeStyle = VALID_THEMES.includes(themeOverride as ThemeKey)
        ? (themeOverride as ThemeKey)
        : ((invitation.style as ThemeKey) ?? 'java_style')
    }

    const routePrefix = activeStyle === 'image_sequence' ? 'modern' : 'java'

    return view.render('pages/home', {
      invitation,
      stories: invitation.stories,
      galleries: invitation.galleries,
      guests: invitation.guests,
      guestName,
      activeStyle,
      routePrefix,
    })
  }

  async rsvp({ params, request, response }: HttpContext) {
    const slug = params.slug
    const name = request.input('name')
    const attendance = request.input('attendance')
    const comment = request.input('comment')

    const { getMockInvitationBySlug, volatileRSVPs } = await import('#services/mock_data')
    const mockInv = getMockInvitationBySlug(slug)
    
    if (mockInv) {
      const newRsvp = {
        id: Date.now(),
        invitationId: mockInv.id,
        name,
        attendance,
        comment,
        createdAt: DateTime.now()
      }
      
      if (!volatileRSVPs[mockInv.id]) {
        volatileRSVPs[mockInv.id] = []
      }
      volatileRSVPs[mockInv.id].push(newRsvp)
      
      // Re-fetch simulated guests
      const updatedGuests = [...mockInv.guests, ...(volatileRSVPs[mockInv.id] || [])]
      
      if (request.ajax()) {
        return response.json({
          success: true,
          guests: [...updatedGuests].reverse(),
        })
      }
    }

    return response.redirect().back()
  }
}
