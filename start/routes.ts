/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
|   - '/' redirects to default invitation '/juliana-muhammad'
|   - '/:slug' is the public wedding page
|   - '/admin' group is guarded by auth middleware
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import Invitation from '#models/invitation'

// Controllers lazy imports
const InvitationController = () => import('#controllers/invitation_controller')
const AdminAuthController = () => import('#controllers/admin_auth_controller')
const AdminController = () => import('#controllers/admin_controller')

// 1. Root landing showcase page
router.get('/', async ({ view }) => {
  try {
    const invitations = await Invitation.query().orderBy('id', 'asc')
    if (invitations.length === 0) {
      const { getMockInvitations } = await import('#services/mock_data')
      return view.render('pages/landing', { invitations: getMockInvitations() })
    }
    return view.render('pages/landing', { invitations })
  } catch (error) {
    // Fail-safe fallback to hardcoded mock data if database is empty or connection fails (e.g. on serverless Vercel)
    const { getMockInvitations } = await import('#services/mock_data')
    return view.render('pages/landing', { invitations: getMockInvitations() })
  }
})

// 2. Public Wedding Invitation Routes (/java and /modern prefixes)
router.get('/java/:slug', [InvitationController, 'show']).as('java.show')
router.post('/java/:slug/rsvp', [InvitationController, 'rsvp']).as('java.rsvp')

router.get('/modern/:slug', [InvitationController, 'show']).as('modern.show')
router.post('/modern/:slug/rsvp', [InvitationController, 'rsvp']).as('modern.rsvp')

// Backwards compatibility / Legacy routes
router.get('/undangan/:slug', [InvitationController, 'show']).as('undangan.show')
router.post('/undangan/:slug/rsvp', [InvitationController, 'rsvp']).as('undangan.rsvp')

router.get('/:slug', [InvitationController, 'show']).as('legacy.show')
router.post('/:slug/rsvp', [InvitationController, 'rsvp']).as('legacy.rsvp')

// 3. Admin Guest/Login Routes
router.group(() => {
  router.get('/admin/login', [AdminAuthController, 'showLogin'])
  router.post('/admin/login', [AdminAuthController, 'login'])
}).use(middleware.guest())

// 4. Guarded Admin Management Panel Routes
router.group(() => {
  // Logout
  router.post('/admin/logout', [AdminAuthController, 'logout'])

  // Dashboard Overview
  router.get('/admin', [AdminController, 'dashboard'])

  // Edit Invitation Copy
  router.get('/admin/edit', [AdminController, 'edit'])
  router.post('/admin/edit', [AdminController, 'update'])

  // Manage Stories
  router.get('/admin/stories', [AdminController, 'stories'])
  router.post('/admin/stories', [AdminController, 'createStory'])
  router.post('/admin/stories/delete/:id', [AdminController, 'deleteStory'])

  // Manage Gallery
  router.get('/admin/gallery', [AdminController, 'gallery'])
  router.post('/admin/gallery', [AdminController, 'createGallery'])
  router.post('/admin/gallery/delete/:id', [AdminController, 'deleteGallery'])

  // Moderation Guest list & RSVP
  router.get('/admin/guests', [AdminController, 'guests'])
  router.post('/admin/guests/delete/:id', [AdminController, 'deleteGuest'])
}).use(middleware.auth())
