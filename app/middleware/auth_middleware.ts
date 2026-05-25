import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  redirectTo = '/admin/login'

  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.session.get('is_admin_logged_in')) {
      return ctx.response.redirect().toPath(this.redirectTo)
    }
    return next()
  }
}
