import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function handler(req: Request): Promise<Response> {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Email dan kode OTP wajib diisi." }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 1. Fetch OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (fetchError) {
      return new Response(JSON.stringify({ error: "Gagal memverifikasi OTP: " + fetchError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    if (!otpRecord) {
      return new Response(JSON.stringify({ error: "Kode verifikasi tidak ditemukan untuk email ini." }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // 2. Validate OTP value
    if (otpRecord.otp !== otp) {
      return new Response(JSON.stringify({ error: "Kode OTP yang Anda masukkan salah." }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // 3. Check expiration
    if (new Date(otpRecord.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Kode OTP telah kedaluwarsa. Silakan lakukan pendaftaran ulang." }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // OTP is valid! Proceed with user and organization creation.
    const { email: signUpEmail, password, woName, woLocation, staffName } = otpRecord.metadata

    // Double check email in auth.users
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const existingUser = usersData?.users?.find(
      (u: any) => u.email?.toLowerCase() === signUpEmail.toLowerCase()
    )

    let userId = ''
    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email: signUpEmail,
        password: password || Math.random().toString(36).substring(2, 15),
        email_confirm: true,
      })
      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }
      userId = newAuthUser.user.id
    }

    // Create organization
    const slug = woName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data: wo, error: woError } = await supabase
      .from('wedding_organization')
      .insert({ name: woName, slug, location: woLocation, email: signUpEmail })
      .select()
      .single()

    if (woError) {
      return new Response(JSON.stringify({ error: woError.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Create wo_plan
    const { error: planError } = await supabase
      .from('wo_plan')
      .insert({
        wo_id: wo.id,
        plan_id: 'a3b1a111-1111-1111-1111-111111111111',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
    if (planError) {
      return new Response(JSON.stringify({ error: planError.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Update user metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { wo_slug: slug, wo_name: woName },
    })

    // Populate user profile
    await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        name: staffName,
        phone: null,
        avatar_url: null,
      })

    // Delete OTP record since it's verified and used
    await supabase
      .from('otp_verifications')
      .delete()
      .eq('email', email.toLowerCase())

    const isGoogleOAuth = !password || password === ''
    const needsPasswordReauth = !isGoogleOAuth
    const redirectPath = `/admin/${slug}`

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        email: signUpEmail,
        needsPasswordReauth,
        redirectPath,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
