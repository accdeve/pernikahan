# OTP Flow Fix - Learnings

## Session Recovery Patterns
- When location.state is lost on page refresh, use sessionStorage as backup
- For Supabase auth sessions, `supabase.auth.getSession()` can recover email
- Order of precedence: location.state → sessionStorage → supabase.auth.getSession()

## OTP Flow Bug Fixes
1. Bug #1 (email state empty on refresh): Fixed by adding session recovery useEffect
2. Bug #2 (Google OAuth auto-login): Fixed by using `resData.redirectPath` instead of hardcoded `/admin/${slug}`

## Error Handling
- Better error message: "Sesi tidak valid. Silakan daftar ulang." instead of "Email pengirim tidak valid."
- For 401 errors, show popup dialog instead of inline error

## Edge Function Response Design
- verify-otp returns `{ success, slug, email, needsPasswordReauth, redirectPath }`
- `needsPasswordReauth = false` for Google OAuth users → direct redirect to `/admin/${slug}`
- `redirectPath` allows flexible routing without frontend hardcoding

## Build Verification
- `npm run build` exit 0 = success
- LSP diagnostics: 0 errors across 50 scanned .tsx files