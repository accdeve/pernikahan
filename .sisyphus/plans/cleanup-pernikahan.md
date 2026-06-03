# Cleanup: Migrate to Full React SPA + Supabase

## TL;DR

> **Quick Summary**: Hapus AdonisJS, Edge.js, Alpine.js entirely. Migrate ke **React SPA murni** + **Supabase**. Public invitation themes jadi React components, admin panel sudah React.
>
> **Deliverables**:
> - Remove AdonisJS (controllers, views, configs, middleware, models, deps)
> - Remove Edge.js templates (ALL — including invitation themes)
> - Remove Alpine.js + GSAP (port GSAP ke React hooks)
> - Convert 2 invitation themes (16 templates) ke React components
> - Set up React Router (public + admin routes)
> - Supabase Auth PKCE + Edge Function signup
> - Static hosting (Vite build → CDN)
>
> **Estimated Effort**: Large (~25 tasks, 4-6 hari)
> **Parallel Execution**: YES — 5 waves, max 8 tasks per wave
> **Critical Path**: Remove AdonisJS → React infra → Themes → Auth → Verification

---

## Context

### Original Request
Hapus B2B portal dan AdonisJS. Backend pure Supabase. Admin panel pake React SPA.

### Key Decision After Evaluation
**Arsitektur final**: **ALL REACT SPA + SUPABASE**
- ✅ Single framework (React + shadcn/ui)
- ✅ Static hosting (Vercel/Netlify) — zero server cost
- ✅ SEO bukan requirement (undangan via direct link WhatsApp)
- ✅ GSAP kompatibel dengan React (via useEffect + useRef)
- ✅ Supabase sebagai single backend (DB, Auth, Storage, Edge Functions)
- ✅ Satu skill set (React dev) — mudah hire & maintain

### What Changes
BEFORE: `AdonisJS(SSR) + Edge.js + Alpine.js + GSAP + React(admin) + Supabase`
AFTER:  `React SPA + Supabase + GSAP(via hooks)`

---

## Work Objectives

### Core Objective
Transisi total dari AdonisJS/Edge.js/Alpine.js ke React SPA murni + Supabase. Single framework, static hosting, clean architecture.

### Concrete Deliverables
| Layer | Before | After |
|-------|--------|-------|
| **Public pages** | Edge.js templates + Alpine.js + GSAP | React components + GSAP hooks |
| **Admin panel** | React SPA (via AdonisJS shell) | React SPA (standalone) |
| **Auth** | AdonisJS session + Supabase admin client | Supabase Auth PKCE |
| **Signup** | AdonisJS controller (service role) | Supabase Edge Function |
| **Database** | SQLite (Lucid) + Supabase PostgreSQL | Supabase PostgreSQL only |
| **Hosting** | Node server (AdonisJS) | Static CDN (Vercel/Netlify) |
| **Routing** | AdonisJS routes + client-side pushState | React Router |

### Must Have
- Public invitation pages (2 themes) tetap berfungsi dengan animasi GSAP
- Admin panel (customers, stories, gallery, guests, settings) tetap berfungsi
- Auth flow (login/signup) via Supabase PKCE
- RSVP + guestbook tetap berfungsi
- `npm run build` menghasilkan static files
- `npm run dev` untuk development

### Must NOT Have (Guardrails)
- JANGAN hapus `resources/js/admin/` — React admin SPA
- JANGAN hapus `resources/js/components/` — shadcn/ui components
- JANGAN hapus `supabase/` — database migrations
- JANGAN hapus `resources/js/lib/` — utilities
- JANGAN hapus GSAP — porting, bukan menghapus
- JANGAN hapus design system CSS di `resources/css/app.css`

---

## Verification Strategy

> All verification agent-executed. No human intervention needed.

### QA Approach
- `npm run typecheck` — TypeScript compilation
- `npm run build` — Vite build succeeds
- `npm run dev` — Vite dev server starts
- Playwright: navigasi ke semua halaman, screenshot
- curl: test API response (via Supabase direct)

---

## Execution Strategy

### Parallel Waves

