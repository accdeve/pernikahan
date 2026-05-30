# 11 — Kebutuhan Keamanan

## 11.1 Autentikasi (Supabase Auth)

### 11.1.1 Staff Authentication

- **Metode:** Supabase Auth (GoTrue) — JWT-based authentication
- **Sign In:** `supabase.auth.signInWithPassword({ email, password })`
- **Session:** JWT access token + refresh token (bukan cookie session)
- **JWT Storage:** `localStorage` (default Supabase client) — atau `cookie` untuk SSR
- **Auto-refresh:** Supabase client auto-refresh token saat mendekati expiry
- **Password:**
  - Hash ditangani otomatis oleh Supabase Auth (bcrypt)
  - Minimal 8 karakter (konfigurasi di Supabase Auth settings)
  - Kebijakan password dikonfigurasi di Supabase dashboard → Auth → Settings

### 11.1.2 Login Security (Supabase Built-in)

- **Rate limiting:** Ditangani oleh Supabase Auth — 5 attempts per 15 menit per IP (default)
- **Account lockout:** Supabase Auth lockout setelah beberapa percobaan gagal
- **Brute force protection:** Built-in di Supabase Auth
- **Logging:** Semua event auth tercatat di `auth.audit_log_entries` (Supabase internal)
- **reCAPTCHA:** (opsional) Proteksi tambahan untuk login endpoint

### 11.1.3 Session Management

- **JWT Access Token:** Expired dalam 1 jam (default, bisa dikonfigurasi)
- **JWT Refresh Token:** Expired dalam 30 hari (default)
- **Revoke:** `supabase.auth.signOut()` revokes refresh token
- **Multi-device:** Setiap device punya session sendiri
- **Session listing:** Bisa dilihat via `supabase.auth.admin.listUsers()` (service_role)

## 11.2 Otorisasi (RLS + Role-Based)

### 11.2.1 Row Level Security (RLS) — Primary Mechanism

Otorisasi ditangani oleh **PostgreSQL Row Level Security**, bukan oleh middleware aplikasi. RLS policy membaca JWT claims (`auth.jwt()`) dan `auth.uid()` untuk menentukan akses.

**Prinsip:**

1. **Setiap tabel tenant memiliki RLS policy** yang memfilter berdasarkan `wo_id`
2. **Setiap query dari frontend** menggunakan Supabase client → mengirim JWT → RLS otomatis aktif
3. **Role-based access** diimplementasikan di RLS policy dengan mengecek `wo_staff.role` dari JWT

**Contoh RLS Policy untuk Role-Based Access:**

```sql
-- Admin: full akses (CRUD)
CREATE POLICY "admin_full_access" ON customers
  FOR ALL
  USING (
    wo_id = get_current_wo_id()
    AND EXISTS (
      SELECT 1 FROM wo_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Editor: INSERT, SELECT, UPDATE (no DELETE)
CREATE POLICY "editor_insert_update" ON customers
  FOR INSERT WITH CHECK (
    wo_id = get_current_wo_id()
    AND EXISTS (SELECT 1 FROM wo_staff WHERE user_id = auth.uid() AND role = 'editor')
  );
CREATE POLICY "editor_select_update" ON customers
  FOR UPDATE USING (
    wo_id = get_current_wo_id()
    AND EXISTS (SELECT 1 FROM wo_staff WHERE user_id = auth.uid() AND role = 'editor')
  );
CREATE POLICY "editor_select" ON customers
  FOR SELECT USING (
    wo_id = get_current_wo_id()
    AND EXISTS (SELECT 1 FROM wo_staff WHERE user_id = auth.uid() IN ('admin','editor'))
  );

-- Viewer: SELECT only
CREATE POLICY "viewer_select" ON customers
  FOR SELECT USING (
    wo_id = get_current_wo_id()
    AND EXISTS (SELECT 1 FROM wo_staff WHERE user_id = auth.uid() = 'viewer')
  );
```

