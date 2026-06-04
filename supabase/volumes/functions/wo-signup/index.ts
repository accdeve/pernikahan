import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function handler(req: Request): Promise<Response> {
  try {
    const { email, password, woName, woLocation, staffName } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 1. Check if email already registered in wedding_organization
    const { data: existingEmailWo } = await supabase
      .from('wedding_organization')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingEmailWo) {
      return new Response(
        JSON.stringify({ error: "Alamat email ini sudah terdaftar dengan organisasi lain. Silakan masuk." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 2. Check if slug is already taken in wedding_organization
    const slug = woName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data: existingWo } = await supabase
      .from('wedding_organization')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingWo) {
      return new Response(
        JSON.stringify({ error: "Nama organisasi (slug URL) ini sudah digunakan. Silakan gunakan nama lain." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 3. Generate a 6-digit secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes expiration
    const metadata = { email, password, woName, woLocation, staffName }

    // 4. Store OTP in database
    const { error: otpError } = await supabase
      .from('otp_verifications')
      .upsert(
        { email: email.toLowerCase(), otp, metadata, expires_at: expiresAt },
        { onConflict: 'email' }
      )

    if (otpError) {
      return new Response(
        JSON.stringify({ error: "Gagal menyimpan kode verifikasi: " + otpError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 5. Send payload to n8n Webhook with security configurations
    const webhookUrl = Deno.env.get('OTP_WEBHOOK_URL') || "https://n8n.ablarsy.com/webhook/wednity-otp"
    const webhookSecret = Deno.env.get('OTP_WEBHOOK_SECRET') || "wednity_default_secret_key_12345"
    
    const payload = {
      email: email.toLowerCase(),
      otp,
      woName,
      staffName,
      expiresAt
    }

    const payloadStr = JSON.stringify(payload)

    // Compute HMAC SHA-256 signature
    const encoder = new TextEncoder()
    const keyData = encoder.encode(webhookSecret)
    const messageData = encoder.encode(payloadStr)
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    )
    const signatureArray = Array.from(new Uint8Array(signatureBuffer))
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, "0")).join("")

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payload-Signature': signatureHex
        },
        body: payloadStr
      })
      if (!response.ok) {
        console.error("n8n Webhook returned status:", response.status)
      }
    } catch (e) {
      console.error("Failed to send OTP webhook request:", e)
    }

    return new Response(
      JSON.stringify({ success: true, email: email.toLowerCase() }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}