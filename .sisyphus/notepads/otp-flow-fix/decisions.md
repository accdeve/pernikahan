# OTP Flow Fix - Decisions

## Auto-Login Approach for Google OAuth
- After OTP verify, user already has active Google session
- Frontend redirects to `/admin/${slug}` (from `resData.redirectPath`)
- App.tsx detects `wo_slug` in user metadata and redirects to dashboard
- No password re-auth needed for Google OAuth users

## Session Recovery Strategy
1. Check location.state first (from router navigation)
2. Fall back to sessionStorage (persists across page refresh)
3. Finally try supabase.auth.getSession() for logged-in user email

## 401 Error Handling
- For signup failures (401), show modal popup with error message
- Non-401 errors remain as inline error messages
- Popup uses custom modal with overlay (no new npm package needed)

## What NOT to Change (Guardrails)
- wo-signup Edge Function
- n8n workflow
- Supabase Auth config
- Infrastructure