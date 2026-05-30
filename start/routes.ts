/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

// Controllers lazy imports
const InvitationController = () => import('#controllers/invitation_controller')
const AdminAuthController = () => import('#controllers/admin_auth_controller')
const AdminController = () => import('#controllers/admin_controller')

// 1. Root redirect to seeded default B2B wedding organizer
router
  .get('/', ({ response }) => {
    return response.redirect().toPath('/royal-wo/d3c1a111-1111-1111-1111-111111111111')
  })
  .as('home')

// 2. Legacy /b2b redirects for backward compatibility
router.get('/b2b', ({ response }) => response.redirect().toPath('/admin/royal-wo'))
router.get('/b2b/login', ({ response }) => response.redirect().toPath('/admin/royal-wo/login'))
router.get('/b2b/signup', ({ response }) => response.redirect().toPath('/admin/signup'))
router.get('/b2b/dashboard', ({ response }) => response.redirect().toPath('/admin/royal-wo'))

// 3. Multi-Tenant WO Admin Auth (only for unauthenticated users)
router
  .group(() => {
    router.get('/login', [AdminAuthController, 'showLogin']).as('login')
    router.post('/login', [AdminAuthController, 'login']).as('login.post')
  })
  .prefix('/admin/:slug_wo')
  .use(middleware.guest())
  .as('admin.auth')

// Signup routes (outside organization scope)
router
  .group(() => {
    router.get('/signup', [AdminAuthController, 'showSignup']).as('signup')
    router.post('/signup', [AdminAuthController, 'signup']).as('signup.post')
  })
  .prefix('/admin')
  .use(middleware.guest())
  .as('admin.signup')

// 4. Guarded Multi-Tenant WO Admin Dashboard & couple management (requires Supabase auth)
router
  .group(() => {
    // Logout
    router.post('/logout', [AdminAuthController, 'logout']).as('logout')

    // Dashboard Overview (list of couples)
    router.get('/', [AdminController, 'renderSpa']).as('dashboard')

    // Manage Couple/Customer accounts
    router.post('/customers', [AdminController, 'createCustomer']).as('customers.store')
    router.get('/customers/:customer_id', [AdminController, 'renderSpa']).as('customers.detail')
    router
      .post('/customers/:customer_id/edit', [AdminController, 'updateCustomerMetadata'])
      .as('customers.update')

    // Manage Milestones (Love Story)
    router
      .post('/customers/:customer_id/stories', [AdminController, 'createStory'])
      .as('stories.store')
    router
      .post('/customers/:customer_id/stories/delete/:id', [AdminController, 'deleteStory'])
      .as('stories.delete')

    // Manage Gallery
    router
      .post('/customers/:customer_id/gallery', [AdminController, 'createGallery'])
      .as('gallery.store')
    router
      .post('/customers/:customer_id/gallery/delete/:id', [AdminController, 'deleteGallery'])
      .as('gallery.delete')

    // Manage Guest/RSVP list
    router
      .post('/customers/:customer_id/guests/delete/:id', [AdminController, 'deleteGuest'])
      .as('guests.delete')
  })
  .prefix('/admin/:slug_wo')
  .use(middleware.auth())
  .as('admin.panel')

// 5. Public Multi-Tenant Wedding Invitation Greedy Routes (Must be at the absolute bottom!)
router.get('/:slug_wo/:customer_id', [InvitationController, 'show']).as('invitation.show')
router.post('/:slug_wo/:customer_id/rsvp', [InvitationController, 'rsvp']).as('invitation.rsvp')
