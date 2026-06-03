# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-02
**Commit:** 670ebd4
**Branch:** main

## OVERVIEW

Wedding invitation SaaS platform ("undangan_pernikahan"). **React SPA + Supabase (PostgreSQL)**.

### Architecture

```
BEFORE: AdonisJS(SSR) + Edge.js + Alpine.js + GSAP + React(admin) + SQLite
AFTER:  React SPA + Supabase (PostgreSQL, Auth, Storage, Edge Functions) + GSAP (React hooks)
```

Data flows **direct-to-Supabase** from the browser using `@supabase/supabase-js`. No backend server. Tenant isolation via PostgreSQL Row Level Security (RLS) using `wo_id` discriminator. Auth via Supabase Auth (GoTrue) with PKCE flow. Admin operations (signup) via Supabase Edge Function (Deno).

---

## STRUCTURE

```
pernikahan/
├── resources/
│   ├── js/                          # React SPA source (all TS/TSX)
│   │   ├── main.tsx                 # Entry point (createRoot + RouterProvider)
│   │   ├── router.tsx               # React Router v6 route definitions
│   │   ├── admin/                   # Admin panel entry points
│   │   │   ├── App.tsx              # Full admin SPA (CRUD, upload, analytics, 1400+ lines)
│   │   │   └── login.tsx            # Standalone login entry (legacy)
│   │   │   └── signup.tsx           # Standalone signup entry (legacy)
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui primitives (button, card, dialog, 20+)
│   │   │   ├── public/              # RsvpForm.tsx, Guestbook.tsx
│   │   │   ├── shared/              # AudioPlayer.tsx, Toast.tsx
│   │   │   ├── login-form.tsx       # Supabase Auth PKCE login
│   │   │   ├── signup-form.tsx      # Edge Function signup
│   │   │   └── ...admin nav         # app-sidebar, nav-main, nav-user, etc.
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx       # Supabase auth state provider
│   │   │   └── ThemeContext.tsx      # Light/dark theme provider
│   │   ├── hooks/
│   │   │   ├── useAudio.ts          # Background music player
│   │   │   ├── useClipboard.ts      # Copy-to-clipboard
│   │   │   ├── useRsvp.ts           # RSVP submission
│   │   │   └── use-mobile.tsx       # Mobile detection
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx       # Public layout (cover overlay + Outlet)
│   │   │   └── AdminLayout.tsx      # Admin sidebar layout (shadcn/ui Sidebar)
│   │   ├── lib/
│   │   │   ├── supabase-client.ts   # createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
│   │   │   └── utils.ts             # cn() helper (clsx + tailwind-merge)
│   │   ├── pages/
│   │   │   ├── InvitationPage.tsx   # Fetches data, dispatches theme component
│   │   │   ├── RsvpPage.tsx         # Standalone RSVP page
│   │   │   └── admin/
│   │   │       ├── LoginPage.tsx    # Thin wrapper → LoginForm
│   │   │       ├── SignupPage.tsx   # Thin wrapper → SignupForm
│   │   │       ├── DashboardPage.tsx# Thin wrapper → Admin App
│   │   │       └── CustomerDetailPage.tsx
│   │   ├── themes/
│   │   │   ├── java_style/          # React components (9 files)
│   │   │   │   ├── index.tsx        # Theme orchestrator
│   │   │   │   ├── Cover, Couple, Event, Story, Gallery, Rsvp, Nav, Closing
│   │   │   │   └── hooks/           # useCountdown, useCoverAnimation, useFlowerPetals, useGalleryLightbox, useNavHighlight, useScrollReveal
│   │   │   ├── image_sequence/      # React components (7 files)
│   │   │   │   ├── index.tsx        # Theme orchestrator
│   │   │   │   ├── Cover, Couple, Event, Rsvp, Closing, Nav
│   │   │   │   └── hooks/           # useCoverSequence, useEditorialNav, useScrollSequence
│   │   │   ├── java_style.js        # LEGACY Alpine.js version (keep for reference)
│   │   │   ├── image_sequence.js    # LEGACY Alpine.js version (keep for reference)
│   │   │   ├── wedding.js           # LEGACY Alpine.js version
│   │   │   └── anniversary.js       # LEGACY Alpine.js version
│   │   ├── app.js                   # LEGACY Alpine.js bootstrap
│   │   ├── shared.js                # LEGACY Alpine.js shared utilities
│   │   └── b2b/                     # LEGACY Alpine.js B2B module
│   │       ├── auth.js
│   │       └── dashboard.js
│   └── css/
│       ├── app.css                  # Global styles (GSAP theme styles, 2800+ lines)
│       └── tailwind.css             # Tailwind CSS v4 entry
├── docker-compose.yml              # Root compose — includes supabase/supabase.yml + web service
├── Dockerfile                       # Multi-stage: deps / dev / builder / production (nginx)
├── nginx.conf                       # Nginx config for production SPA serving
├── supabase/                        # Supabase self-hosted Docker + CLI config
│   ├── config.toml                  # npx supabase CLI config (project_id, db, api, auth, etc.)
│   ├── supabase.yml                 # 15 services: db, kong, auth, rest, studio, storage, etc.
│   ├── reset.sh                     # Destroy & restart fresh
│   └── volumes/                     # Bind mounts: api, db, functions, logs, pooler, snippets, storage
├── design/
│   └── assets/javanese_royal_heritage/DESIGN.md  # Design tokens
├── index.html                       # Root HTML + Google Fonts CDN
├── vite.config.ts                   # Vite: react() + tailwindcss()
├── tsconfig.json                    # Path alias @/* → resources/js/*
├── components.json                  # shadcn/ui registry config
├── package.json                     # React + Supabase + GSAP + shadcn
├── .env                             # Single env for all services (VITE_ vars + Supabase secrets)
├── srs/                             # Software Requirements Specification
├── tests/                           # Japa test bootstrap (no tests yet)
└── public/                          # Static assets
```

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/change route | `resources/js/router.tsx` | React Router `createBrowserRouter` with lazy imports |
| Create page | `resources/js/pages/` | Public or admin subdirectory |
| Modify public theme | `resources/js/themes/{theme}/` | 2 themes: `java_style` (9 components), `image_sequence` (7 components) |
| Add theme | `resources/js/themes/{name}/` + update `InvitationPage.tsx` theme dispatch | Register in theme selector logic |
| Modify admin panel | `resources/js/admin/App.tsx` | Monolithic admin SPA (CRUD, upload, charts) |
| Add shadcn/ui component | `npx shadcn add component-name` | Adds to `resources/js/components/ui/` |
| Modify auth | `resources/js/components/login-form.tsx`, `signup-form.tsx` | Supabase Auth PKCE + Edge Function |
| Change validation | `resources/js/components/signup-form.tsx` (form state) | Zod or inline validation |
| Add GSAP animation | `resources/js/themes/{theme}/hooks/` | React hooks with useRef + useEffect + cleanup |
| Add Supabase migration | `supabase/migrations/` | Timestamped SQL files, run `npx supabase db reset` |
| Add Edge Function | `supabase/functions/{name}/` | Deno TypeScript, invoke via `supabase.functions.invoke()` |
| Modify Supabase client | `resources/js/lib/supabase-client.ts` | Uses `import.meta.env.VITE_*` vars from root `.env` |
| Modify global CSS | `resources/css/app.css` | Theme styles for java_style (lines 1-1935) and image_sequence (lines 1937-2820) |
| Modify Tailwind config | `resources/css/tailwind.css` | Tailwind v4 uses CSS-first config |
| Change env vars | `.env` | Single file for all services (VITE_ vars + Supabase secrets) |