```
Wave 1 (Remove ALL AdonisJS + Edge.js — 8 tasks PARALLEL):
├── Task 1:  Remove app/ directory (controllers, middleware, models, dll)
├── Task 2:  Remove resources/views/ directory (ALL Edge.js templates)
├── Task 3:  Remove config/ directory (ALL AdonisJS configs)
├── Task 4:  Remove start/ directory (routes, kernel, env)
├── Task 5:  Remove bin/ + database/ + ace.js + adonisrc.ts
├── Task 6:  Remove design/ (only code.html duplicates)
├── Task 7:  Update package.json (remove ALL AdonisJS deps)
├── Task 8:  Update tsconfig.json (remove @adonisjs/tsconfig)
└── Task 9:  Update vite.config.ts (remove adonisjs plugin)

Wave 2 (React Infra — 5 tasks):
├── Task 10: Set up React Router (public + admin routes)
├── Task 11: Create React app shell (layouts, shared components)
├── Task 12: Set up Vite entry for public pages
├── Task 13: Update supabase-client.ts (pure env var)
└── Task 14: Update .env (VITE_ prefixed vars)

Wave 3 (Auth — 3 tasks, depends on Wave 2):
├── Task 15: Login form → Supabase Auth PKCE
├── Task 16: Signup → Supabase Edge Function
└── Task 17: Update admin App.tsx auth (remove server-config)

Wave 4 (Invitation Themes — PARALLEL within wave):
├── Task 18: React components for java_style theme (7 sections)
├── Task 19: React components for image_sequence theme (5 sections)
├── Task 20: Port java_style.js GSAP to React hooks (useCountdown, useFlowerPetals, dll)
├── Task 21: Port image_sequence.js GSAP to React hooks (useScrollSequence)
├── Task 22: Port shared.js to React hooks (useAudio, useClipboard, useRsvp)
└── Task 23: RSVP form + guestbook component (direct to Supabase)

Wave 5 (Integration + Verification — PARALLEL):
├── F1: Plan Compliance Audit (oracle)
├── F2: TypeScript + Build (unspecified-high)
├── F3: Real Manual QA via Playwright (unspecified-high)
└── F4: Scope Fidelity Check (deep)
```

Total: ~23 tasks + 4 verification = **~27 tasks**

---

## TODOs

### Wave 1 — Remove ALL AdonisJS + Edge.js (8 tasks PARALLEL)

- [x] 1. **Remove app/ Directory (Controllers, Middleware, Models, Validators)**

  **What to do**:
  - Delete entire `app/` directory (all subdirectories: controllers/, middleware/, models/, validators/, exceptions/, services/, dashboard/)

  **Must NOT do**:
  - Tidak ada — semua app/ adalah AdonisJS code

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2-9)
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `app/` directory tidak ada

  **Commit**: Wave 1 commit (merge with Tasks 2-9)

- [x] 2. **Remove resources/views/ Directory (ALL Edge.js Templates)**

  **What to do**:
  - Delete `resources/views/` directory entirely
  - This includes: invitation themes (java_style, image_sequence), admin pages, b2b pages, layouts, components, home.edge, AGENTS.md

  **Must NOT do**:
  - JANGAN hapus `resources/` — masih ada css/, js/

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 3-9)
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `resources/views/` tidak ada

  **Commit**: Wave 1 commit

- [x] 3. **Remove config/ Directory (AdonisJS Configs)**

  **What to do**:
  - Delete entire `config/` directory (app.ts, auth.ts, bodyparser.ts, database.ts, encryption.ts, hash.ts, logger.ts, session.ts, shield.ts, static.ts, vite.ts)

  **Must NOT do**:
  - JANGAN khawatir — Vite config pindah ke root, Tailwind config via package.json

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 2, 4-9)
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `config/` directory tidak ada

  **Commit**: Wave 1 commit

- [x] 4. **Remove start/ Directory (Routes, Kernel, Env)**

  **What to do**:
  - Delete entire `start/` directory (routes.ts, kernel.ts, env.ts, validator.ts)

  **Must NOT do**:
  - JANGAN khawatir — env vars akan pindah ke VITE_ prefixed di .env

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-3, 5-9)
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `start/` directory tidak ada

  **Commit**: Wave 1 commit

- [x] 5. **Remove bin/ + database/ + ace.js + adonisrc.ts**

  **What to do**:
  - Delete `bin/` directory (server.ts, console.ts, test.ts)
  - Delete `database/` directory (migrations/, schema.ts, seeders/, erd.md, README.md, schema_rules.ts)
  - Delete `ace.js`
  - Delete `adonisrc.ts`
  - Delete `docker-compose.yml` (Supabase via npx supabase start, not compose)

  **Must NOT do**:
  - JANGAN hapus `supabase/` — ini database baru yang dipakai

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-4, 6-9)
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `bin/`, `database/` tidak ada
  - [ ] `ace.js`, `adonisrc.ts` tidak ada

  **Commit**: Wave 1 commit

- [x] 6. **Remove Redundant Design Files & Other Artifacts**

  **What to do**:
  - Check `design/assets/` — ada 8 subdirectory dengan code.html + screen.png. code.html adalah HTML mockups yang mungkin redundant.
  - KEEP `design/assets/javanese_royal_heritage/DESIGN.md` — berisi design tokens yang masih dipakai
  - Remove `design/assets/*/code.html` files if they exist (HTML mockups, no longer needed)
  - Remove `flow/` directory (Mermaid diagrams — dokumentasi)
  - Remove `prompt` file at root (if exists)

  **Must NOT do**:
  - JANGAN hapus `design/` entirely — DESIGN.md masih berguna
  - JANGAN hapus `srs/` — dokumentasi SRS masih relevan

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-5, 7-9)
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] Redundant files removed
  - [ ] design/assets/javanese_royal_heritage/DESIGN.md masih ada

  **Commit**: Wave 1 commit

