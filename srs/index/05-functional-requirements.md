# 05 — Kebutuhan Fungsional

## 5.1 Manajemen Wedding Organization (WO)

| ID    | Kebutuhan                                                                                                    | Prioritas |
| ----- | ------------------------------------------------------------------------------------------------------------ | --------- |
| FR-01 | Sistem harus memungkinkan registrasi WO baru dengan data: `name`, `email`, `location`                        | HIGH      |
| FR-02 | Sistem harus menyediakan dashboard WO yang menampilkan ringkasan customer aktif, invoice pending, tamu total | HIGH      |
| FR-03 | Sistem harus memungkinkan WO mengupdate profil mereka (nama, email, lokasi)                                  | HIGH      |

**Entitas terkait:** `wedding_organization` (id, name, email, location, created_at)

## 5.2 Manajemen Staff & Autentikasi

| ID    | Kebutuhan                                                                                                   | Prioritas |
| ----- | ----------------------------------------------------------------------------------------------------------- | --------- |
| FR-04 | Sistem harus memungkinkan WO Admin membuat staff baru dengan data: `name`, `email`, `password_hash`, `role` | HIGH      |
| FR-05 | Sistem harus mendukung autentikasi staff dengan email & password                                            | HIGH      |
| FR-06 | Sistem harus menerapkan JWT-based auth via Supabase Auth                                                    | HIGH      |
| FR-07 | Sistem harus membatasi akses berdasarkan role: Admin (full), Editor (terbatas), Viewer (read-only)          | HIGH      |
| FR-08 | Sistem harus memungkinkan WO Admin menghapus/menonaktifkan staff                                            | MEDIUM    |

**Entitas terkait:** `wo_staff` (id, wo_id, name, email, password_hash, role, created_at)

## 5.3 Manajemen Customer (Pasangan)

| ID    | Kebutuhan                                                                                           | Prioritas |
| ----- | --------------------------------------------------------------------------------------------------- | --------- |
| FR-09 | Sistem harus memungkinkan WO membuat data customer baru dengan: `email`, `male_name`, `female_name` | HIGH      |
| FR-10 | Sistem harus memungkinkan WO melihat daftar semua customer mereka                                   | HIGH      |
| FR-11 | Sistem harus memungkinkan WO mengupdate data customer                                               | HIGH      |
| FR-12 | Sistem harus memungkinkan WO menghapus customer (Admin & Editor)                                    | MEDIUM    |

**Entitas terkait:** `customers` (id, wo_id, email, male_name, female_name, created_at)

## 5.4 Manajemen Template

| ID    | Kebutuhan                                                                                                                 | Prioritas |
| ----- | ------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-13 | Sistem harus menyediakan katalog template dengan field: `name`, `thumbnail`, `category` (basic/premium), `config` (JSONB) | HIGH      |
| FR-14 | Sistem harus memungkinkan platform (bukan WO) menambah/mengedit/menghapus template                                        | HIGH      |
| FR-15 | Template harus memiliki konfigurasi JSONB yang fleksibel untuk berbagai variasi tata letak                                | MEDIUM    |
| FR-16 | Sistem harus membatasi akses template berdasarkan plan yang dibeli WO                                                     | HIGH      |

**Entitas terkait:** `templates` (id, name, thumbnail, category, config, created_at)

## 5.5 Manajemen Plan & Subscription

| ID    | Kebutuhan                                                                                                  | Prioritas |
| ----- | ---------------------------------------------------------------------------------------------------------- | --------- |
| FR-17 | Sistem harus menyediakan daftar plan dengan `name` dan `price`                                             | HIGH      |
| FR-18 | Sistem harus menghubungkan plan dengan template melalui `plan_template` (plan mana mencakup template mana) | HIGH      |
| FR-19 | Sistem harus mencatat subscription WO ke plan melalui `wo_plan` dengan status `active`/`expired`           | HIGH      |
| FR-20 | Sistem harus melacak `start_date` dan `end_date` dari subscription WO                                      | HIGH      |
| FR-21 | Sistem harus secara otomatis mengubah status `wo_plan` menjadi `expired` ketika `end_date` tercapai        | MEDIUM    |

**Entitas terkait:** `plan`, `plan_template`, `wo_plan`

## 5.6 Manajemen Undangan (Wedding Flow)

| ID    | Kebutuhan                                                                                                | Prioritas |
| ----- | -------------------------------------------------------------------------------------------------------- | --------- |
| FR-22 | WO harus bisa memilih template untuk customer dan mengaktifkannya via `customer_template`                | HIGH      |
| FR-23 | Sistem harus mencatat metadata undangan: tanggal akad, resepsi, lokasi, alamat, love story, bank account | HIGH      |
| FR-24 | Sistem harus mengaktifkan undangan selama 13 hari (1 minggu 6 hari)                                      | HIGH      |
| FR-25 | Sistem harus menonaktifkan undangan otomatis setelah 13 hari                                             | HIGH      |
| FR-26 | Halaman undangan harus bisa diakses publik via link unik                                                 | HIGH      |
| FR-27 | Customer dapat memiliki multiple template untuk tipe berbeda: `wedding`, `anniversary`                   | MEDIUM    |

**Entitas terkait:** `customer_template`, `cust_metadata`

## 5.7 Anniversary Memory Book