---

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `router` | Export | `resources/js/router.tsx` | React Router `createBrowserRouter` with all routes |
| `InvitationPage` | Page | `resources/js/pages/InvitationPage.tsx` | Fetches invitation data, renders theme |
| `RsvpPage` | Page | `resources/js/pages/RsvpPage.tsx` | RSVP form + guestbook page |
| `Admin App` | Component | `resources/js/admin/App.tsx` | Full admin SPA (1400+ lines) |
| `MainLayout` | Layout | `resources/js/layouts/MainLayout.tsx` | Public page shell with cover overlay |
| `AdminLayout` | Layout | `resources/js/layouts/AdminLayout.tsx` | Admin sidebar + header |
| `AuthContext` | Context | `resources/js/contexts/AuthContext.tsx` | Supabase auth state provider |
| `ThemeContext` | Context | `resources/js/contexts/ThemeContext.tsx` | Light/dark theme provider |
| `supabase` | Client | `resources/js/lib/supabase-client.ts` | Supabase JS SDK singleton |
| `JavaStyleTheme` | Theme | `resources/js/themes/java_style/index.tsx` | Traditional Javanese wedding theme |
| `ImageSequenceTheme` | Theme | `resources/js/themes/image_sequence/index.tsx` | Editorial ScrollTrigger theme |
| `LoginForm` | Component | `resources/js/components/login-form.tsx` | Supabase Auth PKCE login form |
| `SignupForm` | Component | `resources/js/components/signup-form.tsx` | Edge Function signup + auto-login |
| `RsvpForm` | Component | `resources/js/components/public/RsvpForm.tsx` | RSVP submission to Supabase |
| `Guestbook` | Component | `resources/js/components/public/Guestbook.tsx` | Guest list display |
| `wo-signup` | Function | `supabase/volumes/functions/wo-signup/index.ts` | Edge Function: creates auth user + WO + staff |
| `useScrollSequence` | Hook | `resources/js/themes/image_sequence/hooks/useScrollSequence.ts` | GSAP ScrollTrigger pinned sequence |
| `useCoverAnimation` | Hook | `resources/js/themes/java_style/hooks/useCoverAnimation.ts` | Cover opening animation |
| `useCountdown` | Hook | `resources/js/themes/java_style/hooks/useCountdown.ts` | Wedding countdown timer |
| `useFlowerPetals` | Hook | `resources/js/themes/java_style/hooks/useFlowerPetals.ts` | Falling jasmine petals |
| `useGalleryLightbox` | Hook | `resources/js/themes/java_style/hooks/useGalleryLightbox.ts` | Photo lightbox state |
| `useNavHighlight` | Hook | `resources/js/themes/java_style/hooks/useNavHighlight.ts` | Scroll-based nav highlight |
| `useScrollReveal` | Hook | `resources/js/themes/java_style/hooks/useScrollReveal.ts` | IntersectionObserver fade-up |
| `useCoverSequence` | Hook | `resources/js/themes/image_sequence/hooks/useCoverSequence.ts` | Editorial cover entrance GSAP |
| `useEditorialNav` | Hook | `resources/js/themes/image_sequence/hooks/useEditorialNav.ts` | Editorial scroll nav highlight |
| `useAudio` | Hook | `resources/js/hooks/useAudio.ts` | Background music play/pause |
| `useClipboard` | Hook | `resources/js/hooks/useClipboard.ts` | Copy bank account to clipboard |
| `useRsvp` | Hook | `resources/js/hooks/useRsvp.ts` | RSVP submission to Supabase |

