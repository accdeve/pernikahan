# 10 — Spesifikasi Modul Detail

## 10.1 Modul Wedding Organization

### 10.1.1 Create WO

- **Endpoint:** `POST /api/wo`
- **Input:** `{ name: string, email: string, location?: string }`
- **Proses:**
  1. Validasi input (Zod di Edge Function atau CHECK constraint di DB)
  2. Cek email unik
  3. INSERT ke `wedding_organization`
  4. INSERT staff pertama dengan role `admin` (gunakan email dan default password)
- **Output:** `{ id, name, email, location, created_at }`
- **Error:** Email already exists, validation error

### 10.1.2 Get WO Profile

- **Endpoint:** `GET /api/wo/:id`
- **Akses:** WO Staff (semua role)
- **Output:** Detail WO + ringkasan (total customer, active templates, total tamu)

### 10.1.3 Update WO

- **Endpoint:** `PUT /api/wo/:id`
- **Akses:** WO Admin
- **Input:** `{ name?, email?, location? }`
- **Proses:** Update field yang diubah

## 10.2 Modul Staff & Autentikasi (Supabase Auth)

### 10.2.1 Sign Up (WO Admin creates staff)

- **Method:** `supabase.auth.signUp()` + INSERT `wo_staff`
- **Input:** `{ email, password, name, role }`
- **Proses:**
  1. Panggil `supabase.auth.admin.createUser()` (gunakan service_role key dari Edge Function)
  2. Ambil `user.id` dari response
  3. INSERT ke `wo_staff` dengan `user_id`, `wo_id`, `name`, `email`, `role`
  4. Update `auth.users.app_metadata` dengan `{ wo_id, role }` via `supabase.auth.admin.updateUserById()`
- **Client-side:** Via Edge Function (service_role required)

### 10.2.2 Login

- **Method:** `supabase.auth.signInWithPassword({ email, password })`
- **Proses:** Supabase Auth memverifikasi, return JWT
- **Output:** `{ user, session }` — JWT access token + refresh token
- **Client:** Simpan session, redirect ke dashboard
- **JWT payload:** `{ app_metadata: { wo_id, role } }`

### 10.2.3 Logout

- **Method:** `supabase.auth.signOut()`
- **Proses:** Hapus session lokal, revoke refresh token

### 10.2.4 Get Current User

- **Method:** `supabase.auth.getUser()`
- **Output:** User object + `app_metadata.wo_id`, `app_metadata.role`
- **Client guard:** Redirect ke login jika tidak ada session

### 10.2.5 List Staff

- **Query langsung:** `supabase.from('wo_staff').select('*')` — otomatis difilter RLS
- **Akses:** WO Admin
- **Output:** Array staff (tanpa data auth.users)

### 10.2.6 Update Staff Role

- **Proses:**
  1. UPDATE `wo_staff` SET `role` WHERE `id` = staff_id
  2. Update `auth.users.app_metadata.role` via Edge Function (service_role)

### 10.2.7 Delete Staff

- **Akses:** WO Admin
- **Proses:**
  1. DELETE `wo_staff` WHERE `id` = staff_id
  2. Panggil `supabase.auth.admin.deleteUser()` via Edge Function
- **Constraint:** Tidak bisa menghapus staff terakhir dengan role admin

### 10.2.8 RBAC via RLS

- **Tidak perlu middleware terpisah** — RLS policy menangani otorisasi:

```sql
-- Policy: editor hanya bisa SELECT/INSERT/UPDATE, tidak DELETE
CREATE POLICY "editor_read_write" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM wo_staff WHERE user_id = auth.uid() AND role IN ('admin','editor'))
  );

-- Policy: viewer hanya SELECT
CREATE POLICY "viewer_read_only" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM wo_staff WHERE user_id = auth.uid() AND role IN ('admin','editor','viewer'))
  );
```

## 10.3 Modul Customer

### 10.3.1 Create Customer

- **Endpoint:** `POST /api/wo/:woId/customers`
- **Akses:** WO Admin, Editor
- **Input:** `{ email, male_name, female_name }`
- **Proses:** INSERT ke `customers`
- **Output:** Customer object

### 10.3.2 List Customers

- **Endpoint:** `GET /api/wo/:woId/customers`
- **Akses:** WO Admin, Editor, Viewer
- **Query params:** `?search=`, `?page=1`, `?perPage=20`
- **Output:** Paginated customer list + total count + active template status

### 10.3.3 Get Customer Detail

