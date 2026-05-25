import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AdminAuthController {
  async showLogin({ view }: HttpContext) {
    return view.render('pages/admin/login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const email = request.input('email')
    const password = request.input('password')

    // Find admin user
    const user = await User.findBy('email', email)
    if (!user) {
      session.flash('errors.login', 'Email atau password administrator tidak terdaftar')
      session.flash('email', email)
      return response.redirect().back()
    }

    // Verify hashed password
    const isPasswordValid = await hash.verify(user.password, password)
    if (!isPasswordValid) {
      session.flash('errors.login', 'Password yang Anda masukkan salah')
      session.flash('email', email)
      return response.redirect().back()
    }

    // Authenticate user session
    await auth.use('web').login(user)

    return response.redirect().toPath('/admin')
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toPath('/admin/login')
  }
}