---

## CONVENTIONS

### React & Routing
- **React 19** with `react-router-dom` v7 (`createBrowserRouter` + `RouterProvider`)
- **Lazy imports**: `const Page = React.lazy(() => import('./pages/Page'))` with `Suspense`
- **Entry point**: `resources/js/main.tsx` → mounts `<RouterProvider router={router} />` in `#root`
- **Path alias**: `@/*` maps to `resources/js/*` (both `tsconfig.json` and `vite.config.ts`)
- **Local imports use `.js` extension** (Vite convention for TypeScript files)
- **State management**: React contexts + `useState`/`useReducer` — no Zustand/Redux

### Supabase
- **Client**: `createClient(supabaseUrl, supabaseAnonKey)` from `resources/js/lib/supabase-client.ts`
- **Auth**: Supabase Auth PKCE via `supabase.auth.signInWithPassword()`
- **Server-side operations**: Edge Functions via `supabase.functions.invoke('function-name', { body: {...} })`
- **Service role key**: NEVER exposed to client — only used inside Edge Functions
- **Direct-to-Supabase**: All CRUD operations go directly from browser to Supabase REST API

### GSAP Animations (React)
- **Import**: `import gsap from 'gsap'` and `import { ScrollTrigger } from 'gsap/ScrollTrigger'`
- **Plugin registration**: `gsap.registerPlugin(ScrollTrigger)` (once at module level)
- **Pattern**: React hooks with `useRef<HTMLDivElement>(null)` + `useEffect` cleanup
- **Cleanup is MANDATORY**: All intervals, observers, ScrollTriggers, and tweens must be killed in the `useEffect` return
- **Hook naming**: `{use}{Feature}.ts` — e.g., `useCoverAnimation.ts`, `useScrollSequence.ts`

### shadcn/ui
- **Install**: `npx shadcn add button` (adds to `resources/js/components/ui/`)
- **Customized**: Components use `#111111` (dark) and `#FAF9F6` (light) color scheme
- **Components**: 20+ primitives available (button, card, dialog, dropdown-menu, table, tabs, sheet, drawer, sidebar, etc.)

### Theme Architecture
- **Data flow**: `InvitationPage.tsx` fetches from Supabase → passes props to theme component
- **Theme interface**: Each theme exposes `ThemeName({ invitation, stories, galleries, guests, onRefreshGuests })`
- **Theme switching**: Currently hardcoded to `JavaStyleTheme` in `InvitationPage.tsx` — should use `invitation.style` field
- **Hooks**: Theme-specific GSAP hooks go in `hooks/` subdirectory; shared hooks in `resources/js/hooks/`