- **Endpoint:** `GET /api/wo/:woId/customers/:id`
- **Output:** Customer + terkait: template aktif, total tamu, total komentar, metadata

### 10.3.4 Update Customer

- **Endpoint:** `PUT /api/wo/:woId/customers/:id`
- **Input:** `{ email?, male_name?, female_name? }`
- **Akses:** WO Admin, Editor

### 10.3.5 Delete Customer

- **Endpoint:** `DELETE /api/wo/:woId/customers/:id`
- **Akses:** WO Admin
- **Constraint:** Hanya bisa menghapus jika tidak ada template aktif

## 10.4 Modul Template

### 10.4.1 List Templates (Global)

- **Endpoint:** `GET /api/templates`
- **Akses:** WO Staff (semua role)
- **Query:** `?category=basic|premium`
- **Output:** Array template dengan thumbnail

### 10.4.2 List Templates by Plan

- **Endpoint:** `GET /api/plans/:planId/templates`
- **Proses:** JOIN `plan_template` → `templates`
- **Output:** Template yang termasuk dalam plan tersebut

### 10.4.3 Create Template (Platform Admin)

- **Endpoint:** `POST /api/admin/templates`
- **Akses:** Platform Admin (bukan WO)
- **Input:** `{ name, thumbnail?, category, config }`
- **Config JSONB:** Layout settings, colour scheme, component configuration

### 10.4.4 Update Template Config

- **Endpoint:** `PUT /api/admin/templates/:id`
- **Input:** `{ config: JSONB }` — partial update dari config

## 10.5 Modul Plan & Subscription

### 10.5.1 List Plans

- **Endpoint:** `GET /api/plans`
- **Output:** Array plan dengan harga dan template included count

### 10.5.2 Subscribe WO to Plan

- **Endpoint:** `POST /api/wo/:woId/plans`
- **Input:** `{ plan_id, start_date }`
- **Proses:**
  1. Cek apakah sudah ada subscription active
  2. INSERT `wo_plan` dengan status `active`
  3. Hitung `end_date` = `start_date` + 30 hari (atau sesuai durasi plan)
- **Output:** wo_plan object

### 10.5.3 Check Plan Status

- **Endpoint:** `GET /api/wo/:woId/plans/active`
- **Output:** Active plan (jika ada) + sisa hari

### 10.5.4 Expire Subscription (Cron/System)

- **Trigger:** Cron harian — cek `wo_plan` dengan `end_date < now()` dan `status = 'active'`
- **Action:** UPDATE `status = 'expired'`
- **Note:** Template yang terkait masih bisa diakses (read-only), tapi tidak bisa buat yang baru

## 10.6 Modul Undangan (Wedding)

### 10.6.1 Assign Template to Customer

- **Endpoint:** `POST /api/wo/:woId/customers/:customerId/template`
- **Akses:** WO Admin, Editor
- **Input:** `{ template_id, type: 'wedding', start_date }`
- **Proses:**
  1. Validasi: customer belum punya template aktif untuk tipe `wedding`
  2. Validasi: WO memiliki plan active yang mencakup template tersebut
  3. INSERT `customer_template` (active=true)
  4. INSERT `cust_metadata` awal
  5. Generate invoice (status: pending)
  6. Redirect ke halaman pembayaran
- **Catatan:** Undangan aktif setelah invoice dibayar

### 10.6.2 Get Invitation Public Page

- **Endpoint:** `GET /invitation/:slug`
- **Akses:** Public
- **Proses:**
  1. Cari `customer_template` berdasarkan slug
  2. Cek `active = true` dan `end_date > now()`
  3. Load template `config`
  4. Load `cust_metadata`
  5. Render halaman undangan dengan template yang dipilih
- **Output:** Halaman React (SSR untuk SEO) atau static page dengan data dari Supabase

### 10.6.3 Update Cust Metadata

- **Endpoint:** `PUT /api/wo/:woId/customers/:customerId/metadata`
- **Akses:** WO Admin, Editor
- **Input:** `{ date?, location?, address?, akad_date?, reception_date?, love_story?, bank_account? }`

### 10.6.4 Deactivate Invitation (System — Edge Function)

- **Trigger:** Scheduled Edge Function (`cron-invitation-expiry`)
- **Proses:**
  1. Query: `customer_template` dengan `active=true` dan `end_date < now()`
  2. UPDATE `active = false`
  3. Log: "Invitation deactivated"

### 10.6.5 Get Invitation Status (WO Dashboard)

