# OTP Flow Fix — Perbaikan Session & Auto-Login Google OAuth

## TL;DR

> **Quick Summary**: Memperbaiki 2 bug pada OTP flow: (1) error "Email pengirim tidak valid" setelah refresh halaman OTP, dan (2) auto-login gagal setelah verifikasi OTP untuk pengguna Google OAuth.
>
> **Deliverables**:
> - Perbaikan `otp-form.tsx` — sessionStorage fallback + better error handling
> - Perbaikan `signup-form.tsx` — pastikan data signup konsisten + **401 error popup dialog**
> - Perbaikan `verify-otp/index.ts` — return session token untuk auto-login
> - ** Popup error dialog** saat signup webhook returns 401
>
> **Estimated Effort**: Quick
> **Parallel Execution**: YES — 2 waves
> **Critical Path**: Task 1 → Task 2 → Task 3

---

## Context

### Original Request
Pengguna mengalami masalah OTP: setelah register via Google OAuth, redirect ke halaman OTP, lalu refresh page → error "Email pengirim tidak valid". Juga setelah OTP berhasil diverifikasi, auto-login tidak berfungsi untuk pengguna Google (harus klik "Masuk dengan Google" lagi).

### Interview Summary
**Key Findings**:
- Backend Edge Functions (`wo-signup`, `verify-otp`) berfungsi normal — sudah diverifikasi via curl dan Playwright
- SessionStorage fallback bekerja dengan benar setelah page refresh — sudah diverifikasi dengan Playwright
- Error "Email pengirim tidak valid" (baris 95-97 `otp-form.tsx`) terjadi ketika `email` state kosong
- Untuk Google OAuth, `password` adalah `''` (string kosong) karena field password disembunyikan di form
- `otp-form.tsx` baris 122: `if (stateData?.password)` → falsy → auto-login skip

**Metis Review**:
- ✅ Bug #1: Email state lost on refresh → sessionStorage fallback sudah ada tapi perlu perbaikan error handling
- ✅ Bug #2: Google OAuth auto-login → butuh alternatif login path (tidak pakai password)
- ⚠️ Guardrails: JANGAN ubah wo-signup, n8n, atau Supabase Auth config

---

## Work Objectives

### Core Objective
Memperbaiki OTP flow untuk Google OAuth user — memastikan session tidak hilang setelah refresh dan auto-login berfungsi setelah verifikasi.

### Concrete Deliverables
- `resources/js/components/otp-form.tsx` — improved error handling + fallback + auto-login
- `resources/js/components/signup-form.tsx` — kirim data lebih eksplisit
- `supabase/volumes/functions/verify-otp/index.ts` — return session info untuk auto-login

### Definition of Done
- [ ] Test Playwright: Google OAuth → signup → OTP → refresh → email tetap terisi
- [ ] Test Playwright: Google OAuth → OTP verify → auto-login ke dashboard
- [ ] Tidak ada console error di semua flow

### Must Have
- Email tetap terisi setelah refresh halaman OTP
- Auto-login berhasil setelah OTP verification (Google OAuth user)

### Must NOT Have (Guardrails)
- JANGAN ubah `wo-signup` Edge Function
- JANGAN ubah n8n workflow
- JANGAN ubah Supabase Auth config
- JANGAN tambah npm packages baru

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO (no test framework setup)
- **Automated tests**: None
- **Agent-Executed QA**: Playwright untuk browser flow verification

### QA Policy
Setiap task memiliki Playwright QA scenarios dengan evidence screenshots.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (2 tasks — core fixes, parallel):
├── Task 1: Fix verify-otp — return session tokens untuk auto-login [quick]
├── Task 2: Fix otp-form — better error handling + auto-login [quick]
└── Task A: Add 401 error popup dialog to signup-form [quick]

