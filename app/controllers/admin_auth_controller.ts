import { HttpContext } from '@adonisjs/core/http'

export default class AdminAuthController {
  async showLogin({ view }: HttpContext) {
    return view.render('pages/admin/login')
  }

  async login({ request, response, session }: HttpContext) {
    const email = request.input('email')
    const password = request.input('password')

    if (email === 'admin@pernikahan.com' && password === 'admin12345') {
      session.put('is_admin_logged_in', true)
      return response.redirect().toPath('/admin')
    }

    session.flash('errors.login', 'Email atau password administrator salah')
    session.flash('email', email)
    return response.redirect().back()
  }

  async logout({ session, response }: HttpContext) {
    session.forget('is_admin_logged_in')
    return response.redirect().toPath('/admin/login')
  }
}
