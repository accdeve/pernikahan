# 03 — Arsitektur Sistem

## 3.1 Stack Utama: Supabase + Midtrans

| Layer                   | Teknologi                          | Peran                                                              |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| **Database**            | Supabase PostgreSQL 15+            | Semua penyimpanan data, JSONB untuk data fleksibel                 |
| **Auth**                | Supabase Auth (GoTrue)             | Autentikasi WO staff, JWT, RBAC via custom claims                  |
| **Storage**             | Supabase Storage (S3-compat)       | Foto photobooth, gallery, template thumbnail, anniversary upload   |
| **API / Backend Logic** | Supabase Edge Functions (Deno/TS)  | Payment webhook, invoice generation, cron jobs, validasi bisnis    |
| **Client App**          | Frontend App (React/Next.js/Vite)  | Dashboard WO + halaman undangan publik                             |
| **Realtime**            | Supabase Realtime (WebSocket)      | Live update komentar, RSVP, attendance                             |
| **Payment Gateway**     | **Midtrans** (Snap API + Core API) | Semua transaksi — kartu, transfer bank, e-wallet (GoPay, OVO, dll) |
| **Hosting Frontend**    | Vercel / Netlify                   | Frontend deployment                                                |

## 3.2 Pola Arsitektur: Multi-Tenant via Row Level Security

Sistem menggunakan **Supabase multi-tenant pattern**: semua tenant berbagi tabel yang sama, data diisolasi melalui **Row Level Security (RLS)** di PostgreSQL.

### 3.2.1 Tenant Identifier

Setiap tabel tenant memiliki kolom `wo_id` (foreign key ke `wedding_organization.id`). RLS policy otomatis memfilter baris berdasarkan `wo_id` dari staff yang sedang login.

**Alur autentikasi & identifikasi tenant:**

```
1. WO Staff login → Supabase Auth signInWithPassword() → JWT
2. JWT berisi app_metadata: { wo_id, role }
3. Setiap query via Supabase client → JWT dikirim dalam header
4. PostgreSQL RLS membaca auth.uid() dan auth.jwt()
5. Policy: wo_id = (SELECT wo_id FROM wo_staff WHERE user_id = auth.uid())
```

### 3.2.2 Shared Tables (Platform-Level — Tanpa RLS Tenant)

| Tabel           | Tujuan                                                    |
| --------------- | --------------------------------------------------------- |
| `templates`     | Katalog template undangan (Basic/Premium)                 |
| `plan`          | Daftar plan pricing                                       |
| `plan_template` | Relasi plan → template (plan mencakup template mana saja) |
| `gallery`       | Gallery media global (gambar/video background)            |

### 3.2.3 Tenant-Isolated Tables (RLS Active)

| Tabel               | Contoh RLS Policy                                                              |
| ------------------- | ------------------------------------------------------------------------------ |
| `wo_staff`          | `wo_id = (SELECT wo_id FROM wo_staff WHERE user_id = auth.uid())`              |
| `customers`         | `wo_id = get_current_wo_id()`                                                  |
| `wo_plan`           | `wo_id = get_current_wo_id()`                                                  |
| `customer_template` | `wo_id = get_current_wo_id()`                                                  |
| `guests`            | `wo_id = get_current_wo_id()` — INSERT bebas (public RSVP) via policy terpisah |
| `cust_metadata`     | `wo_id = get_current_wo_id()`                                                  |
| `cust_comment`      | `wo_id = get_current_wo_id()`                                                  |
| `attendance`        | `wo_id = get_current_wo_id()`                                                  |
| `photobooth`        | `wo_id = get_current_wo_id()`                                                  |
| `payment_method`    | `wo_id = get_current_wo_id()`                                                  |
| `invoice`           | `wo_id = get_current_wo_id()`                                                  |
| `payment`           | `wo_id = get_current_wo_id()`                                                  |

### 3.2.4 Fungsi Bantuan RLS

```sql
-- Mendapatkan wo_id dari staff yang login
CREATE OR REPLACE FUNCTION get_current_wo_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT wo_id FROM wo_staff WHERE user_id = auth.uid()
$$;

-- Policy tenant isolation untuk customers
CREATE POLICY "customers_tenant_isolation" ON customers
  FOR ALL
  USING (wo_id = get_current_wo_id())
  WITH CHECK (wo_id = get_current_wo_id());
```

### 3.2.5 Public Access Policies

Tabel interaksi publik (RSVP, komentar) punya policy khusus:

```sql
-- Public bisa INSERT RSVP tanpa login
CREATE POLICY "guests_public_insert" ON guests
  FOR INSERT
  WITH CHECK (true);

-- Public hanya bisa SELECT dari undangan aktif
CREATE POLICY "guests_public_select" ON guests
  FOR SELECT
  USING (
    wo_id IN (SELECT wo_id FROM customer_template WHERE active = true)
  );
```

## 3.3 Supabase Services Detail

