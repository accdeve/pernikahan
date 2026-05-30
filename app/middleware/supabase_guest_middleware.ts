// app/middleware/supabase_guest_middleware.ts
// Middleware that redirects already-authenticated users away from guest-only pages (e.g. login)

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SupabaseGuestMiddleware {
  redirectTo = '/admin'

  async handle(ctx: HttpContext, next: NextFn) {
    const accessToken = ctx.session.get('supabase_access_token')

    if (accessToken) {
      const slugWo = ctx.params.slug_wo || 'royal-wo'
      return ctx.response.redirect(`/admin/${slugWo}`, true)
    }

    return next()
  }
}
