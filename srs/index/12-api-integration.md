# 12 — API & Integrasi

## 12.1 Payment Gateway: Midtrans

Sistem menggunakan **Midtrans** sebagai satu-satunya payment gateway, dengan dua opsi API:

| API          | Use Case                                                                       | Dokumentasi                                           |
| ------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| **Snap API** | Pembayaran via popup/redirect — metode: kartu, VA, e-wallet, convenience store | https://docs.midtrans.com/reference/snap-api          |
| **Core API** | Refund, status query, transaksi langsung (future)                              | https://docs.midtrans.com/reference/core-api-overview |

**Metode pembayaran yang didukung Midtrans:**

1. **Bank Transfer** — BCA Virtual Account, BNI, Mandiri, BRI, Permata
2. **E-Wallet** — GoPay, OVO, Dana, LinkAja, ShopeePay
3. **Credit Card** — Visa, Mastercard (via Midtrans)
4. **Convenience Store** — Indomaret, Alfamart
5. **QRIS** — Pembayaran QR universal

### 12.1.1 Midtrans Snap Flow

```
WO [Frontend]              Edge Function              Midtrans
    │                           │                        │
    │  1. Click "Pay Invoice"   │                        │
    │──────────────────────────>│                        │
    │                           │                        │
    │  2. Call generate-invoice │                        │
    │     Edge Function         │                        │
    │──────────────────────────>│                        │
    │                           │                        │
    │  3. POST /v1/transaction  │                        │
    │     (Snap API)            │───────────────────────>│
    │                           │                        │
    │  4. Return Snap Token     │                        │
    │     + Redirect URL        │<───────────────────────│
    │                           │                        │
    │  5. Return { token,       │                        │
    │     redirect_url }        │                        │
    │<──────────────────────────│                        │
    │                           │                        │
    │  6. Open Midtrans Snap    │                        │
    │     Popup/Redirect        │                        │
    │───────────────────────────────────────────────────>│
    │                           │                        │
    │  7. WO completes payment  │                        │
    │     on Midtrans page      │                        │
    │───────────────────────────────────────────────────>│
    │                           │                        │
    │                           │  8. HTTP POST Webhook  │
    │                           │     (transaction_status)│
    │                           │<───────────────────────│
    │                           │                        │
    │  9. Update payment &      │                        │
    │     invoice status        │                        │
    │                           │                        │
```

### 12.1.2 Midtrans Snap Implementation

**Edge Function — generate Snap token:**

```typescript
// supabase/functions/generate-invoice/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'

serve(async (req) => {
  const { invoice_id, customer_details } = await req.json()
  const supabase = createClient(...)

  // Get invoice data
  const { data: invoice } = await supabase
    .from('invoice')
    .select('*, customers(*)')
    .eq('id', invoice_id)
    .single()

  // Call Midtrans Snap API
  const snapPayload = {
    transaction_details: {
      order_id: invoice.invoice_number,
      gross_amount: invoice.total,
    },
    credit_card: { secure: true },
    customer_details: {
      email: customer_details.email,
      name: `${customer_details.male_name} & ${customer_details.female_name}`,
    },
  }

  const response = await fetch(
    'https://app.sandbox.midtrans.com/snap/v1/transactions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(Deno.env.get('MIDTRANS_SERVER_KEY')! + ':'),
      },
      body: JSON.stringify(snapPayload),
    }
  )

  const { token, redirect_url } = await response.json()

  // Simpan gateway_ref = invoice_number untuk webhook matching
  return new Response(JSON.stringify({ token, redirect_url }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 12.1.3 Midtrans Webhook Handler

**Edge Function:** `supabase/functions/midtrans-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'
import { HMAC, SHA512 } from 'https://deno.land/std/hash/mod.ts'

