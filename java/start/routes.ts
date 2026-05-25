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

// Controllers lazy imports
const InvitationController = () => import('#controllers/invitation_controller')
const AdminAuthController = () => import('#controllers/admin_auth_controller')
const AdminController = () => import('#controllers/admin_controller')

// 1. Root redirect to seeded default wedding slug
router.get('/', ({ response }) => {
  return response.redirect().toPath('/juliana-muhammad')
})

// 2. Public Wedding Invitation Routes
router.get('/:slug', [InvitationController, 'show'])
router.post('/:slug/rsvp', [InvitationController, 'rsvp'])

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
