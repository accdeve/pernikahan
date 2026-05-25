import { HttpContext } from '@adonisjs/core/http'
import Invitation from '#models/invitation'
import Guest from '#models/guest'

// Valid theme keys — add new themes here as they are created
const VALID_THEMES = ['java_style', 'image_sequence'] as const
type ThemeKey = (typeof VALID_THEMES)[number]

export default class InvitationController {
  async show({ params, request, view, response }: HttpContext) {
    const slug = params.slug
    let invitation: any = null
    let errorOccurred = false

    try {
      invitation = await Invitation.query()
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
    } catch (e) {
      errorOccurred = true
    }

    // If query failed or returned no data, try to fall back to hardcoded mock data (demo mode)
    if (errorOccurred || !invitation) {
      const { getMockInvitationBySlug } = await import('#services/mock_data')
      const mockInv = getMockInvitationBySlug(slug)
      
      if (!mockInv) {
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
          : ((mockInv.style as ThemeKey) ?? 'java_style')
      }

      const routePrefix = activeStyle === 'image_sequence' ? 'modern' : 'java'

      return view.render('pages/home', {
        invitation: mockInv,
        stories: mockInv.stories,
        galleries: mockInv.galleries,
        guests: mockInv.guests,
        guestName,
        activeStyle,
        routePrefix,
      })
    }

    const guestName = request.input('to', '')

    // Force style based on URL prefix (/java vs /modern) or fallback to DB style/query override
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

    try {
      const invitation = await Invitation.query().where('slug', slug).firstOrFail()
      
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
    } catch (error) {
      // Fail-safe: fall back to saving in volatile memory if database is not available/write-blocked
      const { getMockInvitationBySlug, volatileRSVPs } = await import('#services/mock_data')
      const mockInv = getMockInvitationBySlug(slug)
      
      if (mockInv) {
        const newRsvp = {
          id: Date.now(),
          invitationId: mockInv.id,
          name,
          attendance,
          comment,
          createdAt: new Date().toISOString()
        }
        
        if (!volatileRSVPs[mockInv.id]) {
          volatileRSVPs[mockInv.id] = []
        }
        volatileRSVPs[mockInv.id].push(newRsvp)
        
        // Re-fetch simulated guests
        const updatedGuests = [...mockInv.guests, ...(volatileRSVPs[mockInv.id] || [])]
        
        if (request.ajax()) {
          // Send reversed to show latest first
          return response.json({
            success: true,
            guests: [...updatedGuests].reverse(),
          })
        }
      }
    }

    return response.redirect().back()
  }
}