### 11.2.2 Permission Matrix (via RLS)

| Resource          | Create          | Read         | Update       | Delete         |
| ----------------- | --------------- | ------------ | ------------ | -------------- |
| Staff             | Admin           | Admin        | Admin        | Admin          |
| Customer          | Admin,Editor    | All          | Admin,Editor | Admin          |
| Customer Template | Admin,Editor    | All          | Admin,Editor | Admin          |
| Guest (via WO)    | Admin,Editor    | All          | Admin,Editor | Admin          |
| Invoice           | System          | All          | System       | Admin (cancel) |
| Payment           | Admin           | Admin,Viewer | System       | ❌             |
| Comment           | Admin,Editor    | All          | ❌           | Admin,Editor   |
| Photobooth        | Public (INSERT) | All          | ❌           | Admin          |

## 11.3 Isolasi Data Tenant (Multi-Tenant via RLS)

### 11.3.1 RLS — Security by Default

Dengan Supabase RLS, isolasi data tenant terjadi di **database level**. Tidak ada kode aplikasi yang perlu melakukan query scoping secara manual.

**Bagaimana RLS melindungi data:**

1. WO Staff login → Supabase Auth → JWT dengan `wo_id` di `app_metadata`
2. Frontend query via `supabase.from('customers').select('*')`
3. Request dikirim ke Supabase dengan JWT di header Authorization
4. PostgreSQL mengeksekusi RLS policy:
   ```sql
   WHERE wo_id = (SELECT wo_id FROM wo_staff WHERE user_id = auth.uid())
   ```
5. Hanya baris dengan `wo_id` yang sesuai yang dikembalikan

**Keuntungan pendekatan RLS:**

1. **Tidak bisa di-bypass** — bahkan query langsung ke database tetap terfilter
2. **Tidak ada kode keamanan di frontend** — frontend tidak perlu filter manual
3. **Auditable** — semua policy di file SQL migration
4. **Bisa di-test** — unit test bisa verifikasi RLS policy bekerja

### 11.3.2 Testing RLS Policies

```sql
-- Test: staff WO A tidak bisa akses data WO B
-- 1. Login sebagai staff WO A
SELECT set_config('role', 'authenticated', true);
-- 2. Coba SELECT customers WO B
SELECT * FROM customers WHERE wo_id = 'wo_b_uuid';
-- 3. Harusnya: 0 rows (karena RLS filter otomatis)
```

### 11.3.3 Service Role — Bypass RLS

Untuk operasi yang perlu akses semua data (Edge Functions, cron jobs):

```typescript
// Edge Function dengan service_role — bypass RLS
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
)

// Query tanpa filter tenant — bisa akses semua data
const allCustomers = await supabaseAdmin.from('customers').select('*')
```

**Peringatan:** Service role key hanya digunakan di Edge Functions, **tidak pernah** di frontend.

## 11.4 Midtrans Payment Security

| Aspek                 | Requirement                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Webhook signature** | Verifikasi signature HMAC SHA512 dari Midtrans (`X-Midtrans-Signature`) untuk setiap callback di Edge Function |
| **Snap Token**        | Midtrans Snap token di-generate via server-side (Edge Function), bukan dari frontend                           |
| **Server Key**        | Midtrans Server Key disimpan di Supabase Edge Function secrets (bukan di frontend)                             |
| **HTTPS**             | Semua komunikasi Midtrans API via HTTPS                                                                        |
| **Tidak menyimpan**   | Jangan pernah menyimpan nomor kartu kredit/debit di database lokal                                             |
| **PCI DSS**           | Midtrans sudah PCI DSS Level 1 compliant — sistem tidak perlu sertifikasi sendiri                              |
| **Order ID unik**     | Setiap transaksi punya `order_id` unik (gunakan `invoice_number`) untuk mencegah duplikasi                     |

### 11.4.1 Midtrans Webhook Verification Code