### 3.3.1 Supabase Auth (GoTrue)

| Fitur                | Implementasi                                                       |
| -------------------- | ------------------------------------------------------------------ |
| **Sign Up**          | Staff WO mendaftar via `supabase.auth.signUp()` (email + password) |
| **Sign In**          | `supabase.auth.signInWithPassword()` → JWT access + refresh token  |
| **Session**          | JWT auto-refresh, disimpan di localStorage (client)                |
| **Custom Claims**    | `wo_id` dan `role` di `app_metadata`                               |
| **Role Check**       | Via RLS: `auth.jwt() -> 'app_metadata' -> 'role'`                  |
| **Magic Link / OTP** | (future) Untuk customer login tamu                                 |

**Struktur JWT:**

```json
{
  "sub": "auth_user_uuid",
  "email": "staff@example.com",
  "app_metadata": {
    "wo_id": "uuid_wo",
    "role": "admin"
  }
}
```

### 3.3.2 Supabase Database (PostgreSQL)

- **Managed PostgreSQL** — backup otomatis, point-in-time recovery
- **UUID** — native untuk semua primary key (kecuali `gallery.id` INT)
- **JSONB** — `templates.config`, `cust_metadata.love_story`, `cust_metadata.bank_account`
- **Extensions** — `pgcrypto` (gen_random_uuid()), `pgjwt`
- **RLS** — Row Level Security pada semua tabel tenant
- **Database Functions** — `get_current_wo_id()`, `generate_invoice_number()`

### 3.3.3 Supabase Storage

| Bucket        | Tujuan                         | RLS Policy                                                   |
| ------------- | ------------------------------ | ------------------------------------------------------------ |
| `photobooth`  | Foto upload tamu saat acara    | Public INSERT (tamu upload), Authenticated SELECT (WO lihat) |
| `gallery`     | Gambar/video global (platform) | Authenticated only (admin platform)                          |
| `templates`   | Thumbnail template             | Public SELECT                                                |
| `anniversary` | Foto momen anniversary         | Authenticated SELECT (via customer link token)               |

### 3.3.4 Supabase Edge Functions (Deno/TypeScript)

Edge Functions menggantikan backend server tradisional untuk operasi yang memerlukan server-side logic:

| Function                    | Trigger                       | Tujuan                                                       |
| --------------------------- | ----------------------------- | ------------------------------------------------------------ |
| `midtrans-webhook`          | HTTP POST (Midtrans callback) | Proses payment notification, update invoice & payment status |
| `cron-invoice-due`          | Scheduled (daily 00:00)       | Update invoice `pending` → `overdue`                         |
| `cron-invitation-expiry`    | Scheduled (daily 00:00)       | Nonaktifkan `customer_template` setelah 13 hari              |
| `cron-subscription-billing` | Scheduled (monthly 1st)       | Generate invoice anniversary subscription                    |
| `generate-invoice`          | HTTP (dari frontend)          | Buat invoice baru saat WO charge customer                    |
| `process-refund`            | HTTP (dari frontend)          | Proses refund via Midtrans Core API                          |
| `send-midtrans-snap`        | HTTP (dari frontend)          | Generate Midtrans Snap transaction token                     |

**Contoh Edge Function — midtrans-webhook:**

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'

serve(async (req) => {
  const body = await req.json()
  const orderId = body.order_id
  const transactionStatus = body.transaction_status

  // Verifikasi signature Midtrans
  // Update payment & invoice status di database via Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  if (transactionStatus === 'settlement') {
    await supabase
      .from('payment')
      .update({ status: 'success', paid_at: new Date().toISOString() })
      .eq('gateway_ref', orderId)

    await supabase
      .from('invoice')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id' /* invoice_id dari payment record */)
  }

  return new Response('OK', { status: 200 })
})
```

### 3.3.5 Supabase Realtime

| Feature              | Use Case                                                   |
| -------------------- | ---------------------------------------------------------- |
| **Broadcast**        | Update jumlah RSVP live di dashboard WO                    |
| **Postgres Changes** | Push notifikasi ke halaman undangan saat ada komentar baru |
| **Presence**         | (future) Track tamu online di halaman undangan             |

## 3.4 Arsitektur Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT SIDE                                 │
│                                                                      │
│  ┌──────────────────┐    ┌────────────────────────────┐             │
│  │ WO Dashboard App  │    │ Invitation Public Page     │             │
│  │ (React/Next.js)   │    │ (React SSR untuk SEO)      │             │
│  └────────┬─────────┘    └─────────────┬──────────────┘             │
│           │                            │                            │
│     @supabase/supabase-js         @supabase/supabase-js             │
└───────────┼────────────────────────────┼────────────────────────────┘
            │                            │
            ▼                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          SUPABASE PLATFORM                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     PostgreSQL 15+                            │   │
│  │  • 17 tables (shared + tenant-isolated)                       │   │
│  │  • RLS policies (multi-tenant isolation)                      │   │
│  │  • Database functions (get_current_wo_id, dll)                │   │
│  │  • JSONB (flexible config, love_story, bank_account)          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐     │
│  │ Auth (GoTrue) │  │ Storage      │  │ Edge Functions (Deno)   │     │
│  │ • JWT         │  │ (S3-comp)    │  │ • midtrans-webhook     │     │
│  │ • RBAC claims │  │ • photobooth │  │ • cron-invoice-due     │     │
│  │ • Magic Link  │  │ • gallery    │  │ • cron-invitation-exp  │     │
│  └──────────────┘  │ • templates   │  │ • cron-subscription    │     │
│                     └──────────────┘  │ • generate-invoice     │     │
│                                        │ • process-refund       │     │
│  ┌────────────────────────────────────┘ └────────────────────────┘     │
│  │ Realtime (WebSocket)                                                │
│  │ • Broadcast: live RSVP count                                       │
│  │ • Postgres Changes: komentar baru                                  │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        MIDTRANS (Payment Gateway)                    │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │ Snap API         │  │ Core API         │  │ Webhook          │    │
│  │ • Popup payment  │  │ • Direct charge  │  │ → Edge Function  │    │
│  │ • Redirect page  │  │ • Refund         │  │ transaction_status│   │
│  │ • All methods    │  │ • Status query   │  │                  │    │
│  └─────────────────┘  └──────────────────┘  └──────────────────┘    │
│  Metode: Kartu, BCA/BNI/Mandiri VA, GoPay, OVO, Indomaret, Alfamart │
└──────────────────────────────────────────────────────────────────────┘
```

