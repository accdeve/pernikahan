# 07 — Model Data & Entitas

## 7.1 Entity Relationship Diagram

Referensi utama: `database/erd.md` (erd format) dan `flow/diagram.mmd` (Mermaid ERD, baris 107-137).

## 7.2 Platform Database: Supabase PostgreSQL

Semua tabel menggunakan **PostgreSQL via Supabase**. Setiap tabel tenant dilindungi **Row Level Security (RLS)** dengan `wo_id` sebagai discriminator.

**Supabase Auth integration:**

- Autentikasi staff menggunakan **Supabase Auth** (`auth.users` table managed by Supabase)
- `wo_staff.user_id` mereferensi `auth.users.id` (UUID)
- Role dan `wo_id` disimpan di `wo_staff` table, bukan di `auth.users` (untuk fleksibilitas management)
- RLS policies menggunakan `auth.uid()` untuk mengidentifikasi user yang login

## 7.3 Daftar Entitas

### 7.3.0 `auth.users` (Managed by Supabase Auth)

| Kolom                | Tipe        | Deskripsi                         |
| -------------------- | ----------- | --------------------------------- |
| `id`                 | UUID        | PK — auto-generated               |
| `email`              | string      | UNIQUE, email staff               |
| `encrypted_password` | string      | Password hash (auto-managed)      |
| `email_confirmed_at` | timestamptz | Konfirmasi email                  |
| `app_metadata`       | jsonb       | `{ wo_id, role }` — custom claims |
| `created_at`         | timestamptz |                                   |

**Tidak perlu dibuat migration** — Supabase Auth mengelola ini secara otomatis.

**Integrasi dengan `wo_staff`:**

```
auth.users.id ──→ wo_staff.user_id (FK)
```

### 7.3.1 `wedding_organization` — Tenant WO

| Kolom        | Tipe        | Constraint                   | Deskripsi               |
| ------------ | ----------- | ---------------------------- | ----------------------- |
| `id`         | UUID        | PK DEFAULT gen_random_uuid() | Primary key             |
| `name`       | text        | NOT NULL                     | Nama organisasi wedding |
| `email`      | text        | NOT NULL, UNIQUE             | Email kontak            |
| `location`   | text        | NULLABLE                     | Lokasi/kota WO          |
| `created_at` | timestamptz | NOT NULL DEFAULT now()       | Waktu dibuat            |

**RLS:** Tidak perlu (belum ada staff saat WO dibuat). Akses via service_role key.

**Relasi:** Memiliki banyak `wo_staff`, `customers`, `wo_plan`, `customer_template`, `guests`, `cust_metadata`, `cust_comment`, `attendance`, `photobooth`, `payment_method`, `invoice`, `payment`

### 7.3.2 `wo_staff` — Staff WO

| Kolom        | Tipe        | Constraint                                           | Deskripsi                               |
| ------------ | ----------- | ---------------------------------------------------- | --------------------------------------- |
| `id`         | UUID        | PK DEFAULT gen_random_uuid()                         | Primary key                             |
| `user_id`    | UUID        | FK → `auth.users.id`, UNIQUE                         | Referensi ke Supabase Auth user         |
| `wo_id`      | UUID        | FK → `wedding_organization.id`, NOT NULL             | Tenant owner                            |
| `name`       | text        | NOT NULL                                             | Nama staff                              |
| `email`      | text        | NOT NULL, UNIQUE                                     | Email login (sinkron dengan auth.users) |
| `role`       | text        | NOT NULL CHECK (role IN ('admin','editor','viewer')) | Role akses                              |
| `created_at` | timestamptz | NOT NULL DEFAULT now()                               | Waktu dibuat                            |

**RLS Policy:**

```sql
-- Staff hanya bisa melihat staff di WO mereka sendiri
CREATE POLICY "wo_staff_tenant_isolation" ON wo_staff
  FOR ALL
  USING (wo_id = get_current_wo_id());
```

**Perubahan dari ERD asli:**

