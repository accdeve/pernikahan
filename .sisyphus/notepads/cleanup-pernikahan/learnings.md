
## Task 16: Supabase Edge Function for Signup (2026-06-02)

### What was done:
1. Created `supabase/functions/wo-signup/deno.json` - Deno config with @supabase/supabase-js import
2. Created `supabase/functions/wo-signup/index.ts` - Edge Function that:
   - Creates auth user via admin.createUser with service role key
   - Creates wedding_organization record with slug
   - Creates wo_staff record linking user to WO
   - Updates user metadata with wo_slug for login redirect
3. Created `resources/js/pages/admin/SignupPage.tsx` - Simple wrapper rendering SignupForm
4. Rewrote `resources/js/components/signup-form.tsx` to:
   - Use React state (useState) instead of server-config
   - Call supabase.functions.invoke('wo-signup') instead of form POST
   - Use onSubmit handler with handleSubmit function
   - Auto sign-in after successful registration
   - Navigate to /{slug} after registration

### Key patterns:
- Edge Function uses SUPABASE_SERVICE_ROLE_KEY (never exposed to client)
- Client uses supabase.functions.invoke() for server-side operations
- User metadata.wo_slug used for post-login navigation (matches Task 15)
- Removed all references to server-config, csrfToken, document.getElementById

### Build note:
Pre-existing build error about missing InvitationPage - not related to this task.

## Task 17: Update Admin App.tsx — Remove Server Config Dependency + Create Page Wrappers
**Date:** 2026-06-02

### Key Changes Made:

1. **Removed serverConfig parsing block** (lines 103-115)
   - Removed `document.getElementById('server-config')` parsing
   - Removed all references to `serverConfig.woId`, `serverConfig.woSlug`, `serverConfig.woName`, `serverConfig.woLocation`, `serverConfig.userEmail`, `serverConfig.accessToken`, `serverConfig.refreshToken`

2. **Added React Router params integration**
   - Added `useParams` import from `react-router-dom`
   - Added `woId` state variable to store fetched organization ID
   - Added `slug_wo` from `useParams<{ slug_wo: string }>()` inside the App component

3. **Replaced initialization useEffect**
   - Removed the `setSession` useEffect that used server-injected tokens
   - Added new `initApp` useEffect that:
     - Fetches org data from Supabase using `slug_wo` from params
     - Fetches current user via `supabase.auth.getUser()`
     - Sets `woId`, `woProfile`, and `adminUser` state

4. **Replaced all serverConfig references:**
   - `serverConfig.woId` → `woId` (state variable)
   - `serverConfig.woSlug` → `slug_wo` (from useParams)
   - `serverConfig.woName` → `woProfile.name`
   - `serverConfig.woLocation` → `woProfile.location`
   - `serverConfig.userEmail` → `adminUser.email`

5. **Created page wrapper components:**
   - `DashboardPage.tsx` - simple wrapper rendering `<App />`
   - `CustomerDetailPage.tsx` - simple wrapper rendering `<App />`

### Important Notes:
- `useParams` must be called inside a component, not at module level
- The `slug_wo` from useParams is available throughout the component
- All Supabase queries that previously used `serverConfig.woId` now use the `woId` state variable
- The AuthContext handles session management, so no manual `setSession` call is needed

## Task 20: Port java_style.js GSAP to React Hooks
**Date:** 2026-06-02

### What was done:
Created 6 React hooks in `resources/js/themes/java_style/hooks/`:

1. **useCoverAnimation.ts** - GSAP timeline for cover entrance animation
   - Handles cover element entrance animations (coverNames, javaneseLabel, coverDate, guestCard, btnOpen)
   - Separate useEffect for open animation (slide up cover, reveal main content)
   - Proper cleanup with tl.kill()

2. **useCountdown.ts** - Countdown timer hook
   - Uses setInterval at 1000ms
   - Returns { days, hours, minutes, seconds }
   - Proper cleanup with clearInterval

3. **useFlowerPetals.ts** - Falling jasmine petals animation
   - Creates petals as absolutely positioned divs inside container ref
   - Uses requestAnimationFrame for smooth animation
   - setInterval at 400ms to create new petals (max 25)
   - Proper cleanup: cancels animation frame, clears interval, removes all petal elements

4. **useScrollReveal.ts** - IntersectionObserver for fade-up sections
   - Registers ScrollTrigger plugin once (gsap.registerPlugin(ScrollTrigger))
   - Uses IntersectionObserver for fade-up elements
   - Proper cleanup: observer.disconnect() and ScrollTrigger.getAll().forEach(trigger => trigger.kill())

5. **useGalleryLightbox.ts** - Photo lightbox state machine
   - Returns { isOpen, currentIndex, currentPhoto, open, close, prev, next, hasMultiple }
   - Simple state machine: closed | open(photoIndex)
   - Wraps index navigation with modulo for cycling

6. **useNavHighlight.ts** - Scroll-based nav highlight
   - Handles nav button clicks with smooth scroll
   - Scroll event listener to highlight current section
   - Proper cleanup: removes scroll listener and click handlers

### Key patterns:
- All hooks include proper useEffect cleanup (no memory leaks)
- GSAP imports: `import gsap from 'gsap'` and `import { ScrollTrigger } from 'gsap/ScrollTrigger'`
- Refs passed to hooks: `const coverRef = useRef<HTMLDivElement>(null)` then `useCoverAnimation(coverRef, options)`
- useFlowerPetals uses requestAnimationFrame + setInterval hybrid approach
- useScrollReveal registers ScrollTrigger plugin once per session

### Build verification:
- lsp_diagnostics: 0 errors across all 6 hook files

## Task 23: Create RSVP Form + Guestbook Component + RsvpPage
**Date:** 2026-06-02

### What was done:
Created 3 new files for standalone RSVP page functionality:

1. **RsvpForm.tsx** (`resources/js/components/public/RsvpForm.tsx`)
   - Props: `invitationId: string`, `onSuccess?: () => void`
   - Form state: name, attendance (hadir/tidak), guestCount, comment
   - Submits directly to Supabase `admin_guests` table via `supabase.from('admin_guests').insert()`
   - Uses shadcn/ui components: Button, Input, Label
   - Clears form on success and calls onSuccess callback

2. **Guestbook.tsx** (`resources/js/components/public/Guestbook.tsx`)
   - Props: `guests: Guest[]` where Guest has id, name, attendance, comment, created_at
   - Displays guest list sorted by created_at descending
   - Shows attendance badge (green for hadir, red for tidak)
   - Formats timestamps with Indonesian locale

3. **RsvpPage.tsx** (`resources/js/pages/RsvpPage.tsx`)
   - Uses `useParams` to get `slug_wo` and `customer_id`
   - Fetches invitation by `customer_id` to get `invitation.id`
   - Fetches guests list ordered by `created_at` desc
   - Passes `invitationId` to RsvpForm and refreshes guests on success
   - Route already exists in router.tsx at `/:slug_wo/:customer_id/rsvp`

### Key patterns:
- All imports use `.js` extension (project convention for local imports)
- Supabase client imported from `../../lib/supabase-client.js` in components
- shadcn/ui components at `../ui/` with `.js` extension
- RsvpPage follows same data fetching pattern as InvitationPage
- Direct-to-Supabase submission (no server endpoint)

### Build verification:
- All 3 files pass lsp_diagnostics with 0 errors