serve(async (req) => {
  const body = await req.json()
  const { order_id, transaction_status, status_code, gross_amount, signature_key } = body

  // 1. Verify signature
  const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')!
  const input = order_id + status_code + gross_amount + serverKey
  const hash = new HMAC(SHA512, input).hex()

  if (hash !== signature_key) {
    return new Response('Signature mismatch', { status: 403 })
  }

  // 2. Update payment & invoice
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Find payment by gateway_ref (order_id = invoice_number)
  const { data: payment } = await supabase
    .from('payment')
    .select('*, invoice(*)')
    .eq('gateway_ref', order_id)
    .single()

  if (!payment) return new Response('Payment not found', { status: 404 })

  // Map Midtrans status to our status
  const statusMap: Record<string, string> = {
    settlement: 'success',
    capture: 'success',
    deny: 'failed',
    cancel: 'failed',
    expire: 'failed',
    refund: 'refunded',
    partial_refund: 'refunded',
  }

  const newStatus = statusMap[transaction_status]
  if (!newStatus) return new Response('Unknown status', { status: 200 })

  await supabase
    .from('payment')
    .update({ status: newStatus, paid_at: new Date().toISOString() })
    .eq('id', payment.id)

  if (newStatus === 'success') {
    await supabase
      .from('invoice')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', payment.invoice_id)

    // Activate customer template
    await supabase
      .from('customer_template')
      .update({ active: true })
      .eq('id', payment.invoice.customer_template_id)
  }

  return new Response('OK', { status: 200 })
})
```

### 12.1.4 Midtrans Payment Method Mapping

| `payment_method.type` (DB) | Midtrans `payment_method`                    |
| -------------------------- | -------------------------------------------- |
| `card`                     | `credit_card`                                |
| `transfer`                 | `bank_transfer` (BCA/BNI/Mandri/BRI/Permata) |
| `gopay`                    | `gopay`                                      |
| `ovo`                      | `ovo`                                        |
| `qris`                     | `qris`                                       |
| `convenience_store`        | `cstore` (Indomaret/Alfamart)                |

## 12.2 Arsitektur API: Supabase Client + Edge Functions

Dengan Supabase, arsitektur API tidak menggunakan REST API tradisional, melainkan kombinasi:

1. **Supabase Client (langsung dari frontend)** — untuk CRUD sederhana dengan RLS
2. **Supabase Edge Functions** — untuk operasi yang butuh server-side logic (payment, cron, auth admin)
3. **Supabase Database Functions (RPC)** — untuk operasi database kompleks

### 12.2.1 Pola Query Patterns

**Simple CRUD (langsung via Supabase client — RLS melindungi):**

```typescript
// List customers (otomatis difilter RLS per tenant)
const { data } = await supabase.from('customers').select('*')

// Create customer (RLS check wo_id dari JWT)
const { data } = await supabase.from('customers').insert({
  email: 'customer@example.com',
  male_name: 'John',
  female_name: 'Jane',
})

// Update (RLS memastikan hanya punya WO ini)
const { data } = await supabase
  .from('customers')
  .update({ email: 'new@email.com' })
  .eq('id', customerId)
```

**Operasi kompleks (via Edge Function):**

```typescript
// Panggil Edge Function untuk generate invoice + Midtrans Snap
const { data } = await supabase.functions.invoke('generate-invoice', {
  body: { invoice_id, customer_details },
})
```

### 12.2.2 Supabase Client API Patterns

| Operasi                 | Pattern                                                | Keterangan                       |
| ----------------------- | ------------------------------------------------------ | -------------------------------- |
| **Query langsung**      | `supabase.from('table').select('*')`                   | RLS otomatis aktif               |
| **Query dengan filter** | `supabase.from('table').select('*').eq('wo_id', woId)` | RLS tetap aktif, filter tambahan |
| **Insert**              | `supabase.from('table').insert({...})`                 | RLS check `WITH CHECK`           |
| **Update**              | `supabase.from('table').update({...}).eq('id', id)`    | RLS check `USING`                |
| **Delete**              | `supabase.from('table').delete().eq('id', id)`         | RLS check `USING`                |
| **RPC call**            | `supabase.rpc('function_name', { args })`              | Database function                |
| **Storage upload**      | `supabase.storage.from('bucket').upload(path, file)`   | Storage RLS                      |
| **Storage download**    | `supabase.storage.from('bucket').getPublicUrl(path)`   | Public URL                       |
| **Edge Function**       | `supabase.functions.invoke('name', { body })`          | HTTP call ke Edge Function       |

### 12.2.3 Data Flow Per Modul

| Modul             | Pattern                            | Notes                               |
| ----------------- | ---------------------------------- | ----------------------------------- |
| Customers         | Supabase Client langsung           | RLS: hanya milik WO sendiri         |
| Staff Management  | Edge Function (`manage-staff`)     | Butuh service_role untuk auth.admin |
| Template list     | Supabase Client langsung           | Table publik, SELECT untuk semua    |
| Plan list         | Supabase Client langsung           | Table publik                        |
| Assign template   | Supabase Client langsung           | RLS: hanya WO sendiri               |
| Invoice list      | Supabase Client langsung           | RLS: filter by wo_id                |
| Pay invoice       | Edge Function (`generate-invoice`) | Panggil Midtrans Snap API           |
| Midtrans webhook  | Edge Function (`midtrans-webhook`) | Public, verifikasi signature        |
| Guest RSVP        | Supabase Client langsung           | RLS: public INSERT allowed          |
| Comments          | Supabase Client langsung           | RLS: public INSERT                  |
| Photobooth upload | Supabase Storage + Client          | Upload ke Storage, INSERT ke table  |
| Check-in          | Supabase Client langsung           | RLS: public INSERT                  |
| Cron jobs         | Edge Functions (scheduled)         | Service role, bypass RLS            |
| Refund            | Edge Function (`process-refund`)   | Panggil Midtrans Core API           |

### 12.2.4 Edge Functions Endpoints

| Function                    | Method | Path                             | Auth                           | Deskripsi                        |
| --------------------------- | ------ | -------------------------------- | ------------------------------ | -------------------------------- |
| `midtrans-webhook`          | POST   | `/functions/v1/midtrans-webhook` | Public (IP whitelist Midtrans) | Payment notification callback    |
| `generate-invoice`          | POST   | `/functions/v1/generate-invoice` | Auth (Supabase JWT)            | Create invoice + Snap token      |
| `process-refund`            | POST   | `/functions/v1/process-refund`   | Auth (Supabase JWT)            | Refund via Midtrans Core API     |
| `manage-staff`              | POST   | `/functions/v1/manage-staff`     | Auth (WO Admin)                | Create/delete staff (auth.admin) |
| `cron-invoice-due`          | SCHED  | `0 0 * * *`                      | — (service_role)               | Update overdue invoices          |
| `cron-invitation-expiry`    | SCHED  | `0 0 * * *`                      | — (service_role)               | Deactivate expired invitations   |
| `cron-subscription-billing` | SCHED  | `0 0 1 * *`                      | — (service_role)               | Generate subscription invoices   |

### 12.2.5 Public Client-Side Endpoints (halaman undangan)

Halaman undangan publik tidak perlu server — bisa di-render sebagai **static/SSR page** yang langsung query Supabase dengan anon key:

```typescript
// Public Supabase client (anon key, no auth)
const publicSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET invitation data — lihat data dari undangan yang active
const { data: invitation } = await publicSupabase
  .from('customer_template')
  .select('*, cust_metadata(*)')
  .eq('slug', slug)
  .eq('active', true)
  .single()