- `password_hash` dihapus — autentikasi ditangani oleh Supabase Auth
- `user_id` ditambahkan — FK ke `auth.users.id`
- Tipe data `text` (PostgreSQL) bukan `string`

### 7.3.3 `customers` — Pasangan Pengantin

| Kolom         | Tipe        | Constraint                               | Deskripsi      |
| ------------- | ----------- | ---------------------------------------- | -------------- |
| `id`          | UUID        | PK DEFAULT gen_random_uuid()             | Primary key    |
| `wo_id`       | UUID        | FK → `wedding_organization.id`, NOT NULL | Tenant owner   |
| `email`       | text        | NOT NULL                                 | Email pasangan |
| `male_name`   | text        | NOT NULL                                 | Nama pria      |
| `female_name` | text        | NOT NULL                                 | Nama wanita    |
| `created_at`  | timestamptz | NOT NULL DEFAULT now()                   | Waktu dibuat   |

**RLS Policy:**

```sql
CREATE POLICY "customers_tenant_isolation" ON customers
  FOR ALL
  USING (wo_id = get_current_wo_id())
  WITH CHECK (wo_id = get_current_wo_id());
```

### 7.3.4 `templates` — Template Undangan (Global)

| Kolom        | Tipe      | Constraint              | Deskripsi                                 |
| ------------ | --------- | ----------------------- | ----------------------------------------- |
| `id`         | UUID      | PK                      | Primary key                               |
| `name`       | string    | NOT NULL                | Nama template                             |
| `thumbnail`  | string    | NULLABLE                | URL thumbnail                             |
| `category`   | string    | ENUM('basic','premium') | Kategori template                         |
| `config`     | JSONB     | NOT NULL                | Konfigurasi template (layout, warna, dll) |
| `created_at` | timestamp | NOT NULL                | Waktu dibuat                              |

**Catatan:** Template bersifat global (platform-level), tidak terikat tenant. Konfigurasi JSONB memungkinkan fleksibilitas tinggi tanpa perubahan skema.

### 7.3.5 `plan` — Plan Pricing

| Kolom        | Tipe      | Constraint | Deskripsi          |
| ------------ | --------- | ---------- | ------------------ |
| `id`         | UUID      | PK         | Primary key        |
| `name`       | string    | NOT NULL   | Nama plan          |
| `price`      | int       | NOT NULL   | Harga dalam rupiah |
| `created_at` | timestamp | NOT NULL   | Waktu dibuat       |

### 7.3.6 `plan_template` — Relasi Plan ↔ Template

| Kolom         | Tipe      | Constraint          | Deskripsi                         |
| ------------- | --------- | ------------------- | --------------------------------- |
| `id`          | UUID      | PK                  | Primary key                       |
| `plan_id`     | UUID      | FK → `plan.id`      | Plan                              |
| `template_id` | UUID      | FK → `templates.id` | Template yang termasuk dalam plan |
| `created_at`  | timestamp | NOT NULL            | Waktu dibuat                      |

**Tujuan:** Menentukan template mana saja yang bisa diakses oleh WO berdasarkan plan yang dibeli.

### 7.3.7 `wo_plan` — Subscription WO ke Plan

| Kolom        | Tipe      | Constraint                     | Deskripsi           |
| ------------ | --------- | ------------------------------ | ------------------- |
| `id`         | UUID      | PK                             | Primary key         |
| `wo_id`      | UUID      | FK → `wedding_organization.id` | Tenant owner        |
| `plan_id`    | UUID      | FK → `plan.id`                 | Plan yang dibeli    |
| `status`     | string    | ENUM('active','expired')       | Status subscription |
| `start_date` | timestamp | NOT NULL                       | Mulai berlaku       |
| `end_date`   | timestamp | NOT NULL                       | Berakhir berlaku    |
| `created_at` | timestamp | NOT NULL                       | Waktu dibuat        |

### 7.3.8 `customer_template` — Template Assignment ke Customer