| ID    | Kebutuhan                                                                                           | Prioritas |
| ----- | --------------------------------------------------------------------------------------------------- | --------- |
| FR-28 | WO harus bisa mengaktifkan Anniversary Memory Book untuk customer dengan tipe `anniversary`         | HIGH      |
| FR-29 | Sistem harus menghasilkan link permanen untuk Anniversary (tidak kadaluarsa)                        | HIGH      |
| FR-30 | Data wedding otomatis termuat: foto undangan, photobooth tamu, detail pasangan                      | HIGH      |
| FR-31 | Customer harus bisa menambahkan momen baru setiap tahun (Add Moment): foto, cerita, tanggal, lokasi | HIGH      |
| FR-32 | Anniversary menggunakan model monthly subscription berkelanjutan                                    | MEDIUM    |

**Entitas terkait:** `customer_template` (dengan `type='anniversary'`), `cust_metadata` (dengan `type='anniversary'`)

## 5.8 Manajemen Tamu & RSVP

| ID    | Kebutuhan                                                                                   | Prioritas |
| ----- | ------------------------------------------------------------------------------------------- | --------- |
| FR-33 | Tamu harus bisa mengisi RSVP pada halaman undangan: nama, status hadir, jumlah tamu, alasan | HIGH      |
| FR-34 | WO dan customer harus bisa melihat daftar tamu dan status RSVP                              | HIGH      |
| FR-35 | Sistem harus menyimpan data tamu: `name`, `rsvp_status`, `guest_count`, `reason`            | HIGH      |
| FR-36 | Tamu harus diikat ke WO dan customer tertentu                                               | HIGH      |

**Entitas terkait:** `guests` (id, wo_id, customer_id, name, rsvp_status, guest_count, reason, created_at)

## 5.9 Sistem Komentar Tamu

| ID    | Kebutuhan                                                                                          | Prioritas |
| ----- | -------------------------------------------------------------------------------------------------- | --------- |
| FR-37 | Tamu harus bisa menulis komentar di halaman undangan                                               | MEDIUM    |
| FR-38 | Komentar harus mencatat: `wo_id`, `customer_id`, `guest_id`, `comment`, `created_at`, `updated_at` | MEDIUM    |
| FR-39 | WO dan customer harus bisa melihat semua komentar                                                  | MEDIUM    |

**Entitas terkait:** `cust_comment`

## 5.10 Check-in / Attendance

| ID    | Kebutuhan                                                     | Prioritas |
| ----- | ------------------------------------------------------------- | --------- |
| FR-40 | Sistem harus mencatat kehadiran tamu saat hari H (check-in)   | MEDIUM    |
| FR-41 | Data attendance: tamu mana yang hadir, WO mana, customer mana | MEDIUM    |
| FR-42 | Attendance dihubungkan ke guest (yang sudah melakukan RSVP)   | MEDIUM    |

**Entitas terkait:** `attendance`

## 5.11 Photobooth

| ID    | Kebutuhan                                                   | Prioritas |
| ----- | ----------------------------------------------------------- | --------- |
| FR-43 | Tamu harus bisa upload foto melalui fitur photobooth        | LOW       |
| FR-44 | Foto tersimpan dengan: `wo_id`, `customer_id`, `image_url`  | LOW       |
| FR-45 | Foto photobooth otomatis termuat di Anniversary Memory Book | LOW       |

**Entitas terkait:** `photobooth`

## 5.12 Gallery

| ID    | Kebutuhan                                                                     | Prioritas |
| ----- | ----------------------------------------------------------------------------- | --------- |
| FR-46 | Sistem harus menyediakan gallery gambar/video global (platform level)         | MEDIUM    |
| FR-47 | Gallery bisa direferensi oleh `cust_metadata` (untuk foto default/background) | MEDIUM    |

**Entitas terkait:** `gallery`, `cust_metadata.image_id`

## 5.13 Payment Method

| ID    | Kebutuhan                                                                        | Prioritas |
| ----- | -------------------------------------------------------------------------------- | --------- |
| FR-48 | WO harus bisa mendaftarkan metode pembayaran: `card`, `transfer`, `gopay`, `ovo` | HIGH      |
| FR-49 | Setiap metode pembayaran memiliki data: `provider`, `token`, `is_default`        | HIGH      |
| FR-50 | WO bisa menandai satu metode sebagai default                                     | MEDIUM    |

**Entitas terkait:** `payment_method`

## 5.14 Invoice & Payment

| ID    | Kebutuhan                                                                        | Prioritas |
| ----- | -------------------------------------------------------------------------------- | --------- |
| FR-51 | Sistem harus membuat invoice saat WO di-charge untuk customer baru               | HIGH      |
| FR-52 | Invoice memiliki status: `pending`, `paid`, `overdue`, `cancelled`, `refunded`   | HIGH      |
| FR-53 | Sistem harus menerima pembayaran melalui **Midtrans** (Snap API)                 | HIGH      |
| FR-54 | Payment record mencatat: `amount`, `status`, `gateway`, `gateway_ref`, `paid_at` | HIGH      |
| FR-55 | Sistem harus mengupdate status invoice saat payment sukses                       | HIGH      |
| FR-56 | Sistem harus menangani due date invoice dan mengubah status jadi `overdue`       | MEDIUM    |
| FR-57 | WO bisa membatalkan invoice yang masih `pending`                                 | MEDIUM    |
| FR-58 | Sistem harus mendukung refund (`paid` → `refunded`)                              | LOW       |

**Entitas terkait:** `invoice`, `payment`

## 5.15 Ringkasan Prioritas

| Prioritas  | Jumlah Fitur | Target                  |
| ---------- | ------------ | ----------------------- |
| **HIGH**   | 35           | MVP / Rilis pertama     |
| **MEDIUM** | 15           | Sprint 2-3              |
| **LOW**    | 4            | Enhancement / Sprint 4+ |