- **Endpoint:** `GET /api/wo/:woId/customers/:customerId/invitation-status`
- **Output:** `{ active, start_date, end_date, days_left, total_guests, total_comments, total_checkins, total_photobooth }`

## 10.7 Modul Anniversary Memory Book

### 10.7.1 Activate Anniversary

- **Endpoint:** `POST /api/wo/:woId/customers/:customerId/anniversary`
- **Akses:** WO Admin, Editor
- **Input:** `{ template_id }`
- **Proses:**
  1. INSERT `customer_template` dengan `type='anniversary', active=true`
  2. INSERT `cust_metadata` dengan `type='anniversary'`
  3. COPY data dari wedding `cust_metadata` (love_story, foto, dll)
  4. Generate link permanen
- **Output:** `{ anniversary_link }`

### 10.7.2 Anniversary Public Page

- **Endpoint:** `GET /anniversary/:slug`
- **Akses:** Public (dengan link)
- **Proses:**
  1. Cari `customer_template` berdasarkan slug
  2. Cek `type='anniversary'` dan subscription active
  3. Load semua momen dari `love_story` (JSONB)
  4. Load data wedding dari `cust_metadata` sebelumnya
  5. Render halaman memory book

### 10.7.3 Add Moment (Customer Action)

- **Endpoint:** `POST /anniversary/:slug/moments`
- **Akses:** Customer (via link — perlu verifikasi sederhana)
- **Input:** `{ photo, date, story, location }`
- **Proses:**
  1. Upload foto ke storage
  2. Append moment ke `cust_metadata.love_story` (JSONB)
  3. Return updated moments list

## 10.8 Modul Tamu & RSVP

### 10.8.1 Submit RSVP

- **Endpoint:** `POST /invitation/:slug/rsvp`
- **Akses:** Public
- **Input:** `{ name, rsvp_status, guest_count?, reason? }`
- **Proses:**
  1. Cari customer_template berdasarkan slug
  2. INSERT ke `guests` dengan `wo_id`, `customer_id`
  3. Return success
- **Rate limit:** Maksimal 10 RSVP per menit per IP

### 10.8.2 Update RSVP

- **Endpoint:** `PUT /invitation/:slug/rsvp/:guestId`
- **Input:** `{ rsvp_status?, guest_count?, reason? }`
- **Proses:** Update fields yang diubah

### 10.8.3 List Guests (WO Dashboard)

- **Endpoint:** `GET /api/wo/:woId/customers/:customerId/guests`
- **Akses:** WO Admin, Editor, Viewer
- **Output:** Paginated list + summary (total, confirmed, declined)

### 10.8.4 Export Guests

- **Endpoint:** `GET /api/wo/:woId/customers/:customerId/guests/export`
- **Output:** CSV file dengan data tamu

## 10.9 Modul Komentar

### 10.9.1 Submit Comment

- **Endpoint:** `POST /invitation/:slug/comments`
- **Akses:** Public
- **Input:** `{ guest_id, comment }`
- **Proses:**
  1. Validasi guest_id milik customer ini
  2. INSERT ke `cust_comment`
- **Rate limit:** Maksimal 5 komentar per menit per IP

### 10.9.2 List Comments

- **Endpoint:** `GET /invitation/:slug/comments`
- **Akses:** Public
- **Output:** Array of comments (dengan nama guest)

### 10.9.3 Delete Comment (WO)

- **Endpoint:** `DELETE /api/wo/:woId/customers/:customerId/comments/:id`
- **Akses:** WO Admin, Editor
- **Proses:** Soft delete atau hard delete

## 10.10 Modul Attendance (Check-in)

### 10.10.1 Check-in Guest

- **Method:** `supabase.from('attendance').insert(...)` — dengan RLS policy public INSERT
- **Akses:** Public (di hari H, via QR code atau link)
- **Input:** `{ guest_id, wo_id, customer_id }`
- **Proses:**
  1. Validasi guest_id
  2. INSERT ke `attendance`
  3. Return success
- **Constraint:** Satu guest hanya bisa check-in sekali

### 10.10.2 Get Attendance List (WO Dashboard)

- **Endpoint:** `GET /api/wo/:woId/customers/:customerId/attendance`
- **Output:** List guest yang sudah check-in + timestamp

### 10.10.3 Attendance Summary

- **Endpoint:** `GET /api/wo/:woId/customers/:customerId/attendance/summary`
- **Output:** `{ total_confirmed, total_checked_in, percentage }`

## 10.11 Modul Photobooth

### 10.11.1 Upload Photobooth Photo