| Kolom         | Tipe      | Constraint                     | Deskripsi               |
| ------------- | --------- | ------------------------------ | ----------------------- |
| `id`          | UUID      | PK                             | Primary key             |
| `wo_id`       | UUID      | FK → `wedding_organization.id` | Tenant owner            |
| `customer_id` | UUID      | FK → `customers.id`            | Customer                |
| `template_id` | UUID      | FK → `templates.id`            | Template yang digunakan |
| `type`        | string    | ENUM('wedding','anniversary')  | Tipe penggunaan         |
| `active`      | boolean   | NOT NULL, DEFAULT false        | Status aktif            |
| `created_at`  | timestamp | NOT NULL                       | Waktu dibuat            |

**Business rule:** Untuk tipe `wedding`, hanya 1 `customer_template` per customer yang boleh `active=true` dalam satu waktu.

### 7.3.9 `guests` — Tamu Undangan

| Kolom         | Tipe      | Constraint                     | Deskripsi                 |
| ------------- | --------- | ------------------------------ | ------------------------- |
| `id`          | UUID      | PK                             | Primary key               |
| `wo_id`       | UUID      | FK → `wedding_organization.id` | Tenant owner              |
| `customer_id` | UUID      | FK → `customers.id`            | Customer (pasangan)       |
| `name`        | string    | NOT NULL                       | Nama tamu                 |
| `rsvp_status` | boolean   | DEFAULT false                  | Konfirmasi hadir          |
| `guest_count` | int       | DEFAULT 1                      | Jumlah orang yang ikut    |
| `reason`      | string    | NULLABLE                       | Alasan (jika tidak hadir) |
| `created_at`  | timestamp | NOT NULL                       | Waktu dibuat              |

### 7.3.10 `cust_metadata` — Metadata Undangan Customer

| Kolom                  | Tipe      | Constraint                     | Deskripsi                          |
| ---------------------- | --------- | ------------------------------ | ---------------------------------- |
| `id`                   | UUID      | PK                             | Primary key                        |
| `wo_id`                | UUID      | FK → `wedding_organization.id` | Tenant owner                       |
| `customer_id`          | UUID      | FK → `customers.id`            | Customer                           |
| `customer_template_id` | UUID      | FK → `customer_template.id`    | Template assignment                |
| `date`                 | timestamp | NULLABLE                       | Tanggal acara (general)            |
| `type`                 | string    | ENUM('wedding','anniversary')  | Tipe metadata                      |
| `image_id`             | int       | FK → `gallery.id`              | Foto dari gallery global           |
| `location`             | string    | NULLABLE                       | Nama lokasi acara                  |
| `address`              | string    | NULLABLE                       | Alamat lengkap                     |
| `akad_date`            | timestamp | NULLABLE                       | Tanggal akad nikah                 |
| `reception_date`       | timestamp | NULLABLE                       | Tanggal resepsi                    |
| `love_story`           | JSONB     | NULLABLE                       | Cerita cinta (array of moment)     |
| `bank_account`         | JSONB     | NULLABLE                       | Data rekening untuk amplop digital |
| `created_at`           | timestamp | NOT NULL                       | Waktu dibuat                       |

**Catatan tentang `love_story` (JSONB):**

```json
[
  {
    "title": "Pertama Bertemu",
    "date": "2020-01-15",
    "description": "Bertemu di acara seminar",
    "photo_url": "https://..."
  }
]
```

**Catatan tentang `bank_account` (JSONB):**

```json
[
  {
    "bank": "BCA",
    "account_number": "1234567890",
    "account_name": "John Doe"
  }
]
```

### 7.3.11 `gallery` — Gallery Media (Global)

| Kolom        | Tipe      | Constraint | Deskripsi                         |
| ------------ | --------- | ---------- | --------------------------------- |
| `id`         | int       | PK         | Primary key (integer, bukan UUID) |
| `image`      | JSONB     | NULLABLE   | Data gambar (URL, metadata)       |
| `video`      | string    | NULLABLE   | URL video                         |
| `created_at` | timestamp | NOT NULL   | Waktu dibuat                      |

**Catatan:** Gallery bersifat global (platform-level). ID menggunakan integer, berbeda dengan entitas lain yang UUID.

### 7.3.12 `cust_comment` — Komentar Tamu