### CSS
- **Tailwind v4**: CSS-first config via `@tailwindcss/vite` plugin
- **Global styles**: `resources/css/app.css` — contains theme-specific CSS for both themes (~2800 lines)
- **Design tokens**: Defined in `design/assets/javanese_royal_heritage/DESIGN.md`
- **Google Fonts**: Cinzel, Inter, Great Vibes, Playfair Display, Newsreader, Bodoni Moda (loaded via `index.html`)

---

## ANTI-PATTERNS (THIS PROJECT)

- **NEVER expose `SUPABASE_SERVICE_ROLE_KEY` in client code** — only in Edge Functions
- **NEVER use `form POST` to a backend server** — all operations go directly to Supabase
- **NEVER skip GSAP cleanup** in `useEffect` — causes memory leaks, broken animations on re-render
- **NEVER use `@ts-ignore` or `as any`** to suppress type errors
- **NEVER edit `dist/` or `build/` files** — auto-generated
- **DO NOT use `@/` path alias outside TypeScript** — only works in `.ts`/`.tsx` files via Vite resolve
- **DO NOT add new npm packages for state management** — React context + hooks is sufficient
- **DO NOT delete legacy `resources/js/*.js` files** (app.js, shared.js, theme JS files) — kept as reference for Alpine.js versions

---

## COMMANDS

```bash
npm run dev          # Vite dev server (default port 5173)
npm run build        # Production build (vite build → dist/)
npm run preview      # Preview production build (vite preview)
npm run lint         # ESLint
npm run format       # Prettier

# Full stack (Supabase + web app) — Docker Compose include pattern
docker compose up -d          # Start everything (15 Supabase services + web dev server)
docker compose down           # Stop all services
docker compose logs -f        # Follow logs
docker compose ps             # List running services

# Supabase only (standalone from supabase/)
cd supabase
docker compose -f supabase.yml up -d   # Start just Supabase services
docker compose -f supabase.yml down    # Stop Supabase services
./reset.sh                             # Destroy & restart fresh
cd ..

# Apply raw SQL to Supabase DB from root
docker compose exec -T db psql -U postgres < path/to/sql-file.sql

# Supabase CLI (complementary — for migrations, functions, types)
npx supabase db push           # Push local migrations from supabase/migrations/
npx supabase functions deploy  # Deploy Edge Functions
npx supabase gen types typescript --local > types/supabase.ts  # Generate TS types

# shadcn/ui
npx shadcn add button        # Add a UI component
```

---

## NOTES

- **Node >= 24.0.0** required
- **No CI/CD** configured — no GitHub Actions, Dockerfile, or deployment configs
- **No tests written** — Japa configured with 3 suites but only `tests/bootstrap.ts` exists
- **Supabase local**: Self-hosted via Docker Compose in `supabase/`. Kong gateway at `http://localhost:8000`, Studio at `http://localhost:8000` (login: `admin`/`supabase-admin`), Mailpit at `http://localhost:54324`. Postgres direct via Supavisor on port `5432` or transaction pooler on `6543`.
- **Docker Compose include**: Root `docker-compose.yml` uses `include` long syntax with `env_file: .env` — satu `.env` file untuk semua service (Supabase + web).
- **Migration flow**: SQL migrations in `supabase/migrations/` can be managed via `npx supabase db push`. Raw SQL can be applied directly via `docker compose exec -T db psql -U postgres < file.sql`.
- **Edge Functions**: Deployed via `supabase/volumes/functions/` bind mount. Also deployable via `npx supabase functions deploy`.
- **Invitation themes**: `java_style` (default) and `image_sequence` (editorial). Theme switching via `invitation.style` DB field — currently hardcoded in `InvitationPage.tsx`
- **GSAP**: Included at v3.15. Used via React hooks with imperative GSAP calls inside `useEffect`
- **Image upload**: Admin panel uploads to Supabase Storage with WebP conversion (10MB limit)
- **Drag-and-drop**: Admin gallery/story reordering via `@dnd-kit`
- **Auth**: Supabase PKCE with `AuthContext` provider. Login returns `wo_slug` from `user.user_metadata` for redirect
- **Legacy files**: Alpine.js versions of themes (`java_style.js`, `image_sequence.js`) and utilities (`shared.js`, `app.js`) remain on disk but are no longer active in the build
- **Hot reload**: Vite HMR for all `resources/js/` files
- **WhatsApp preview**: Open Graph meta tags set dynamically in `MainLayout.tsx`