## 3.5 Multi-Tenant via RLS — Detail

Dengan Supabase, isolasi tenant terjadi di **database layer via RLS**, bukan di aplikasi:

```
Platform Layer (Global):
  templates, plan, plan_template, gallery
           │
       ┌───┴───┐
       │       │
  ┌────┴──┐ ┌──┴─────┐
  │ WO A  │ │  WO B  │
  │       │ │        │
  │ staff │ │ staff  │  ← RLS: otomatis filter by wo_id
  │cust   │ │ cust   │  ← Staff WO A tidak bisa lihat data WO B
  │invoice│ │invoice │  ← Bahkan query langsung tetap terfilter
  └───────┘ └────────┘
```

**Keuntungan:**

1. **Security by default** — tidak ada kode aplikasi yang manual filter tenant
2. **Tidak bisa bypass** — query langsung ke database pun tetap terfilter
3. **Frontend → Supabase langsung** — tanpa backend API untuk query sederhana
4. **Auditable** — semua policy di SQL migration, version controlled

## 3.6 Deployment Topology

```
Supabase Project (Managed Cloud)
├── Database (PostgreSQL 15+)
│   ├── Tables + RLS Policies
│   ├── Database Functions
│   └── Triggers
├── Auth (GoTrue)
├── Storage (S3-compatible)
└── Edge Functions (Deno)
     ├── midtrans-webhook (public, HTTP)
     ├── cron-invoice-due (scheduled)
     ├── cron-invitation-expiry (scheduled)
     ├── cron-subscription-billing (scheduled)
     ├── generate-invoice (authenticated)
     └── process-refund (authenticated)

Frontend (Vercel / Netlify)
├── WO Dashboard (/dashboard/* — authenticated)
├── Invitation Pages (/invitation/:slug — public, SSR)
└── Anniversary (/anniversary/:slug — public)

Midtrans
├── Snap API — popup payment di frontend
└── Webhook → Edge Function supabase/functions/midtrans-webhook
```

## 3.7 Struktur Project

```
project/
├── supabase/
│   ├── functions/                 # Edge Functions (Deno)
│   │   ├── midtrans-webhook/
│   │   │   ├── index.ts
│   │   │   └── test.ts
│   │   ├── cron-invoice-due/
│   │   │   └── index.ts
│   │   ├── cron-invitation-expiry/
│   │   │   └── index.ts
│   │   ├── cron-subscription-billing/
│   │   │   └── index.ts
│   │   ├── generate-invoice/
│   │   │   └── index.ts
│   │   └── process-refund/
│   │       └── index.ts
│   ├── migrations/                # Database migrations (SQL)
│   │   ├── 001_create_tables.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions.sql
│   │   └── 004_triggers.sql
│   ├── seed.sql                   # Seed: templates, plan, plan_template
│   └── config.toml                # Supabase config (functions, auth, storage)
├── src/                           # Frontend
│   ├── components/
│   │   ├── dashboard/
│   │   ├── invitation/
│   │   └── anniversary/
│   ├── pages/
│   ├── lib/
│   │   ├── supabase-client.ts     # Supabase client init
│   │   ├── midtrans.ts            # Midtrans Snap helper
│   │   └── rpc.ts                 # Edge Functions RPC calls
│   └── types/
│       └── database.types.ts      # Auto-generated dari Supabase CLI
├── public/
└── package.json
```