| Kolom         | Tipe      | Constraint                     | Deskripsi         |
| ------------- | --------- | ------------------------------ | ----------------- |
| `id`          | UUID      | PK                             | Primary key       |
| `wo_id`       | UUID      | FK → `wedding_organization.id` | Tenant owner      |
| `customer_id` | UUID      | FK → `customers.id`            | Customer          |
| `guest_id`    | UUID      | FK → `guests.id`               | Tamu yang menulis |
| `comment`     | string    | NOT NULL                       | Isi komentar      |
| `created_at`  | timestamp | NOT NULL                       | Waktu dibuat      |
| `updated_at`  | timestamp | NULLABLE                       | Waktu diupdate    |

### 7.3.13 `attendance` — Check-in Tamu

| Kolom         | Tipe      | Constraint                     | Deskripsi          |
| ------------- | --------- | ------------------------------ | ------------------ |
| `id`          | UUID      | PK                             | Primary key        |
| `wo_id`       | UUID      | FK → `wedding_organization.id` | Tenant owner       |
| `customer_id` | UUID      | FK → `customers.id`            | Customer           |
| `guest_id`    | UUID      | FK → `guests.id`               | Tamu yang check-in |
| `created_at`  | timestamp | NOT NULL                       | Waktu check-in     |

### 7.3.14 `photobooth` — Foto Photobooth

| Kolom         | Tipe      | Constraint                     | Deskripsi    |
| ------------- | --------- | ------------------------------ | ------------ |
| `id`          | UUID      | PK                             | Primary key  |
| `wo_id`       | UUID      | FK → `wedding_organization.id` | Tenant owner |
| `customer_id` | UUID      | FK → `customers.id`            | Customer     |
| `image_url`   | string    | NOT NULL                       | URL foto     |
| `created_at`  | timestamp | NOT NULL                       | Waktu upload |

### 7.3.15 `payment_method` — Metode Pembayaran WO

| Kolom        | Tipe      | Constraint                            | Deskripsi                  |
| ------------ | --------- | ------------------------------------- | -------------------------- |
| `id`         | UUID      | PK                                    | Primary key                |
| `wo_id`      | UUID      | FK → `wedding_organization.id`        | Tenant owner               |
| `type`       | string    | ENUM('card','transfer','gopay','ovo') | Jenis pembayaran           |
| `provider`   | string    | NOT NULL                              | Nama provider/bank         |
| `token`      | string    | NOT NULL                              | Token dari payment gateway |
| `is_default` | boolean   | DEFAULT false                         | Default payment method     |
| `created_at` | timestamp | NOT NULL                              | Waktu dibuat               |

### 7.3.16 `invoice` — Invoice WO

| Kolom                  | Tipe      | Constraint                                              | Deskripsi                       |
| ---------------------- | --------- | ------------------------------------------------------- | ------------------------------- |
| `id`                   | UUID      | PK                                                      | Primary key                     |
| `wo_id`                | UUID      | FK → `wedding_organization.id`                          | Tenant owner                    |
| `customer_template_id` | UUID      | FK → `customer_template.id`                             | Layanan yang ditagih            |
| `invoice_number`       | string    | NOT NULL, UNIQUE                                        | Nomor invoice unik              |
| `description`          | string    | NULLABLE                                                | Deskripsi tagihan               |
| `subtotal`             | int       | NOT NULL                                                | Subtotal (belum termasuk pajak) |
| `tax`                  | int       | DEFAULT 0                                               | Pajak                           |
| `total`                | int       | NOT NULL                                                | Total (subtotal + tax)          |
| `status`               | string    | ENUM('pending','paid','overdue','cancelled','refunded') | Status invoice                  |
| `due_date`             | timestamp | NOT NULL                                                | Batas pembayaran                |
| `paid_at`              | timestamp | NULLABLE                                                | Waktu dibayar                   |
| `created_at`           | timestamp | NOT NULL                                                | Waktu dibuat                    |
| `updated_at`           | timestamp | NULLABLE                                                | Waktu diupdate                  |

### 7.3.17 `payment` — Record Pembayaran