- [x] 7. **Update package.json — Remove ALL AdonisJS Dependencies**

  **What to do**:
  - REMOVE from `dependencies`:
    - `@adonisjs/auth`, `@adonisjs/core`, `@adonisjs/lucid`, `@adonisjs/session`
    - `@adonisjs/shield`, `@adonisjs/static`, `@adonisjs/vite`
    - `@vinejs/vine`, `better-sqlite3`, `edge.js`
    - `reflect-metadata` (confirm unused)
  - REMOVE from `devDependencies`:
    - `@adonisjs/assembler`, `@adonisjs/eslint-config`, `@adonisjs/prettier-config`, `@adonisjs/tsconfig`
    - `@japa/*` (all 4 packages)
    - `@poppinss/ts-exec`, `hot-hook`, `pino-pretty`, `youch`
    - `@types/alpinejs`, `alpinejs` — tidak dipakai lagi
  - KEEP: react, react-dom, @supabase/supabase-js, tailwindcss, gsap, shadcn/ui deps, vite, typescript, eslint, prettier, lucide-react, recharts, sonner, zod, dnd-kit, @tanstack/react-table, luxon, clsx, tailwind-merge, class-variance-authority, @radix-ui/*, vaul, next-themes
  - Update `scripts` section:
    - `"dev": "vite"` (instead of AdonisJS dev)
    - `"build": "vite build"` (instead of AdonisJS build)
    - `"preview": "vite preview"`
    - Remove: `"start"`, `"typecheck"` (tsc di-handle Vite), test-related
  - Update `imports` section: remove `#*` path aliases (kecuali masih dipakai)
  - Run `npm install` to clean up

  **Must NOT do**:
  - JANGAN hapus: react, react-dom, vite, typescript, tailwindcss, gsap, supabase-js
  - JANGAN hapus hot-hook kalau masih dipake untuk HMR (tapi All React pake Vite HMR)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-6, 8-9)
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **References**:
  - `package.json` — current file
  - `.sisyphus/drafts/cleanup-pernikahan.md` (sudah dihapus, data ada di draft sebelumnya)

  **Acceptance Criteria**:
  - [ ] Tidak ada @adonisjs/* packages
  - [ ] Tidak ada alpinejs
  - [ ] Tidak ada edge.js, @vinejs/vine, better-sqlite3
  - [ ] Script: `dev` = `vite`, `build` = `vite build`
  - [ ] `npm install` berhasil

  **QA Scenarios**:
  ```
  Scenario: npm install succeeds
    Tool: Bash
    Steps: npm install
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-7-npm-install.txt
  ```

  **Commit**: Wave 1 commit

- [x] 8. **Update tsconfig.json — Remove @adonisjs/tsconfig**

  **What to do**:
  - Change `"extends": "@adonisjs/tsconfig/tsconfig.app.json"` to standard React config:
    - Option A: install `@tsconfig/vite-react` and extend it
    - Option B: manual tsconfig with:
      ```json
      {
        "compilerOptions": {
          "target": "ES2020",
          "module": "ESNext",
          "moduleResolution": "bundler",
          "jsx": "react-jsx",
          "strict": true,
          "noEmit": true,
          "skipLibCheck": true,
          "paths": {
            "@/*": ["./resources/js/*"]
          }
        },
        "include": ["resources/js"]
      }
      ```
  - Keep `#*` path aliases OR replace with `@/*` standard

  **Must NOT do**:
  - JANGAN lupa include react-jsx untuk JSX support

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-7, 9)
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] Tidak ada reference ke @adonisjs/tsconfig
  - [ ] JSX configured for React
  - [ ] `tsc --noEmit` succeeds (or skip — Vite handles type checking)

  **Commit**: Wave 1 commit

- [x] 9. **Update vite.config.ts — Remove AdonisJS Plugin**

  **What to do**:
  - Remove `import adonisjs from '@adonisjs/vite/client'`
  - Remove `adonisjs()` from plugins array
  - Keep: `react()`, `tailwindcss()`
  - Update entry points if needed:
    - Entry: `resources/js/main.tsx` (new — need to create in Wave 2)
    - Entry: `resources/js/admin/index.tsx` (admin SPA)
  - Remove `reload: ['resources/views/**']` (views dihapus)

  **Must NOT do**:
  - JANGAN hapus `react()` dan `tailwindcss()` plugins

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-8)
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] Tidak ada import adonisjs
  - [ ] Hanya react() + tailwindcss() plugins
  - [ ] `npm run build` berhasil (nanti setelah Wave 2)

  **Commit**: Wave 1 commit

---

### Wave 2 — React SPA Infrastructure (5 tasks)

- [x] 10. **Set Up React Router (Public + Admin Routes)**

  **What to do**:
  - Install `react-router-dom` (if not already installed)
  - Create `resources/js/router.tsx` with route definitions:
    ```tsx
    // Public routes
    <Route path="/:slug_wo/:customer_id" element={<InvitationPage />} />
    <Route path="/:slug_wo/:customer_id/rsvp" element={<RsvpPage />} /> // or handle via component
    
    // Admin routes  
    <Route path="/admin/login" element={<LoginPage />} />
    <Route path="/admin/signup" element={<SignupPage />} />
    <Route path="/admin/:slug_wo" element={<AdminApp />} />
    <Route path="/admin/:slug_wo/customers/:customer_id" element={<AdminApp />} />
    
    // Fallback
    <Route path="*" element={<Navigate to="/admin/login" />} />
    ```
  - Wrap App with `BrowserRouter`

  **Must NOT do**:
  - JANGAN buat routing terlalu kompleks — keep it simple

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 11-14)
  - **Parallel Group**: Wave 2
  - **Blocked By**: Wave 1 (dependencies removed)

  **References**:
  - `start/routes.ts` — previous route patterns (for reference)
  - React Router docs: `react-router-dom` v6+

  **Acceptance Criteria**:
  - [ ] React Router terinstall
  - [ ] Route definitions match previous functionality
  - [ ] `npm run typecheck` passes

  **Commit**: Wave 2 commit (merge with 11-14)

- [x] 11. **Create React App Shell & Shared Components**

  **What to do**:
  - Create `resources/js/layouts/` directory:
    - `MainLayout.tsx` — replaces `layouts/main.edge`:
      - HTML shell with Google Fonts (Cinzel, Inter, Great Vibes, Playfair Display, Newsreader, Bodoni Moda)
      - `<title>` dynamic based on invitation
      - Open Graph meta tags for WhatsApp preview (og:title, og:description, og:image)
      - Audio player component
    - `AdminLayout.tsx` — replaces `layouts/admin.edge`:
      - Sidebar, header, content area
      - User context provider
  - Create `resources/js/contexts/` directory:
    - `AuthContext.tsx` — Supabase auth state provider
    - `ThemeContext.tsx` — theme preference (not critical)
  - Create `resources/js/components/shared/`:
    - `AudioPlayer.tsx` — port from shared.js initAudio
    - `Toast.tsx` — port from shared.js showToast
  
  **Must NOT do**:
  - JANGAN over-abstract — keep components simple

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10, 12-14)
  - **Parallel Group**: Wave 2
  - **Blocked By**: Wave 1

  **References**:
  - `resources/views/components/layouts/main.edge` — HTML shell reference
  - `resources/views/components/layouts/admin.edge` — admin layout reference
  - `resources/js/shared.js` — audio, toast, clipboard utilities

  **Acceptance Criteria**:
  - [ ] MainLayout renders with correct fonts
  - [ ] AdminLayout has sidebar + content structure
  - [ ] AuthContext provides user state
  - [ ] AudioPlayer component works

  **Commit**: Wave 2 commit

- [x] 12. **Set Up Vite Entry for Main SPA**

  **What to do**:
  - Create `resources/js/main.tsx` — main entry point for the full SPA:
    ```tsx
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import { RouterProvider } from 'react-router-dom'
    import { router } from './router'
    import './../css/app.css'
    import './../css/tailwind.css'
    
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    )
    ```
  - Update `index.html` at project root:
    - Create simple HTML shell with `<div id="root">` and Vite script tag
    - Include Google Fonts links
    - Include OG meta tags (will be set dynamically by React Helmet or similar)
  - Or create separate HTML entry points for public vs admin if needed

  **Must NOT do**:
  - JANGAN buat multiple entry points unless necessary — one SPA is simpler

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10, 11, 13, 14)
  - **Parallel Group**: Wave 2
  - **Blocked By**: Wave 1

  **References**:
  - `vite.config.ts` — entry point configuration
  - `resources/views/pages/admin/spa.edge` — previous HTML shell

  **Acceptance Criteria**:
  - [ ] `resources/js/main.tsx` exists
  - [ ] `index.html` exists at root
  - [ ] `npm run dev` shows the SPA

  **Commit**: Wave 2 commit

- [x] 13. **Update supabase-client.ts for Pure Env Var Config**

  **What to do**:
  - Simplify `resources/js/lib/supabase-client.ts`:
    - Remove `document.getElementById('server-config')` fallback
    - Only use `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
    - Export singleton client
  - Also export `supabaseAdmin` for service role operations? No — jangan expose service role di client. For admin operations, use Edge Functions where needed.

  **Must NOT do**:
  - JANGAN export service role key di client code

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10-12, 14)
  - **Parallel Group**: Wave 2
  - **Blocked By**: Wave 1

  **References**:
  - `resources/js/lib/supabase-client.ts` — current implementation
  - `.env` — ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

  **Acceptance Criteria**:
  - [ ] supabase-client.ts hanya pake import.meta.env.VITE_*
  - [ ] No server-config fallback

  **Commit**: Wave 2 commit

- [x] 14. **Update .env for Vite Compatibility**

  **What to do**:
  - Ensure `.env` has:
    ```
    VITE_SUPABASE_URL=http://127.0.0.1:54321
    VITE_SUPABASE_ANON_KEY=<anon-key>
    ```
  - Remove AdonisJS-specific vars: `APP_KEY`, `SESSION_DRIVER`, `HOST`, `LOG_LEVEL`, `APP_URL`
  - Keep: `NODE_ENV` (maybe)
  - Update `.env.example` accordingly
  - Update `.env.test` if needed

  **Must NOT do**:
  - JANGAN hapus SUPABASE vars — tetap dipakai

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10-13)
  - **Parallel Group**: Wave 2
  - **Blocked By**: Wave 1

  **Acceptance Criteria**:
  - [ ] .env contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
  - [ ] No AdonisJS-specific vars

  **Commit**: Wave 2 commit

---

### Wave 3 — Authentication (3 tasks, parallel within wave)

- [x] 15. **Convert Login Form to Supabase Auth PKCE**

  **What to do**:
  - Update `resources/js/admin/login.tsx`:
    - Hapus dependensi ke server-config
    - Gunakan `supabase.auth.signInWithPassword()` untuk login
    - Handle success: redirect ke `/admin/{slug_wo}` (dapat dari query atau user metadata)
    - Handle error: tampilkan toast/error message
  - Update `resources/js/components/login-form.tsx`:
    - Ganti form action POST ke AdonisJS dengan Supabase Auth call
    - Tambah loading state
    - Tambah error display

  **Must NOT do**:
  - JANGAN kirim password via form POST ke server

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 16, 17)
  - **Parallel Group**: Wave 3
  - **Blocked By**: Wave 2 (Router + supabase-client)

  **References**:
  - `app/controllers/admin_auth_controller.ts` — current login logic (for reference)
  - Supabase Auth docs: `signInWithPassword`, PKCE flow

  **Acceptance Criteria**:
  - [ ] Login via Supabase Auth PKCE
  - [ ] Setelah login, redirect ke /admin/{slug_wo}
  - [ ] Error login ditampilkan
  - [ ] No POST to AdonisJS

  **QA Scenarios**:
  ```
  Scenario: Login with valid credentials
    Tool: Playwright
    Steps:
      1. Navigate to /admin/login
      2. Fill email: admin@example.com, password: password123
      3. Click submit
    Expected Result: Redirect to /admin/royal-wo
    Evidence: .sisyphus/evidence/task-15-login-success.png

  Scenario: Login with invalid credentials
    Tool: Playwright
    Steps:
      1. Navigate to /admin/login
      2. Fill email: wrong@email.com, password: wrong
      3. Click submit
    Expected Result: Error message displayed
    Evidence: .sisyphus/evidence/task-15-login-error.png
  ```

  **Commit**: Wave 3 commit (merge with 16, 17)

- [x] 16. **Create Supabase Edge Function for Signup**

  **What to do**:
  - Create `supabase/functions/wo-signup/index.ts`:
    ```typescript
    import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
    
    serve(async (req) => {
      const { email, password, woName, woLocation, staffName } = await req.json()
      
      // 1. Create auth user
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // service role — server side only
      )
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true
      })
      if (authError) throw authError
      
      // 2. Create wedding_organization
      const { data: wo, error: woError } = await supabase
        .from('wedding_organization')
        .insert({ name: woName, slug: woName.toLowerCase().replace(/\s+/g, '-'), location: woLocation })
        .select()
        .single()
      if (woError) throw woError
      
      // 3. Create wo_staff
      const { error: staffError } = await supabase
        .from('wo_staff')
        .insert({ user_id: authUser.user.id, wo_id: wo.id, name: staffName, role: 'admin' })
      if (staffError) throw staffError
      
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
    })
    ```
  - Create `supabase/functions/wo-signup/config.toml` or `deno.json`
  - Set up function via `npx supabase functions deploy wo-signup`

  **Must NOT do**:
  - JANGAN expose service role key di client-side code

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 15, 17)
  - **Parallel Group**: Wave 3
  - **Blocked By**: Wave 2

  **References**:
  - Supabase Edge Functions docs
  - `app/controllers/admin_auth_controller.ts` — current signup logic

  **Acceptance Criteria**:
  - [ ] Edge function created at supabase/functions/wo-signup/
  - [ ] Function creates: auth user, wedding_organization, wo_staff
  - [ ] Function can be invoked via `supabase.functions.invoke('wo-signup')`

  **Commit**: Wave 3 commit

- [x] 17. **Update Admin App.tsx — Remove Server Config Dependency**

  **What to do**:
  - Update `resources/js/admin/App.tsx`:
    - Hapus pembacaan `window.__INITIAL_CONFIG__` atau `document.getElementById('server-config')`
    - Gunakan `useParams()` dari React Router untuk dapatkan `slug_wo`
    - Query `wedding_organization` dari Supabase: `.eq('slug', slug_wo).single()`
    - Dapatkan current user dari `supabase.auth.getUser()`
    - Update semua CRUD operasi untuk menggunakan authenticated Supabase client (already works)
  - Buat `resources/js/admin/hooks/useOrganization.ts`:
    - Custom hook untuk fetch org info dari URL slug

  **Must NOT do**:
  - JANGAN hardcode credentials atau org info

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 15, 16)
  - **Parallel Group**: Wave 3
  - **Blocked By**: Wave 2 (Router)

  **References**:
  - `resources/js/admin/App.tsx` — current implementation
  - `resources/views/pages/admin/spa.edge` — config injection (will be removed)

  **Acceptance Criteria**:
  - [ ] App.tsx tidak baca server-config
  - [ ] Org info di-fetch dari URL slug + Supabase query
  - [ ] Semua CRUD masih berfungsi
  - [ ] Logout works via Supabase Auth signOut

  **Commit**: Wave 3 commit

---

### Wave 4 — React Invitation Themes (6 tasks, PARALLEL within wave)

- [x] 18. **Create React Components for java_style Theme (7 sections)**

  **What to do**:
  - Create `resources/js/themes/java_style/` directory:
    - `index.tsx` — theme wrapper (orchestrates sections)
    - `Cover.tsx` — opening screen with "Buka Undangan" button
    - `Couple.tsx` — bride & groom introduction
    - `Event.tsx` — event details (akad, resepsi, location, maps link)
    - `Story.tsx` — love story timeline (use useStories hook)
    - `Gallery.tsx` — photo gallery with lightbox (use useGallery hook)
    - `Rsvp.tsx` — RSVP form + guestbook (use useRsvp hook)
    - `Closing.tsx` — gift registry + farewell
    - `Nav.tsx` — bottom navigation
  - Data flow: fetch from Supabase on mount:
    ```tsx
    const { data: invitation } = useQuery(['invitation', customerId], () =>
      supabase.from('invitations').select('*').eq('customer_id', customerId).single()
    )
    ```
  - Props: `customerId`, `slugWo` (dari route params)
  - Replace Edge.js `@if`/`@each` with React conditional rendering + `.map()`

  **Must NOT do**:
  - JANGAN lupakan conditional rendering (story/gallery hanya muncul jika ada data)
  - JANGAN hardcode styling — pakai existing CSS classes dari app.css

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 19-23)
  - **Parallel Group**: Wave 4
  - **Blocked By**: Wave 2 (Router, main entry)

  **References**:
  - `resources/views/components/invitation/java_style/*.edge` — 9 template files (UI reference)
  - `resources/css/app.css` — CSS classes for java_style theme (lines 1-1935)
  - `resources/js/themes/java_style.js` — GSAP animations (ported in Task 20)

  **Acceptance Criteria**:
  - [ ] 8 React components created
  - [ ] Theme renders correctly with Supabase data
  - [ ] Conditional sections work (no story/gallery if empty)
  - [ ] Google Maps link works
  - [ ] Bank copy-to-clipboard works

  **QA Scenarios**:
  ```
  Scenario: java_style theme renders
    Tool: Playwright
    Steps:
      1. Navigate to /royal-wo/d3c1a111 (customer with java_style)
      2. Click "BUKA UNDANGAN"
    Expected Result: Full invitation displays with all sections
    Evidence: .sisyphus/evidence/task-18-java-style.png
  ```

  **Commit**: Wave 4 commit (merge with 19-23 or separate)

- [x] 19. **Create React Components for image_sequence Theme (5 sections)**

  **What to do**:
  - Create `resources/js/themes/image_sequence/` directory:
    - `index.tsx` — theme wrapper
    - `Cover.tsx` — editorial full-bleed cover
    - `Couple.tsx` — pinned scroll image sequence (GSAP ScrollTrigger)
    - `Event.tsx` — editorial event blocks
    - `Rsvp.tsx` — RSVP + gift registry
    - `Closing.tsx` — editorial closing
    - `Nav.tsx` — header + mobile bottom nav
  - Simpler than java_style — no separate story/gallery sections
  - ScrollTrigger for pinned image sequence

  **Must NOT do**:
  - JANGAN lupa ScrollTrigger cleanup di useEffect return

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 18, 20-23)
  - **Parallel Group**: Wave 4
  - **Blocked By**: Wave 2

  **References**:
  - `resources/views/components/invitation/image_sequence/*.edge` — 7 template files
  - `resources/css/app.css` — image_sequence theme CSS (lines 1937-2820)
  - `resources/js/themes/image_sequence.js` — GSAP ScrollTrigger (ported in Task 21)

  **Acceptance Criteria**:
  - [ ] 6 React components created
  - [ ] Theme renders with pinned scroll sequence
  - [ ] RSVP form works

  **QA Scenarios**:
  ```
  Scenario: image_sequence theme renders
    Tool: Playwright
    Steps:
      1. Navigate to /royal-wo/d3c1a222 (customer with image_sequence)
      2. Click "BUKA UNDANGAN"
    Expected Result: Editorial-style invitation displays
    Evidence: .sisyphus/evidence/task-19-image-sequence.png
  ```

  **Commit**: Wave 4 commit

- [x] 20. **Port java_style.js GSAP to React Hooks**

  **What to do**:
  - Create `resources/js/themes/java_style/hooks/`:
    - `useCoverAnimation.ts` — cover entrance animation (GSAP timeline)
    - `useCountdown.ts` — countdown timer (setInterval + state)
    - `useFlowerPetals.ts` — falling jasmine petals (setInterval + DOM via ref)
    - `useScrollReveal.ts` — IntersectionObserver for fade-up sections
    - `useGalleryLightbox.ts` — photo lightbox open/close/navigate state
    - `useNavHighlight.ts` — scroll-based nav highlight
  - Key patterns:
    ```tsx
    // useCountdown example
    export function useCountdown(targetDate: string) {
      const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      useEffect(() => {
        const interval = setInterval(() => {
          const diff = new Date(targetDate).getTime() - Date.now()
          if (diff <= 0) { clearInterval(interval); return }
          setTimeLeft({
            days: Math.floor(diff / (1000*60*60*24)),
            hours: Math.floor((diff / (1000*60*60)) % 24),
            minutes: Math.floor((diff / (1000*60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
          })
        }, 1000)
        return () => clearInterval(interval)
      }, [targetDate])
      return timeLeft
    }
    ```

  **Must NOT do**:
  - JANGAN lupa useEffect cleanup untuk semua interval + observer

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 18, 19, 21-23)
  - **Parallel Group**: Wave 4
  - **Blocked By**: None (hooks independent of components)

  **References**:
  - `resources/js/themes/java_style.js` — full animation logic (251 lines)
  - GSAP docs: gsap.to/from, Timeline, ScrollTrigger in React

  **Acceptance Criteria**:
  - [ ] All hooks created
  - [ ] Countdown counts correctly
  - [ ] Flower petals animate
  - [ ] Scroll reveal works
  - [ ] Lightbox opens/closes
  - [ ] No memory leaks (all intervals cleaned up)

  **Commit**: Wave 4 commit

- [x] 21. **Port image_sequence.js GSAP to React Hooks**

  **What to do**:
  - Create `resources/js/themes/image_sequence/hooks/`:
    - `useScrollSequence.ts` — GSAP ScrollTrigger for pinned image sequence
    - `useEditorialNav.ts` — scroll-based nav highlight for editorial style
    - `useCoverSequence.ts` — cover animation
  - Key pattern for ScrollTrigger:
    ```tsx
    export function useScrollSequence(containerRef: RefObject<HTMLDivElement>, totalFrames: number) {
      useEffect(() => {
        const trigger = ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${window.innerHeight * totalFrames}`,
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            // update active slide based on progress
          }
        })
        return () => trigger.kill()  // CRITICAL cleanup
      }, [containerRef, totalFrames])
    }
    ```

  **Must NOT do**:
  - JANGAN lupa ScrollTrigger.kill() — otherwise animation breaks on re-render

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 18-20, 22-23)
  - **Parallel Group**: Wave 4
  - **Blocked By**: None

  **References**:
  - `resources/js/themes/image_sequence.js` — full animation logic (177 lines)
  - GSAP ScrollTrigger docs

  **Acceptance Criteria**:
  - [ ] ScrollTrigger pinned sequence works
  - [ ] Cleanup on unmount works (no duplicate triggers)
  - [ ] Editorial nav highlight works on scroll

  **Commit**: Wave 4 commit

- [x] 22. **Port shared.js Utilities to React Hooks**

  **What to do**:
  - Create `resources/js/hooks/` (shared hooks):
    - `useAudio.ts` — background music player:
      ```tsx
      export function useAudio(audioUrl?: string) {
        const [isPlaying, setIsPlaying] = useState(false)
        const audioRef = useRef<HTMLAudioElement | null>(null)
        
        useEffect(() => {
          if (!audioUrl) return
          audioRef.current = new Audio(audioUrl)
          audioRef.current.loop = true
          return () => { audioRef.current?.pause(); audioRef.current = null }
        }, [audioUrl])
        
        const toggleAudio = () => {
          if (audioRef.current?.paused) { audioRef.current.play(); setIsPlaying(true) }
          else { audioRef.current?.pause(); setIsPlaying(false) }
        }
        
        return { isPlaying, toggleAudio }
      }
      ```
    - `useClipboard.ts` — copy-to-clipboard with toast
    - `useRsvp.ts` — RSVP form submission + guest list fetch
  - Update `shared.js` tidak dihapus dulu sampai semua consumer pindah

  **Must NOT do**:
  - JANGAN hapus shared.js sampai semua theme components pake React hooks

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 18-21, 23)
  - **Parallel Group**: Wave 4
  - **Blocked By**: None

  **References**:
  - `resources/js/shared.js` — current implementation (132 lines)

  **Acceptance Criteria**:
  - [ ] useAudio hook works (play/pause, no memory leaks)
  - [ ] useClipboard works (copy to clipboard + toast)
  - [ ] useRsvp works (submit RSVP to Supabase + refresh guest list)

  **Commit**: Wave 4 commit

- [x] 23. **Create RSVP Form + Guestbook Component (Direct to Supabase)**

  **What to do**:
  - Create `resources/js/components/public/RsvpForm.tsx`:
    - Form fields: name, attendance (hadir/tidak), guest count, comment
    - Submit langsung ke `supabase.from('admin_guests').insert({...})`
    - RLS policy for admin_guests: PUBLIC INSERT (already exists)
    - After submit: refresh guest list & show success toast
  - Create `resources/js/components/public/Guestbook.tsx`:
    - Display list of guests with names, comments, timestamps
    - Filter: attending vs not attending
    - Real-time updates after RSVP submit

  **Must NOT do**:
  - JANGAN repost ke endpoint server — langsung ke Supabase

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 18-22)
  - **Parallel Group**: Wave 4
  - **Blocked By**: Wave 2 (supabase-client)

  **References**:
  - `resources/views/components/invitation/java_style/rsvp.edge` — RSVP form template
  - `resources/views/components/invitation/image_sequence/rsvp.edge` — editorial RSVP
  - `resources/js/shared.js` — initRsvpForm (56-110) for reference

  **Acceptance Criteria**:
  - [ ] RSVP form submits to Supabase admin_guests table
  - [ ] Guest list refreshes after submission
  - [ ] Error state handled
  - [ ] Loading state during submission

  **QA Scenarios**:
  ```
  Scenario: RSVP submission
    Tool: Playwright
    Steps:
      1. Navigate to public invitation page (java_style)
      2. Scroll to RSVP section
      3. Fill name: "Test Guest"
      4. Select attendance: "Hadir"
      5. Add comment: "Selamat!"
      6. Click submit
    Expected Result: Success toast, guest list updated
    Evidence: .sisyphus/evidence/task-23-rsvp-success.png
  ```

  **Commit**: Wave 4 commit

> 4 review agents run in PARALLEL. ALL must APPROVE.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **TypeScript + Build** — `unspecified-high`
  Run `tsc --noEmit` + `npm run build`. Verify no errors. Check no remaining AdonisJS/Edge.js references.
  Output: `TypeScript [PASS/FAIL] | Build [PASS/FAIL] | VERDICT`

- [x] F3. **Real Manual QA** — Playwright
  Test ALL key flows from clean state:
  1. Dev server starts
  2. Public invitation page loads (both themes)
  3. RSVP submission works
  4. Admin login (PKCE)
  5. Admin dashboard loads
  6. Customer CRUD works
  7. B2B routes return 404
  8. No 500 errors
  Output: `Scenarios [N/N pass] | Evidence [N/N files] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual git diff. Verify 1:1 — everything built, nothing crept.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Wave 1**: 1-2 commits — `clean: remove AdonisJS backend and Edge.js templates`
- **Wave 2**: 1 commit — `feat: setup React Router and app shell`
- **Wave 3**: 1 commit — `feat: migrate auth to Supabase PKCE`
- **Wave 4**: 1-2 commits — `feat: convert invitation themes to React`
- **Wave 5**: fixup commits based on verification

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck   # Expected: 0 errors
npm run build       # Expected: build successful, files in build/
npm run dev         # Expected: Vite dev server starts
```

### Final Checklist
- [ ] No AdonisJS files remaining (controllers, configs, views, middleware, models)
- [ ] No Edge.js templates remaining
- [ ] No Alpine.js code for admin (Alpine hanya di public yang sudah di-port)
- [ ] No .edge files in project
- [ ] All packages are React/Supabase only
- [ ] React Router handles all routes
- [ ] GSAP animations work in React components
- [ ] Public invitation pages load via React
- [ ] Admin login works via Supabase PKCE
- [ ] Admin dashboard CRUD works
- [ ] RSVP submission works
- [ ] `npm run build` produces static files
