// app/services/supabase_service.ts
// Server-side Supabase client singleton for use in AdonisJS controllers

import { createClient } from '@supabase/supabase-js'
import env from '#start/env'

const supabaseUrl = env.get('SUPABASE_URL')
const supabaseServiceKey = env.get('SUPABASE_SERVICE_ROLE_KEY')

/**
 * Server-side Supabase client using the service role key.
 * This bypasses RLS — only use in trusted server contexts (controllers, middleware).
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Create a Supabase client scoped to an anon/user context (respects RLS).
 * Useful when you want RLS to apply based on the authenticated user's JWT.
 */
export function createSupabaseClient(accessToken?: string) {
  const anonKey = env.get('SUPABASE_ANON_KEY')
  const client = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  })
  return client
}