Wave 2 (1 task — integration test):
└── Task 3: Full flow verification dengan Playwright [quick]
```

---

## TODOs

- [x] 1. Perbaiki `verify-otp` — return session info untuk auto-login

  **What to do**:
  - Di `verify-otp/index.ts`, setelah berhasil membuat user dan organisasi, gunakan `supabase.auth.admin.generateLink()` untuk membuat magic link atau return data yang cukup untuk auto-login
  - Alternatif: Return temporary token atau session access_token agar frontend bisa auto-login tanpa password
  - Untuk Google OAuth user, setelah OTP verify, user SUDAH punya session Google aktif. Jadi setelah verify-otp sukses, frontend bisa langsung redirect ke `/admin` (bukan `/login`) dan App.tsx akan mendeteksi `wo_slug` di metadata

  **Must NOT do**:
  - JANGAN expose service_role key ke client
  - JANGAN ubah wo-signup

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Justification**: Single file change, logic sederhana

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `supabase/volumes/functions/verify-otp/index.ts` — file yang akan diubah
  - `resources/js/components/otp-form.tsx:118-140` — frontend yang akan pakai response baru

  **Acceptance Criteria**:
  - verify-otp tetap return `{ success: true, slug, email }` seperti sebelumnya (backward compatible)
  - Untuk Google OAuth user, frontend bisa auto-redirect ke `/admin` tanpa password

  **QA Scenarios**:
  ```
  Scenario: verify-otp tetap return slug untuk email/password users
    Tool: Bash (curl)
    Preconditions: OTP record exists in DB
    Steps:
      1. curl -X POST /functions/v1/verify-otp -d '{"email":"test@example.com","otp":"123456"}'
    Expected Result: Response contains success: true and slug
    Evidence: .sisyphus/evidence/task-1-verify-otp-response.json
  ```

- [x] 2. Perbaiki `otp-form.tsx` — fallback + error handling + auto-login

- [x] A. Tambah popup dialog error saat signup returns 401

  **What to do**:
  - Di `signup-form.tsx`, saat klik tombol "Daftar", catch jika response dari `wo-signup` Edge Function returns HTTP 401
  - Jika 401, tampilkan popup dialog (shadcn/ui Dialog atau custom modal) dengan pesan error yang di-return dari webhook
  - Pesan error harus berupa teks yang di-return dari Edge Function response (misalnya: "Email sudah terdaftar", "Invalid Google token", dll)
  - Dialog harus memiliki tombol "Tutup" untuk menutup popup

  **Must NOT do**:
  - JANGAN ubah wo-signup Edge Function
  - JANGAN ubah n8n workflow
  - JANGAN tambah npm packages baru

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["shadcn-ui"]`
  - **Justification**: UI component + single file change

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `resources/js/components/signup-form.tsx` — file yang akan diubah
  - `resources/js/components/ui/dialog.tsx` — shadcn/ui Dialog component (cek jika sudah ada)
  - `resources/js/components/otp-form.tsx` — reference untuk error dialog pattern

  **Acceptance Criteria**:
  - Saat signup returns 401, popup dialog muncul dengan pesan error yang sesuai
  - Dialog bisa ditutup dengan tombol "Tutup"
  - Popup tidak blocking halaman utama

  **QA Scenarios**:
  ```
  Scenario: Signup returns 401 → error popup appears
    Tool: Playwright
    Preconditions: Mock wo-signup to return 401 with message "Email sudah terdaftar"
    Steps:
      1. Navigate to /signup
      2. Fill form with existing email
      3. Click "Daftar"
      4. Check if dialog appears
    Expected Result: Dialog with error message "Email sudah terdaftar"
    Evidence: .sisyphus/evidence/task-a-401-popup.png
  ```

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Baca plan. Verifikasi semua Must Have terpenuhi, Must NOT tidak dilanggar.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Cek error handling, console.log, TypeScript types.

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Execute QA scenarios dari setiap task.

- [ ] F4. **Scope Fidelity Check** — `deep`
  Pastikan tidak ada perubahan di luar scope.

---

## Commit Strategy

- **1, 2, 3**: `fix(auth): perbaiki OTP flow — session fallback dan auto-login Google OAuth`

---

## Success Criteria

### Verification Commands
```bash
# Test verify-otp masih berfungsi
curl -X POST http://localhost:8000/functions/v1/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"email":"test@example.com","otp":"123456"}'
# Expected: {"error":"Kode verifikasi tidak ditemukan untuk email ini."} atau {"success":true,...}
```

### Final Checklist
- [ ] Error "Email pengirim tidak valid" tidak muncul lagi setelah refresh
- [ ] Google OAuth user auto-login ke dashboard setelah OTP verify
- [ ] Semua existing flow (email/password) tetap berfungsi
- [ ] Signup 401 returns popup dialog dengan pesan error yang sesuai
