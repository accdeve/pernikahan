import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'

const router = createBrowserRouter([
  // Public invitation routes (wrapped in MainLayout)
  {
    element: <MainLayout />,
    children: [
      {
        path: '/:slug_wo/:customer_id',
        async lazy() {
          const { InvitationPage } = await import('./pages/InvitationPage')
          return { element: <InvitationPage /> }
        },
      },
      {
        path: '/:slug_wo/:customer_id/rsvp',
        async lazy() {
          const { RsvpPage } = await import('./pages/RsvpPage')
          return { element: <RsvpPage /> }
        },
      },
    ],
  },

  // Tenant-agnostic global auth routes
  {
    path: '/login',
    async lazy() {
      const { LoginPage } = await import('./pages/admin/LoginPage')
      return { element: <LoginPage /> }
    },
  },
  {
    path: '/signup',
    async lazy() {
      const { SignupPage } = await import('./pages/admin/SignupPage')
      return { element: <SignupPage /> }
    },
  },

  // Admin routes (handled by monolithic App which manages its own layout)
  {
    path: '/admin',
    async lazy() {
      const { DashboardPage } = await import('./pages/admin/DashboardPage')
      return { element: <DashboardPage /> }
    },
  },
  {
    path: '/admin/:slug_wo',
    async lazy() {
      const { DashboardPage } = await import('./pages/admin/DashboardPage')
      return { element: <DashboardPage /> }
    },
  },
  {
    path: '/admin/:slug_wo/customers/:customer_id',
    async lazy() {
      const { CustomerDetailPage } = await import('./pages/admin/CustomerDetailPage')
      return { element: <CustomerDetailPage /> }
    },
  },

  // Redirect legacy /admin/login to new global path
  {
    path: '/admin/login',
    element: <Navigate to="/login" replace />,
  },
  // Redirect legacy /admin/signup to new global path
  {
    path: '/admin/signup',
    element: <Navigate to="/signup" replace />,
  },

  // Fallback redirect to global login
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

export { router }

