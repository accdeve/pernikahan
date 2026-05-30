// app/controllers/b2b_controller.ts

import type { HttpContext } from '@adonisjs/core/http'

export default class B2bController {
  async showLogin({ view }: HttpContext) {
    return view.render('pages/b2b/login')
  }

  async showSignup({ view }: HttpContext) {
    return view.render('pages/b2b/signup')
  }

  async dashboard({ view }: HttpContext) {
    return view.render('pages/b2b/dashboard')
  }

  async customers({ response }: HttpContext) {
    return response.redirect().toPath('/b2b/dashboard')
  }
}