```typescript
// Di Edge Function midtrans-webhook
function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const input = orderId + statusCode + grossAmount + serverKey
  const hash = new HMAC(SHA512, input).hex()
  return hash === signatureKey
}
```

## 11.5 Input Validation

### 11.5.1 Server-Side Validation (Edge Functions + Supabase)

Untuk input dari public endpoints (RSVP, comments, photobooth), validasi dilakukan di **Edge Functions** atau **database CHECK constraints**:

```sql
-- Database-level validation dengan CHECK constraint
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wo_id UUID REFERENCES wedding_organization(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  name text NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  rsvp_status boolean DEFAULT false,
  guest_count integer DEFAULT 1 CHECK (guest_count >= 1 AND guest_count <= 10),
  reason text CHECK (reason IS NULL OR char_length(reason) <= 500),
  created_at timestamptz DEFAULT now()
);
```

Untuk validasi tambahan di Edge Function:

```typescript
// Di Edge Function (Deno)
import { z } from 'npm:zod'

const rsvpSchema = z.object({
  name: z.string().min(2).max(100),
  rsvp_status: z.boolean(),
  guest_count: z.number().int().min(1).max(10).optional(),
  reason: z.string().max(500).optional(),
})
```

### 11.5.2 Anti-XSS

- Semua output di-render dengan framework React (JSX auto-escapes)
- Input sanitasi untuk konten user-generated (komentar) sebelum ditampilkan
- Gunakan library seperti DOMPurify jika perlu render HTML dari input user

### 11.5.3 Anti-SQL Injection

- Menggunakan **Supabase client** — semua query parameterized secara otomatis
- Edge Functions menggunakan Supabase client yang sama
- JANGAN gunakan raw SQL string concatenation (bahkan di Edge Functions)
- Untuk query kompleks, gunakan **PostgreSQL Functions** (stored procedures) yang sudah compiled

## 11.6 Rate Limiting

| Endpoint                                                   | Rate Limit            | Implementasi                   |
| ---------------------------------------------------------- | --------------------- | ------------------------------ |
| `supabase.auth.signInWithPassword()`                       | 5 attempts / 15 menit | Built-in Supabase Auth         |
| `POST /invitation/:slug/rsvp` (direct insert via Supabase) | 10 / menit / IP       | RLS policy + aplikasi throttle |
| `POST /invitation/:slug/comments` (direct insert)          | 5 / menit / IP        | Aplikasi throttle              |
| `POST /invitation/:slug/photobooth` (storage upload)       | 3 / menit / IP        | Aplikasi throttle              |
| Edge Functions (authenticated)                             | 100 / menit / user    | Edge Function middleware       |

## 11.7 Data Privacy

| Aspek              | Requirement                                                        |
| ------------------ | ------------------------------------------------------------------ |
| **Password**       | Tidak pernah di-log, tidak pernah dikembalikan ke API              |
| **Token payment**  | Enkripsi di database, tidak pernah di-log                          |
| **Data customer**  | Hanya bisa diakses oleh WO terkait                                 |
| **Guest data**     | Hanya nama guest yang tampil publik (RSVP, komentar)               |
| **Data retention** | Data tidak pernah dihapus otomatis (kecuali diminta WO)            |
| **Audit log**      | Semua perubahan data penting (status invoice, role change) dicatat |

## 11.8 Secure Development Practices

- **Environment variables:** Supabase Edge Functions menggunakan `Deno.env.get()` — set via Supabase Dashboard → Edge Functions → Secrets
- **Secrets management:** Midtrans Server Key, Supabase Service Role Key → disimpan sebagai Edge Function secrets
- **CORS:** Konfigurasi CORS di Supabase Dashboard → Authentication → Settings → Site URL
- **Supabase API hardening:** Enable Row Level Security di semua tabel tenant (wajib), nonaktifkan public access untuk tabel sensitif
- **CLI tools:** Gunakan `supabase` CLI untuk migration, jangan edit database langsung dari dashboard