- **Method:** Upload ke **Supabase Storage** bucket `photobooth` + INSERT ke table
- **Akses:** Public
- **Input:** `{ guest_id, image }` (file)
- **Proses:**
  1. Upload image ke `supabase.storage.from('photobooth').upload(path, file)`
  2. Dapatkan `image_url` = `supabase.storage.from('photobooth').getPublicUrl(path)`
  3. INSERT ke `photobooth` dengan `image_url`

### 10.11.2 List Photobooth Photos

- **Endpoint:** `GET /invitation/:slug/photobooth`
- **Output:** Array of photo URLs (dengan guest name)

### 10.11.3 Delete Photo (WO)

- **Endpoint:** `DELETE /api/wo/:woId/customers/:customerId/photobooth/:id`
- **Akses:** WO Admin

## 10.12 Modul Gallery

### 10.12.1 List Gallery (Global)

- **Endpoint:** `GET /api/gallery`
- **Output:** Array gambar/video dari `gallery` table

### 10.12.2 Upload to Gallery (Platform Admin)

- **Endpoint:** `POST /api/admin/gallery`
- **Input:** `{ image?, video? }`
- **Output:** Gallery item dengan id (integer)

## 10.13 Modul Payment Method

### 10.13.1 Add Payment Method

- **Endpoint:** `POST /api/wo/:woId/payment-methods`
- **Akses:** WO Admin
- **Input:** `{ type, provider, token }`
- **Proses:** INSERT ke `payment_method`

### 10.13.2 List Payment Methods

- **Endpoint:** `GET /api/wo/:woId/payment-methods`
- **Output:** Array metode pembayaran + indikator default

### 10.13.3 Set Default

- **Endpoint:** `PUT /api/wo/:woId/payment-methods/:id/default`
- **Proses:** Set `is_default=false` untuk semua, lalu `is_default=true` untuk yang dipilih

## 10.14 Modul Invoice & Payment

### 10.14.1 Create Invoice

- **Endpoint:** `POST /api/wo/:woId/invoices` (system, triggered saat charge)
- **Input:** `{ customer_template_id, description?, subtotal, tax?, total, due_date }`
- **Proses:**
  1. Generate `invoice_number` unik
  2. INSERT ke `invoice` (status: pending)
  3. Return invoice object

### 10.14.2 List Invoices

- **Endpoint:** `GET /api/wo/:woId/invoices`
- **Query:** `?status=pending|paid|overdue`
- **Output:** Paginated list invoice

### 10.14.3 Pay Invoice

- **Endpoint:** `POST /api/wo/:woId/invoices/:id/pay`
- **Input:** `{ payment_method_id }`
- **Proses:**
  1. Cek status invoice `pending`
  2. Initiate payment ke payment gateway
  3. INSERT `payment` record (status: pending)
  4. Redirect ke payment gateway URL

### 10.14.4 Payment Webhook — Midtrans

- **Endpoint:** Edge Function `midtrans-webhook` (HTTP POST dari Midtrans)
- **Akses:** Midtrans Server (IP whitelist)
- **Proses:**
  1. Verifikasi signature HMAC Midtrans (cek `X-Midtrans-Signature`)
  2. Cari `payment` record berdasarkan `gateway_ref` = `order_id`
  3. Cek `transaction_status` dari body Midtrans:
     - `settlement` atau `capture` → success
     - `deny`, `cancel`, `expire` → failed
     - `refund` atau `partial_refund` → refunded
  4. UPDATE `payment.status` + `payment.paid_at`
  5. Jika success: UPDATE `invoice.status = 'paid'`, `invoice.paid_at = now()`
  6. Aktifkan `customer_template.active = true`
  7. Return response 200 OK ke Midtrans

### 10.14.5 Cancel Invoice

- **Endpoint:** `POST /api/wo/:woId/invoices/:id/cancel`
- **Akses:** WO Admin
- **Constraint:** Hanya invoice `pending` yang bisa dibatalkan
- **Proses:** UPDATE `status = 'cancelled'`

### 10.14.6 Refund Invoice (Midtrans Core API)

- **Endpoint:** Edge Function `process-refund` (dipanggil dari frontend WO)
- **Akses:** WO Admin (via Supabase Auth + RLS)
- **Constraint:** Hanya invoice `paid` yang bisa di-refund
- **Proses:**
  1. Panggil Midtrans Core API `/v2/{order_id}/refund` dengan `amount`
  2. UPDATE `payment.status = 'refunded'`
  3. UPDATE `invoice.status = 'refunded'`
  4. Nonaktifkan `customer_template.active = false`
