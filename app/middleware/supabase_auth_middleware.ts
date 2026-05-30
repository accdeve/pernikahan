// app/middleware/supabase_auth_middleware.ts
// Middleware that checks for a valid Supabase session and enforces strict tenant/WO validation

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { supabaseAdmin } from '#services/supabase_service'

export default class SupabaseAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const slugWo = ctx.params.slug_wo || 'royal-wo'
    const loginRedirect = `/admin/${slugWo}/login`
    const accessToken = ctx.session.get('supabase_access_token')

    if (!accessToken) {
      return ctx.response.redirect(loginRedirect, true)
    }

    // 1. Validate the session token with Supabase
    let user = null
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken)

    if (error || !data.user) {
      // Token is expired or invalid — try refreshing it using refresh token
      const refreshToken = ctx.session.get('supabase_refresh_token')
      if (refreshToken) {
        const { data: refreshData, error: refreshError } = await supabaseAdmin.auth.refreshSession({
          refresh_token: refreshToken,
        })

        if (!refreshError && refreshData.session) {
          ctx.session.put('supabase_access_token', refreshData.session.access_token)
          ctx.session.put('supabase_refresh_token', refreshData.session.refresh_token)
          ctx.session.put('supabase_user_id', refreshData.user!.id)
          ctx.session.put('supabase_user_email', refreshData.user!.email ?? '')
          user = refreshData.user
        }
      }

      if (!user) {
        // All refresh attempts failed
        ctx.session.clear()
        return ctx.response.redirect(loginRedirect, true)
      }
    } else {
      user = data.user
    }

    // 2. Multi-Tenant WO Staff Access Verification
    const userId = user.id
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('wo_staff')
      .select('*, wedding_organization(*)')
      .eq('user_id', userId)
      .single()

    if (staffError || !staff) {
      // Authenticated but not a registered WO staff member
      ctx.session.clear()
      return ctx.response.redirect(loginRedirect, true)
    }

    // 3. Prevent Cross-Tenant / Cross-WO Access
    const staffWoSlug = staff.wedding_organization.slug
    if (staffWoSlug !== ctx.params.slug_wo) {
      // Force redirect to their actual registered WO tenant space
      return ctx.response.redirect(`/admin/${staffWoSlug}`, true)
    }

    // Attach user, staff, and WO info to context for controllers
    ctx.session.put('supabase_user_id', user.id)
    ctx.session.put('supabase_user_email', user.email ?? '')
    ctx.session.put('supabase_staff_id', staff.id)
    ctx.session.put('supabase_wo_id', staff.wedding_organization.id)
    ctx.session.put('supabase_wo_name', staff.wedding_organization.name)
    ctx.session.put('supabase_wo_location', staff.wedding_organization.location ?? '')
    ctx.session.put('supabase_wo_slug', staff.wedding_organization.slug)

    return next()
  }
}
