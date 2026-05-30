# Database Context — Platform Undangan Digital B2B

> Dokumentasi ini menjelaskan skema database, relasi, flow bisnis, dan aturan-aturan yang harus dipatuhi saat mengembangkan fitur apa pun yang menyentuh database.
>
> **Target pembaca:** Developer magang / junior yang baru pertama kali bekerja dengan proyek ini.

---

## Daftar Isi

1. [Ringkasan Platform](#1-ringkasan-platform)
2. [Model Multi-Tenant](#2-model-multi-tenant)
3. [Daftar Entity Lengkap](#3-daftar-entity-lengkap)
4. [Relasi Antar Entity](#4-relasi-antar-entity)
5. [Flow Bisnis](#5-flow-bisnis)
6. [Aturan Bisnis (Business Rules)](#6-aturan-bisnis-business-rules)
7. [Pola Query Umum](#7-pola-query-umum)
8. [Konvensi Database](#8-konvensi-database)

---

## 1. Ringkasan Platform

### Apa Itu Sistem Ini?

Platform **B2B undangan pernikahan digital**. Kami (brand/platform) menyediakan template undangan digital yang **dijual ke Wedding Organizer (WO)**. WO membeli **plan** dari kami, lalu WO bisa **membuat undangan untuk customer (pasangan pengantin)** mereka menggunakan template yang sudah ter-unlock sesuai plan.

### Model Bisnis

```
Brand/Platform ──> menjual Plan ──> WO
                                    │
                                    └──> membuatkan undangan ──> Customer (pengantin)
                                                                  │
                                                                  └──> tamu undangan RSVP
```

- **WO = tenant kami.** Setiap WO punya akun sendiri.
- **Customer = pengantin** yang di-handle oleh WO.
- **Template = produk digital** yang kami buat, dijual melalui plan.
- **Billing = pay-as-you-go per customer.** Setiap WO aktivasi template untuk customer, WO dicharge.

---

## 2. Model Multi-Tenant

### Tenant Isolation

Setiap Wedding Organization (WO) adalah **tenant**. Semua data milik WO diisolasi menggunakan kolom `wo_id` yang dicantumkan langsung di **setiap tabel tenant-scoped**.

```
-- ✅ BENAR: 1 hop, langsung filter
SELECT * FROM guests WHERE wo_id = 'uuid-wo-xyz'

-- ❌ SALAH: jangan filter lewat JOIN ke wedding_organization
-- (kecuali memang perlu data WO-nya)
SELECT * FROM guests
JOIN customers ON guests.customer_id = customers.id
WHERE customers.wo_id = 'uuid-wo-xyz'
```

### Tabel yang memiliki `wo_id`

| Tabel                  | Punya wo_id?                                |
| ---------------------- | ------------------------------------------- |
| `wedding_organization` | Id-nya sendiri (PK = wo_id)                 |
| `wo_staff`             | ✅                                          |
| `customers`            | ✅                                          |
| `customer_template`    | ✅                                          |
| `guests`               | ✅                                          |
| `cust_metadata`        | ✅                                          |
| `cust_comment`         | ✅                                          |
| `attendance`           | ✅                                          |
| `photobooth`           | ✅                                          |
| `payment_method`       | ✅                                          |
| `invoice`              | ✅                                          |
| `payment`              | ✅                                          |
| `templates`            | ❌ (global milik platform)                  |
| `plan`                 | ❌ (global milik platform)                  |
| `plan_template`        | ❌ (global milik platform)                  |
| `gallery`              | ❌ (global, shared pool)                    |
| `wo_plan`              | ✅ (tapi dia sendiri yg menentukan plan WO) |

---

## 3. Daftar Entity Lengkap

### 3.1 `wedding_organization` — Tenant WO

| Kolom        | Tipe        | Keterangan             |
| ------------ | ----------- | ---------------------- |
| `id`         | `uuid` PK   | Primary key            |
| `name`       | `string`    | Nama wedding organizer |
| `email`      | `string`    | Email kontak WO        |
| `location`   | `string`    | Kota/domisili WO       |
| `created_at` | `timestamp` | Waktu daftar           |

**Relasi:** 1:N ke wo_staff, customers, wo_plan, customer_template, dan semua tabel tenant.

**Catatan:** Tidak ada kolom `plan` atau `status` di sini. Plan WO dilacak di tabel `wo_plan` terpisah.

---

### 3.2 `wo_staff` — Staff/Akun WO

| Kolom           | Tipe                                | Keterangan                   |
| --------------- | ----------------------------------- | ---------------------------- |
| `id`            | `uuid` PK                           |                              |
| `wo_id`         | `uuid` FK > wedding_organization.id | WO induk                     |
| `name`          | `string`                            | Nama staff                   |
| `email`         | `string`                            | Email login                  |
| `password_hash` | `string`                            | Hash password (bcrypt/argon) |
| `role`          | `string (admin,editor,viewer)`      | Hak akses di dashboard WO    |
| `created_at`    | `timestamp`                         |                              |

**Aturan:**

- 1 WO bisa punya banyak staff (multi-akun).
- `admin` bisa manage staff lain, `editor` bisa bikin undangan, `viewer` cuma lihat.

---

### 3.3 `customers` — Pasangan Pengantin

| Kolom         | Tipe                                | Keterangan        |
| ------------- | ----------------------------------- | ----------------- |
| `id`          | `uuid` PK                           |                   |
| `wo_id`       | `uuid` FK > wedding_organization.id | WO yang menangani |
| `email`       | `string`                            | Email pasangan    |
| `male_name`   | `string`                            | Nama pria         |
| `female_name` | `string`                            | Nama wanita       |
| `created_at`  | `timestamp`                         |                   |

**Aturan:**

- Customer **terikat ke WO**. Tidak bisa pindah WO sendiri.
- WO yang membuat entri customer ini.
- 1 customer bisa punya banyak `customer_template` (untuk wedding + anniversary nanti).

**PENTING — Billing trigger:** Setiap kali WO membuat `customer_template` baru dengan `active=true`, sistem harus membuat `invoice`. Billing dijelaskan lebih detail di [Flow 5.4](#54-aktivasi-template--billing).

---

### 3.4 `templates` — Template Undangan (Global)

| Kolom        | Tipe                     | Keterangan                                             |
| ------------ | ------------------------ | ------------------------------------------------------ |
| `id`         | `uuid` PK                |                                                        |
| `name`       | `string`                 | Nama template (e.g. "Royal Java", "Vintage Bloom")     |
| `thumbnail`  | `string`                 | URL/Path gambar preview                                |
| `category`   | `string (basic,premium)` | Kategori akses                                         |
| `config`     | `jsonb`                  | Konfigurasi internal template (route, assets, styling) |
| `created_at` | `timestamp`              |                                                        |

**Milik platform**, bukan milik WO. Tidak ada `wo_id`.

**Aturan:**

- Template bersifat **immutable**: 1 nama = 1 entri. Kalau ada desain baru, buat template baru dengan nama baru. Template lama tetap ada dan bisa dipakai customer yang sudah mengaktivasinya.
- WO hanya bisa menggunakan template yang termasuk dalam plan mereka (lihat `plan_template`).
- `config` berisi seluruh konfigurasi internal — misalnya:
  ```json
  {
    "route": "/v2/royal-java",
    "assets": { "cover": "cover-v2.jpg", "music": "lagu.mp3" },
    "features": ["galeri", "cerita", "music", "rsvp"]
  }
  ```

---

### 3.5 `plan` — Paket Langganan

| Kolom        | Tipe        | Keterangan                                         |
| ------------ | ----------- | -------------------------------------------------- |
| `id`         | `uuid` PK   |                                                    |
| `name`       | `string`    | Nama plan (e.g. "Basic", "Premium")                |
| `price`      | `int`       | Harga dalam **sen/cent** (e.g. 50000 = Rp 500.000) |
| `created_at` | `timestamp` |                                                    |

**Milik platform.** Menentukan template mana yang bisa diakses.

**Aturan:**

- Plan **tidak menentukan** berapa banyak customer. Billing tetap pay-per-customer terpisah.
- Harga dalam **sen/cent** untuk menghindari floating point error. Rp 500.000 disimpan sebagai `50000`.
- Jika ingin menambah plan baru (e.g. "Enterprise"), tinggal insert row baru.

---

### 3.6 `plan_template` — Junction Plan ↔ Template

| Kolom         | Tipe                     | Keterangan                        |
| ------------- | ------------------------ | --------------------------------- |
| `id`          | `uuid` PK                |                                   |
| `plan_id`     | `uuid` FK > plan.id      | Plan                              |
| `template_id` | `uuid` FK > templates.id | Template yang termasuk dalam plan |
| `created_at`  | `timestamp`              |                                   |

**Tujuan:** Menentukan template mana saja yang "ter-unlock" untuk suatu plan.

**Data seed (contoh):**

```
plan "Basic"   → plan_template: [template-A (basic), template-B (basic)]
plan "Premium" → plan_template: [template-A (basic), template-B (basic),
                                  template-C (premium), template-D (premium)]
```

**Logika akses:** Premium unlock semua basic + premium. Basic hanya basic.

---

### 3.7 `wo_plan` — Plan Aktif WO

| Kolom        | Tipe                                | Keterangan       |
| ------------ | ----------------------------------- | ---------------- |
| `id`         | `uuid` PK                           |                  |
| `wo_id`      | `uuid` FK > wedding_organization.id | WO               |
| `plan_id`    | `uuid` FK > plan.id                 | Plan yang dibeli |
| `status`     | `string (active,expired)`           | Status plan      |
| `start_date` | `timestamp`                         | Tanggal aktif    |
| `end_date`   | `timestamp`                         | Tanggal berakhir |
| `created_at` | `timestamp`                         |                  |

**Aturan:**

- 1 WO hanya punya **1 plan aktif** dalam satu waktu.
- Status `expired` berarti WO sudah tidak bisa aktivasi template baru, tapi undangan customer yang sudah aktif tetap jalan.
- `wo_plan` bisa punya banyak riwayat — jika WO ganti plan, row lama di-`expired` kan, row baru `active`.

---

### 3.8 `customer_template` — Aktivasi Template oleh WO untuk Customer

| Kolom         | Tipe                                | Keterangan            |
| ------------- | ----------------------------------- | --------------------- |
| `id`          | `uuid` PK                           |                       |
| `wo_id`       | `uuid` FK > wedding_organization.id | WO                    |
| `customer_id` | `uuid` FK > customers.id            | Customer              |
| `template_id` | `uuid` FK > templates.id            | Template yang dipilih |
| `type`        | `string (wedding,anniversary)`      | Jenis acara           |
| `active`      | `boolean`                           | Aktif / tidak         |
| `created_at`  | `timestamp`                         |                       |

**Ini adalah ENTITAS PENTING.** Setiap aktivasi template untuk customer = satu baris di sini. Ini juga trigger billing.

**Aturan:**

- `active=false` saat baru dibuat (menunggu pembayaran).
- `active=true` setelah invoice terkait lunas.
- 1 customer bisa punya >1 customer_template — misal: 1 untuk wedding, tahun depan 1 lagi untuk anniversary.
- `type='wedding'` hanya 1 per customer (kecuali customer bikin acara lain).

**Constraint:**

- WO hanya bisa memilih `template_id` yang termasuk dalam `plan` aktif WO saat ini.

---

### 3.9 `guests` — Tamu Undangan

| Kolom         | Tipe                                | Keterangan                        |
| ------------- | ----------------------------------- | --------------------------------- |
| `id`          | `uuid` PK                           |                                   |
| `wo_id`       | `uuid` FK > wedding_organization.id |                                   |
| `customer_id` | `uuid` FK > customers.id            |                                   |
| `name`        | `string`                            | Nama tamu                         |
| `rsvp_status` | `boolean`                           | true = datang, false = tidak bisa |
| `guest_count` | `int`                               | Jumlah orang yang akan datang     |
| `reason`      | `string`                            | Alasan (jika tidak bisa datang)   |
| `created_at`  | `timestamp`                         |                                   |

**Aturan:**

- Tamu mengisi RSVP lewat link undangan. Link undangan sudah menyertakan `customer_id` (atau slug) — sehingga guest bisa langsung terikat ke customer yang benar.
- `guest_count` minimal 1 (untuk tamu itu sendiri). Istri/suami/anak termasuk dalam `guest_count`.
- Kolom `reason` diisi jika `rsvp_status=false`.

---

### 3.10 `cust_metadata` — Metadata Acara

| Kolom                  | Tipe                             | Keterangan                                           |
| ---------------------- | -------------------------------- | ---------------------------------------------------- |
| `id`                   | `uuid` PK                        |                                                      |
| `wo_id`                | `uuid` FK                        |                                                      |
| `customer_id`          | `uuid` FK                        |                                                      |
| `customer_template_id` | `uuid` FK > customer_template.id | Aktivasi template terkait                            |
| `date`                 | `timestamp`                      | Tanggal acara                                        |
| `type`                 | `string (wedding,anniversary)`   | Jenis acara (cocokkan dengan customer_template.type) |
| `image_id`             | `int` FK < gallery.id            | Foto utama acara (nullable)                          |
| `location`             | `string`                         | Nama gedung/tempat                                   |
| `address`              | `string`                         | Alamat lengkap                                       |
| `akad_date`            | `timestamp`                      | Waktu akad nikah (nullable untuk anniversary)        |
| `reception_date`       | `timestamp`                      | Waktu resepsi (nullable)                             |
| `love_story`           | `jsonb`                          | Cerita cinta: array of chapters                      |
| `bank_account`         | `jsonb`                          | Data rekening untuk amplop digital                   |
| `created_at`           | `timestamp`                      |                                                      |

**Catatan penting:**

- `customer_template_id` menghubungkan metadata ke aktivasi template spesifik. Jadi metadata untuk wedding pakai customer_template type='wedding', metadata untuk anniversary pakai yang type='anniversary'.
- `love_story` format JSONB, contoh:
  ```json
  [
    { "title": "Pertemuan Pertama", "date": "2020-01-14", "story": "Kami bertemu di..." },
    { "title": "Lamaran", "date": "2023-06-10", "story": "Dia melamar di..." }
  ]
  ```
- `bank_account` format JSONB, contoh:
  ```json
  [{ "bank": "BCA", "account_number": "1234567890", "holder_name": "John Doe" }]
  ```

---

### 3.11 `gallery` — Galeri Media (Shared Pool)

| Kolom        | Tipe        | Keterangan                                             |
| ------------ | ----------- | ------------------------------------------------------ |
| `id`         | `int` PK    | Primary key (int, bukan uuid — karena table referensi) |
| `image`      | `jsonb`     | Array of image URLs/paths                              |
| `video`      | `string`    | URL video (nullable)                                   |
| `created_at` | `timestamp` |                                                        |

**Tidak punya `wo_id` atau `customer_id`.** Ini adalah **pool media global** yang bisa digunakan oleh semua customer.

**Tujuan:**

- Menyimpan asset gambar yang bisa dipakai ulang (background, ilustrasi, dll).
- Gambar diacu dari `cust_metadata.image_id`.

**Aturan:**

- Hanya platform (admin) yang bisa nambah/edit gallery.

---

### 3.12 `cust_comment` — Buku Tamu Digital

| Kolom         | Tipe                  | Keterangan                                     |
| ------------- | --------------------- | ---------------------------------------------- |
| `id`          | `uuid` PK             |                                                |
| `wo_id`       | `uuid` FK             |                                                |
| `customer_id` | `uuid` FK             |                                                |
| `guest_id`    | `uuid` FK > guests.id | Tamu yang komen (nullable? — butuh konfirmasi) |
| `comment`     | `string`              | Isi komentar/ucapan                            |
| `created_at`  | `timestamp`           |                                                |
| `updated_at`  | `timestamp`           |                                                |

**Aturan:**

- `guest_id` bisa nullable jika tamu komen tapi tidak terdaftar di tabel guests.
- Atau jika strict: guest harus RSVP dulu sebelum komen.

---

### 3.13 `attendance` — Kehadiran Real (On-site)

| Kolom         | Tipe                  | Keterangan          |
| ------------- | --------------------- | ------------------- |
| `id`          | `uuid` PK             |                     |
| `wo_id`       | `uuid` FK             |                     |
| `customer_id` | `uuid` FK             |                     |
| `guest_id`    | `uuid` FK > guests.id |                     |
| `created_at`  | `timestamp`           | Waktu scan/check-in |

**PENTING — Beda dengan RSVP:**

- `guests.rsvp_status` = **janji** (diisi tamu via link undangan, sebelum acara).
- `attendance` = **realisasi** (di-scan/di-check-in pas hari H).

**Flow:**

1. Tamu RSVP via link → `guests.rsvp_status=true`
2. Hari H, tamu datang → check-in → row baru di `attendance`
3. Jadi bisa liat: "100 tamu RSVP datang, tapi 85 yang real hadir"

---

### 3.14 `photobooth` — Foto Acara

| Kolom         | Tipe        | Keterangan |
| ------------- | ----------- | ---------- |
| `id`          | `uuid` PK   |            |
| `wo_id`       | `uuid` FK   |            |
| `customer_id` | `uuid` FK   |            |
| `image_url`   | `string`    | URL foto   |
| `created_at`  | `timestamp` |            |

**Aturan:**

- Setiap foto photobooth = 1 row.
- Foto bisa diunggah oleh tamu atau oleh WO.

---

### 3.15 `payment_method` — Metode Bayar WO

| Kolom        | Tipe                               | Keterangan                 |
| ------------ | ---------------------------------- | -------------------------- |
| `id`         | `uuid` PK                          |                            |
| `wo_id`      | `uuid` FK                          |                            |
| `type`       | `string (card,transfer,gopay,ovo)` | Jenis payment              |
| `provider`   | `string`                           | Nama bank/penyedia         |
| `token`      | `string`                           | Token dari payment gateway |
| `is_default` | `boolean`                          | Default atau tidak         |
| `created_at` | `timestamp`                        |                            |

**Aturan:**

- WO bisa punya banyak metode bayar.
- `is_default=true` hanya 1 per WO.
- `token` adalah token dari gateway (Xendit/Midtrans/Stripe) — jangan simpan raw card number!

---

### 3.16 `invoice` — Tagihan WO

| Kolom                  | Tipe                                               | Keterangan                                                        |
| ---------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| `id`                   | `uuid` PK                                          |                                                                   |
| `wo_id`                | `uuid` FK                                          |                                                                   |
| `customer_template_id` | `uuid` FK > customer_template.id                   | Aktivasi yang ditagih                                             |
| `invoice_number`       | `string`                                           | Nomor invoice (auto-generated, human readable)                    |
| `description`          | `string`                                           | Deskripsi (e.g. "Aktivasi template Royal Java untuk pengantin A") |
| `subtotal`             | `int`                                              | Subtotal dalam sen                                                |
| `tax`                  | `int`                                              | Pajak dalam sen                                                   |
| `total`                | `int`                                              | Total = subtotal + tax, dalam sen                                 |
| `status`               | `string (pending,paid,overdue,cancelled,refunded)` | Status invoice                                                    |
| `due_date`             | `timestamp`                                        | Batas bayar                                                       |
| `paid_at`              | `timestamp`                                        | Waktu lunas (nullable)                                            |
| `created_at`           | `timestamp`                                        |                                                                   |
| `updated_at`           | `timestamp`                                        |                                                                   |

**Trigger:** Invoice dibuat ketika `customer_template` dengan `active=true` dibuat. Atau bisa juga dibuat dengan `active=false` dulu — tergantung flow bisnis.

**Flow status (state machine):**

```
pending ──> paid       (saat payment sukses)
pending ──> overdue    (melewati due_date)
pending ──> cancelled  (WO batalkan aktivasi)
paid    ──> refunded   (WO minta refund)
```

---

### 3.17 `payment` — Transaksi Pembayaran

| Kolom               | Tipe                                       | Keterangan                                |
| ------------------- | ------------------------------------------ | ----------------------------------------- |
| `id`                | `uuid` PK                                  |                                           |
| `invoice_id`        | `uuid` FK > invoice.id                     | Invoice terkait                           |
| `wo_id`             | `uuid` FK                                  |                                           |
| `payment_method_id` | `uuid` FK > payment_method.id              | Metode bayar yang dipakai                 |
| `amount`            | `int`                                      | Jumlah dibayar (dalam sen)                |
| `status`            | `string (pending,success,failed,refunded)` | Status transaksi                          |
| `gateway`           | `string (xendit,midtrans,stripe)`          | Payment gateway yang dipakai              |
| `gateway_ref`       | `string`                                   | Reference ID dari gateway (untuk tracing) |
| `paid_at`           | `timestamp`                                | Waktu bayar sukses (nullable)             |
| `created_at`        | `timestamp`                                |                                           |

**Aturan:**

- 1 invoice bisa punya >1 payment (misal: bayar 2x cicilan, atau refund partial).
- `status=success` → trigger `invoice.status=paid`, `customer_template.active=true`.
- `gateway_ref` penting untuk reconciliation dengan laporan dari gateway.

---

## 4. Relasi Antar Entity

### Diagram Relasi (Text)

```
wedding_organization (1) ──┬── (N) wo_staff
                           ├── (N) customers
                           ├── (N) wo_plan ── (1) plan
                           ├── (N) customer_template ── (1) templates
                           ├── (N) guests
                           ├── (N) cust_metadata ── (1) customer_template
                           ├── (N) cust_comment
                           ├── (N) attendance
                           ├── (N) photobooth
                           ├── (N) payment_method
                           └── (N) invoice ── (1) customer_template
                                               └── (N) payment ── (1) payment_method

templates (N) ── (N) plan   (via plan_template)
plan (1) ── (N) plan_template ── (N) templates
plan (1) ── (N) wo_plan

gallery (1) ── < (N) cust_metadata   (via image_id)
```

### Ringkasan Foreign Key

| FK                     | Dari                | Ke                        | Catatan          |
| ---------------------- | ------------------- | ------------------------- | ---------------- |
| `wo_id`                | (10 tabel)          | `wedding_organization.id` | Tenant isolation |
| `customer_id`          | (7 tabel)           | `customers.id`            |                  |
| `template_id`          | `customer_template` | `templates.id`            |                  |
| `template_id`          | `plan_template`     | `templates.id`            |                  |
| `plan_id`              | `plan_template`     | `plan.id`                 |                  |
| `plan_id`              | `wo_plan`           | `plan.id`                 |                  |
| `customer_template_id` | `cust_metadata`     | `customer_template.id`    |                  |
| `customer_template_id` | `invoice`           | `customer_template.id`    | Trigger billing  |
| `guest_id`             | `cust_comment`      | `guests.id`               |                  |
| `guest_id`             | `attendance`        | `guests.id`               |                  |
| `image_id`             | `cust_metadata`     | `gallery.id`              | `int` → `int`    |
| `invoice_id`           | `payment`           | `invoice.id`              |                  |
| `payment_method_id`    | `payment`           | `payment_method.id`       |                  |

---

## 5. Flow Bisnis

### 5.1 Registrasi WO + Staff

```
1. WO daftar → INSERT wedding_organization
2. Buat akun staff pertama → INSERT wo_staff (role='admin')
3. Staff bisa invite staff lain (role='editor'/'viewer') nanti dari dashboard
```

**Query:**

```sql
-- Registrasi WO
INSERT INTO wedding_organization (id, name, email, location)
VALUES (gen_random_uuid(), 'WO Bahagia', 'wo@bahagia.com', 'Jakarta');

-- Buat staff admin pertama
INSERT INTO wo_staff (id, wo_id, name, email, password_hash, role)
VALUES (gen_random_uuid(), 'wo-id-diatas', 'Admin WO', 'admin@wo.com', 'hash...', 'admin');
```

---

### 5.2 Pembelian Plan

```
1. WO milih plan (Basic/Premium) → INSERT wo_plan (status='active')
2. Plan menentukan template mana yang bisa dipakai
3. Jika WO ganti plan → wo_plan lama status='expired', buat wo_plan baru
```

**Constraint:** WO hanya bisa memilih template yang termasuk dalam `plan_template` dari plan aktif WO.

```sql
-- Cek template apa saja yang bisa dipakai WO:
SELECT t.* FROM templates t
JOIN plan_template pt ON pt.template_id = t.id
JOIN wo_plan wp ON wp.plan_id = pt.plan_id
WHERE wp.wo_id = 'uuid-wo' AND wp.status = 'active'
  AND wp.start_date <= NOW() AND (wp.end_date IS NULL OR wp.end_date >= NOW());
```

---

### 5.3 Tambah Customer + Pilih Template

```
1. WO membuat data customer → INSERT customers
2. WO memilih template untuk customer
3. Sistem cek: apakah template termasuk plan aktif WO?
   - Ya → lanjut
   - Tidak → tolak, suruh WO upgrade plan
4. INSERT customer_template (active=false)
5. INSERT invoice (status=pending)
```

**PENTING — proteksi akses template:**

```sql
-- CEK apakah WO boleh pakai template ini:
SELECT 1 FROM wo_plan wp
JOIN plan_template pt ON pt.plan_id = wp.plan_id
WHERE wp.wo_id = 'uuid-wo'
  AND wp.status = 'active'
  AND pt.template_id = 'uuid-template';
-- Jika 0 baris → WO tidak boleh pakai template ini.
```

---

### 5.4 Aktivasi Template + Billing

```
1. Invoice dibuat (pending) saat customer_template dibuat
2. WO bayar via payment_method
3. INSERT payment (status=pending)
4. Gateway proses → callback → payment.status = 'success'
5. Sistem update invoice.status = 'paid'
6. Sistem update customer_template.active = true
7. ✅ Undangan live
```

**Ilustrasi query:**

```sql
-- Saat WO bayar:
INSERT INTO payment (id, invoice_id, wo_id, payment_method_id, amount, status, gateway, gateway_ref)
VALUES (gen_random_uuid(), 'uuid-invoice', 'uuid-wo', 'uuid-payment-method', 50000, 'pending', 'xendit', 'xendit-ref-123');

-- Callback dari gateway:
UPDATE payment SET status = 'success', paid_at = NOW()
WHERE gateway_ref = 'xendit-ref-123';

UPDATE invoice SET status = 'paid', paid_at = NOW()
WHERE id = (SELECT invoice_id FROM payment WHERE gateway_ref = 'xendit-ref-123');

UPDATE customer_template SET active = true
WHERE id = (SELECT customer_template_id FROM invoice WHERE id = 'uuid-invoice');
```

---

### 5.5 Guest RSVP + Attendance

**Pra-acara (RSVP):**

```
1. Tamu buka link undangan
2. Tamu isi: nama, jumlah orang (guest_count), bisa datang/tidak
3. INSERT guests
4. Link undangan otomatis menyertakan customer_id (lewat slug/param)
```

**Hari H (Attendance):**

```
1. Tamu datang ke lokasi
2. WO scan QR / cek nama
3. INSERT attendance
```

**Beda RSVP vs Attendance penting untuk laporan WO:**

```sql
-- WO bisa lihat:
SELECT COUNT(*) FROM guests WHERE customer_id = 'x' AND rsvp_status = true;  -- janji datang
SELECT COUNT(*) FROM attendance WHERE customer_id = 'x';                      -- real hadir
```

---

### 5.6 Anniversary

```
1. WO buat customer_template baru untuk customer yang sama
   - type = 'anniversary'
   - template_id bisa beda (atau sama, terserah WO)
2. Invoice baru → bayar lagi
3. INSERT cust_metadata baru dengan type='anniversary'
4. Tenant bisa upload foto & cerita baru
```

---

## 6. Aturan Bisnis (Business Rules)

### Rule 1: Template Access

WO **hanya bisa** memilih template yang termasuk dalam plan aktif mereka.

```sql
-- VALIDASI — jalankan SEBELUM INSERT customer_template:
SELECT COUNT(*) FROM plan_template pt
JOIN wo_plan wp ON wp.plan_id = pt.plan_id
WHERE wp.wo_id = :wo_id
  AND wp.status = 'active'
  AND pt.template_id = :template_id;
-- Harus = 1, jika 0 → reject
```

### Rule 2: Billing Per Aktivasi

Setiap `customer_template` yang dibuat = 1 invoice baru. Tidak ada free tier.

### Rule 3: Harga dalam Sen

Semua kolom harga (`plan.price`, `invoice.subtotal`, `invoice.tax`, `invoice.total`, `payment.amount`) dalam **sen/cent**:

- ✅ `50000` = Rp 500.000
- ❌ Jangan pakai `50000.00` (float)
- ❌ Jangan pakai `"Rp 500.000"` (string)

### Rule 4: UUID untuk Semua PK (Kecuali gallery)

- Semua Primary Key pakai `uuid` (`gen_random_uuid()` di PostgreSQL / `uuidv4()` di aplikasi).
- Satu-satunya pengecualian: `gallery.id` pakai `int` — karena ini tabel referensi ringan.

### Rule 5: Tenant Isolation Wajib

Setiap query SELECT/UPDATE/DELETE untuk data tenant-scoped **WAJIB** menyertakan `wo_id = ?`. Jangan pernah mengandalkan filter lewat JOIN saja.

### Rule 6: Status Invoice State Machine

```
pending ──> paid       → customer_template.active = true
pending ──> overdue    → WO tidak bisa aktivasi template baru sampai bayar
pending ──> cancelled  → row customer_template bisa dihapus atau di-archive
paid    ──> refunded   → customer_template.active = false
```

### Rule 7: 1 WO = 1 Plan Aktif

Dalam satu waktu, WO hanya punya 1 plan dengan `status='active'`. Ganti plan = expired plan lama + insert plan baru.

---

## 7. Pola Query Umum

### 7.1 Dashboard WO — ringkasan semua customer

```sql
SELECT
  c.id,
  c.male_name,
  c.female_name,
  ct.template_id,
  t.name AS template_name,
  ct.type,
  ct.active,
  cm.date AS event_date,
  (SELECT COUNT(*) FROM guests g WHERE g.customer_id = c.id) AS total_guests,
  (SELECT COUNT(*) FROM guests g WHERE g.customer_id = c.id AND g.rsvp_status = true) AS rsvp_yes,
  (SELECT COUNT(*) FROM attendance a WHERE a.customer_id = c.id) AS attended
FROM customers c
LEFT JOIN customer_template ct ON ct.customer_id = c.id AND ct.active = true
LEFT JOIN templates t ON t.id = ct.template_id
LEFT JOIN cust_metadata cm ON cm.customer_id = c.id AND cm.type = ct.type
WHERE c.wo_id = 'uuid-wo'
ORDER BY c.created_at DESC;
```

### 7.2 Cek template apa saja yang bisa dipakai WO

```sql
SELECT t.*
FROM templates t
JOIN plan_template pt ON pt.template_id = t.id
JOIN wo_plan wp ON wp.plan_id = pt.plan_id
WHERE wp.wo_id = 'uuid-wo'
  AND wp.status = 'active'
  AND wp.start_date <= NOW()
  AND (wp.end_date IS NULL OR wp.end_date >= NOW());
```

### 7.3 Invoice outstanding WO

```sql
SELECT
  i.invoice_number,
  i.total,
  i.status,
  i.due_date,
  c.male_name || ' & ' || c.female_name AS customer_name,
  t.name AS template_name
FROM invoice i
JOIN customer_template ct ON ct.id = i.customer_template_id
JOIN customers c ON c.id = ct.customer_id
JOIN templates t ON t.id = ct.template_id
WHERE i.wo_id = 'uuid-wo'
  AND i.status IN ('pending', 'overdue')
ORDER BY i.due_date ASC;
```

### 7.4 Laporan kehadiran per customer

```sql
SELECT
  g.name,
  g.guest_count,
  g.rsvp_status,
  CASE WHEN a.id IS NOT NULL THEN true ELSE false END AS attended
FROM guests g
LEFT JOIN attendance a ON a.guest_id = g.id
WHERE g.customer_id = 'uuid-customer'
ORDER BY g.created_at DESC;
```

---

## 8. Konvensi Database

### 8.1 Penamaan

| Item          | Aturan                      | Contoh                                           |
| ------------- | --------------------------- | ------------------------------------------------ |
| Nama tabel    | `snake_case`, plural        | `customer_template`, `wo_staff`, `cust_metadata` |
| Nama kolom    | `snake_case`                | `male_name`, `rsvp_status`, `guest_count`        |
| Primary key   | `id`                        |                                                  |
| Foreign key   | `{tujuan}_id`               | `wo_id`, `customer_id`, `template_id`            |
| Timestamp     | `created_at`, `updated_at`  |                                                  |
| Kolom boolean | `is_` prefix atau `_status` | `active`, `is_default`, `rsvp_status`            |

### 8.2 Tipe Data

| Tipe        | Kapan pakai                                                       |
| ----------- | ----------------------------------------------------------------- |
| `uuid`      | Semua primary key, foreign key                                    |
| `int`       | Harga (sen/cent), `gallery.id`                                    |
| `boolean`   | Status yes/no, flag                                               |
| `jsonb`     | Data fleksibel/change-prone (konfigurasi, cerita cinta, rekening) |
| `timestamp` | Semua tanggal/waktu                                               |
| `string`    | Teks pendek, enum                                                 |

### 8.3 Migrasi Database

- File migrasi: `database/migrations/{timestamp}_{name}.ts`
- Semua perubahan skema lewat migration — jangan edit manual di SQL.
- Naming: `create_{table}_table.ts` untuk tabel baru, `add_{column}_to_{table}_table.ts` untuk tambah kolom.

### 8.4 Path Aliases (AdonisJS)

Di aplikasi, gunakan path alias `#` bukan relative path:

```typescript
// ✅ BENAR
import Customer from '#models/customer'
import Invoice from '#models/invoice'

// ❌ SALAH
import Customer from '../../app/models/customer.js'
```

---

## Referensi

- **ERD lengkap:** `database/erd.md`
- **File migrasi:** `database/migrations/`
- **Schema generated:** `database/schema.ts` (auto-generated, jangan diedit manual)
- **Model definitions:** `app/models/`

---

> **Terakhir diperbarui:** 2026-05-25
>
> Ada yang kurang jelas? Tanyakan ke senior developer atau buka issue di repository.