// POST RSVP — public INSERT allowed by RLS
const { error } = await publicSupabase
  .from('guests')
  .insert({ name, rsvp_status, guest_count, wo_id, customer_id })
```

## 12.3 Scheduled Edge Functions (Cron Jobs)

Supabase Edge Functions mendukung **scheduled invocation** untuk tugas background:

| Job                  | Schedule          | Edge Function               | Deskripsi                                                                                    |
| -------------------- | ----------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| Invoice Due Date     | Daily 00:00       | `cron-invoice-due`          | UPDATE invoice `status = 'overdue'` WHERE `due_date < now()` AND `status = 'pending'`        |
| Invitation Expiry    | Daily 00:00       | `cron-invitation-expiry`    | UPDATE `customer_template` SET `active = false` WHERE `end_date < now()` AND `active = true` |
| Subscription Billing | Monthly 1st 00:00 | `cron-subscription-billing` | Generate invoice untuk semua WO dengan anniversary subscription active                       |
| Auto-cancel Overdue  | Daily 00:00       | (include in invoice-due)    | Batalkan invoice `overdue` > 30 hari                                                         |

**Konfigurasi schedule di `supabase/config.toml`:**

```toml
[functions.cron-invoice-due]
verify_jwt = false

[functions.cron-invoice-due.cron]
schedule = "0 0 * * *"  # Setiap hari jam 00:00

[functions.cron-subscription-billing.cron]
schedule = "0 0 1 * *"  # Tanggal 1 setiap bulan
```

## 12.4 Supabase Storage Integration

### 12.4.1 Bucket Configuration

| Bucket        | Public?     | Use                    | RLS Policy                   |
| ------------- | ----------- | ---------------------- | ---------------------------- |
| `photobooth`  | Public read | Foto upload tamu       | Public INSERT, Auth SELECT   |
| `gallery`     | Public read | Media global platform  | Admin INSERT                 |
| `templates`   | Public read | Template thumbnails    | Admin INSERT                 |
| `anniversary` | Public read | Foto momen anniversary | Public INSERT via link token |

### 12.4.2 Upload Flow (Photobooth example)

```typescript
// 1. Upload file ke Supabase Storage
const file = event.target.files[0]
const fileExt = file.name.split('.').pop()
const fileName = `${crypto.randomUUID()}.${fileExt}`
const filePath = `${woId}/${customerId}/${fileName}`

const { data: uploadData, error } = await supabase.storage.from('photobooth').upload(filePath, file)

// 2. Get public URL
const {
  data: { publicUrl },
} = supabase.storage.from('photobooth').getPublicUrl(filePath)

// 3. Insert record ke table photobooth
await supabase.from('photobooth').insert({
  wo_id: woId,
  customer_id: customerId,
  image_url: publicUrl,
})
```

## 12.5 External Services

| Service                | Purpose                          | Integration                                   |
| ---------------------- | -------------------------------- | --------------------------------------------- |
| **Midtrans**           | Payment processing               | Snap API + Core API + Webhook → Edge Function |
| **Supabase Storage**   | File storage (S3-compatible)     | Supabase client SDK                           |
| **Supabase Auth**      | Authentication & user management | Supabase client SDK + Edge Functions          |
| Email Service (future) | Send invitation link             | Resend / SendGrid via Edge Function           |
| WhatsApp (future)      | RSVP reminder                    | Third-party API via Edge Function             |
