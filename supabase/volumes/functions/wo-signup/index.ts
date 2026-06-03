import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function handler(req: Request): Promise<Response> {
  try {
    const { email, password, woName, woLocation, staffName } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const slug = woName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data: wo, error: woError } = await supabase
      .from('wedding_organization')
      .insert({ name: woName, slug, location: woLocation, email })
      .select()
      .single()
    if (woError) {
      return new Response(JSON.stringify({ error: woError.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

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

    await supabase.auth.admin.updateUserById(authUser.user.id, {
      user_metadata: { wo_slug: slug, wo_name: woName },
    })

    return new Response(
      JSON.stringify({ success: true, slug }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}