| Kolom               | Tipe      | Constraint                                    | Deskripsi              |
| ------------------- | --------- | --------------------------------------------- | ---------------------- |
| `id`                | UUID      | PK                                            | Primary key            |
| `invoice_id`        | UUID      | FK → `invoice.id`                             | Invoice yang dibayar   |
| `wo_id`             | UUID      | FK → `wedding_organization.id`                | Tenant owner           |
| `payment_method_id` | UUID      | FK → `payment_method.id`                      | Metode pembayaran      |
| `amount`            | int       | NOT NULL                                      | Jumlah dibayar         |
| `status`            | string    | ENUM('pending','success','failed','refunded') | Status payment         |
| `gateway`           | string    | ENUM('xendit','midtrans','stripe')            | Payment gateway        |
| `gateway_ref`       | string    | NULLABLE                                      | Reference dari gateway |
| `paid_at`           | timestamp | NULLABLE                                      | Waktu pembayaran       |
| `created_at`        | timestamp | NOT NULL                                      | Waktu dibuat           |

## 7.4 Catatan Implementasi Supabase

### 7.4.1 Perubahan dari ERD Asli

| ERD Field                | Perubahan untuk Supabase                         |
| ------------------------ | ------------------------------------------------ |
| `wo_staff.password_hash` | **DIHAPUS** — auth via Supabase Auth             |
| `wo_staff` (no user_id)  | **DITAMBAH** `user_id UUID FK → auth.users.id`   |
| `string` type            | **GANTI** ke `text` (PostgreSQL native)          |
| `timestamp`              | **GANTI** ke `timestamptz` (with timezone)       |
| `ENUM`                   | **GANTI** ke `CHECK` constraint (lebih portabel) |
| Auto-generate UUID       | **TAMBAH** `DEFAULT gen_random_uuid()`           |

### 7.4.2 Tipe Data PostgreSQL vs ERD

| ERD Type    | PostgreSQL Type |
| ----------- | --------------- |
| `uuid`      | `UUID`          |
| `string`    | `text`          |
| `int`       | `integer`       |
| `boolean`   | `boolean`       |
| `jsonb`     | `jsonb`         |
| `timestamp` | `timestamptz`   |

### 7.4.3 RLS Implementation Notes

Semua tabel tenant harus memiliki RLS policy. Berikut template migration SQL:

```sql
-- 1. Enable RLS on all tenant tables
ALTER TABLE wo_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_template ENABLE ROW LEVEL SECURITY;
-- ... dst

-- 2. Helper function
CREATE OR REPLACE FUNCTION get_current_wo_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT wo_id FROM wo_staff WHERE user_id = auth.uid()
$$;

-- 3. Policy template
CREATE POLICY "tenant_isolation" ON customers
  FOR ALL
  USING (wo_id = get_current_wo_id())
  WITH CHECK (wo_id = get_current_wo_id());
```

### 7.4.4 Storage Buckets

```sql
-- Buckets dibuat via Supabase Dashboard atau Management API
-- Bucket: photobooth, gallery, templates, anniversary

-- Contoh RLS untuk Storage
CREATE POLICY "photobooth_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photobooth'
);
```

## 7.5 Ringkasan Relasi

```
wedding_organization
├── wo_staff (1:N)
├── customers (1:N)
├── wo_plan (1:N)
├── customer_template (1:N)
├── guests (1:N)
├── cust_metadata (1:N)
├── cust_comment (1:N)
├── attendance (1:N)
├── photobooth (1:N)
├── payment_method (1:N)
├── invoice (1:N)
└── payment (1:N)

plan
├── plan_template (1:N) → templates
└── wo_plan (1:N)

customers
├── customer_template (1:N)
├── guests (1:N)
├── cust_metadata (1:N)
└── cust_comment (1:N)

customer_template
├── cust_metadata (1:1)
└── invoice (1:N)

guests
├── cust_comment (1:N)
└── attendance (1:N)

invoice → payment (1:N)
payment_method → payment (1:N)
gallery → cust_metadata (1:N)
```
