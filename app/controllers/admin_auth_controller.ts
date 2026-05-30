// app/controllers/admin_auth_controller.ts
// Multi-tenant admin authentication using Supabase Auth

import type { HttpContext } from '@adonisjs/core/http'
import { supabaseAdmin } from '#services/supabase_service'

export default class AdminAuthController {
  async showLogin({ params, view, session, response }: HttpContext) {
    const slugWo = params.slug_wo || 'royal-wo'
    const accessToken = session.get('supabase_access_token')

    if (accessToken) {
      const { data } = await supabaseAdmin.auth.getUser(accessToken)
      if (data.user) {
        // Find staff WO association
        const { data: staff } = await supabaseAdmin
          .from('wo_staff')
          .select('*, wedding_organization(*)')
          .eq('user_id', data.user.id)
          .single()

        if (staff) {
          return response.redirect().toPath(`/admin/${staff.wedding_organization.slug}`)
        }
      }
    }

    return view.render('pages/admin/login', { slugWo })
  }

  async login({ params, request, response, session }: HttpContext) {
    const slugWo = params.slug_wo || 'royal-wo'
    const email = request.input('email')
    const password = request.input('password')

    // 1. Authenticate via Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      session.flash('errors.login', error?.message || 'Email atau password salah')
      session.flash('email', email)
      return response.redirect().back()
    }

    // 2. Verify WO Staff association for the authenticated user
    const userId = data.user.id
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('wo_staff')
      .select('*, wedding_organization(*)')
      .eq('user_id', userId)
      .single()

    if (staffError || !staff) {
      // Authenticated but not registered as staff
      await supabaseAdmin.auth.admin.signOut(data.session.access_token)
      session.flash(
        'errors.login',
        'Akses Ditolak: Akun Anda tidak terdaftar sebagai staff Wedding Organizer'
      )
      return response.redirect().back()
    }

    // 3. Verify cross-tenant organization matching
    const staffWoSlug = staff.wedding_organization.slug
    if (staffWoSlug !== slugWo) {
      await supabaseAdmin.auth.admin.signOut(data.session.access_token)
      session.flash(
        'errors.login',
        `Akses Ditolak: Akun Anda terdaftar di Wedding Organizer lain (${staff.wedding_organization.name})`
      )
      return response.redirect().back()
    }

    // Store tokens and details in AdonisJS session
    session.put('supabase_access_token', data.session.access_token)
    session.put('supabase_refresh_token', data.session.refresh_token)
    session.put('supabase_user_id', data.user.id)
    session.put('supabase_user_email', data.user.email ?? '')
    session.put('supabase_staff_id', staff.id)
    session.put('supabase_wo_id', staff.wedding_organization.id)
    session.put('supabase_wo_name', staff.wedding_organization.name)
    session.put('supabase_wo_location', staff.wedding_organization.location ?? '')
    session.put('supabase_wo_slug', staff.wedding_organization.slug)

    return response.redirect().toPath(`/admin/${slugWo}`)
  }

  async logout({ params, session, response }: HttpContext) {
    const slugWo = params.slug_wo || 'royal-wo'
    const accessToken = session.get('supabase_access_token')

    if (accessToken) {
      await supabaseAdmin.auth.admin.signOut(accessToken)
    }

    session.forget('supabase_access_token')
    session.forget('supabase_refresh_token')
    session.forget('supabase_user_id')
    session.forget('supabase_user_email')
    session.forget('supabase_staff_id')
    session.forget('supabase_wo_id')
    session.forget('supabase_wo_name')
    session.forget('supabase_wo_location')
    session.clear()

    return response.redirect().toPath(`/admin/${slugWo}/login`)
  }

  async showSignup({ view }: HttpContext) {
    return view.render('pages/admin/signup')
  }

  async signup({ request, response, session }: HttpContext) {
    const woName = request.input('woName')
    const woEmail = request.input('woEmail')
    const woLocation = request.input('woLocation')
    const staffName = request.input('staffName')
    const staffEmail = request.input('staffEmail')
    const password = request.input('password')

    try {
      // 1. Sign up user on Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
        email: staffEmail,
        password: password,
      })

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Registrasi auth gagal')
      }

      const userId = authData.user.id

      // 2. Generate WO Slug
      const baseSlug = woName.toLowerCase().replace(/[^a-z0-9-]/g, '')
      const randSuffix = Math.floor(1000 + Math.random() * 9000)
      const woSlug = `${baseSlug}-${randSuffix}`

      // 3. Create Wedding Organization
      const { data: woData, error: woError } = await supabaseAdmin
        .from('wedding_organization')
        .insert({
          name: woName,
          slug: woSlug,
          email: woEmail,
          location: woLocation,
        })
        .select()
        .single()

      if (woError || !woData) {
        // Rollback user from Auth if possible
        await supabaseAdmin.auth.admin.deleteUser(userId)
        throw new Error(woError?.message || 'Gagal menyimpan data Wedding Organizer')
      }

      // 4. Create WO Staff
      const { error: staffError } = await supabaseAdmin.from('wo_staff').insert({
        user_id: userId,
        wo_id: woData.id,
        name: staffName,
        email: staffEmail,
        role: 'admin',
      })

      if (staffError) {
        // Clean up
        await supabaseAdmin.from('wedding_organization').delete().eq('id', woData.id)
        await supabaseAdmin.auth.admin.deleteUser(userId)
        throw new Error(staffError.message)
      }

      // 5. Store session if logged in
      if (authData.session) {
        session.put('supabase_access_token', authData.session.access_token)
        session.put('supabase_refresh_token', authData.session.refresh_token)
        session.put('supabase_user_id', authData.user.id)
        session.put('supabase_user_email', authData.user.email ?? '')
        session.put('supabase_wo_id', woData.id)
        session.put('supabase_wo_name', woData.name)
        session.put('supabase_wo_location', woData.location ?? '')
        session.put('supabase_wo_slug', woData.slug)

        session.flash('success', 'Registrasi sukses dan berhasil masuk!')
        return response.redirect().toPath(`/admin/${woSlug}`)
      } else {
        session.flash('errors.login', 'Registrasi sukses! Silakan login menggunakan akun Anda.')
        return response.redirect().toPath(`/admin/${woSlug}/login`)
      }
    } catch (err: any) {
      session.flash('errors.signup', `Registrasi gagal: ${err.message}`)
      session.flash('woName', woName)
      session.flash('woEmail', woEmail)
      session.flash('woLocation', woLocation)
      session.flash('staffName', staffName)
      session.flash('staffEmail', staffEmail)
      return response.redirect().back()
    }
  }
}
