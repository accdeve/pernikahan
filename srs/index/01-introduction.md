# 01 — Pendahuluan

## 1.1 Tujuan

Dokumen Software Requirements Specification (SRS) ini bertujuan untuk mendefinisikan secara lengkap dan jelas seluruh kebutuhan sistem untuk **Platform Undangan Digital B2B** — sebuah platform SaaS multi-tenant yang memungkinkan Wedding Organization (WO) untuk membuat, mengelola, dan menerbitkan undangan pernikahan digital serta anniversary memory book untuk klien mereka.

Dokumen ini mencakup:

- Deskripsi fungsionalitas sistem secara menyeluruh
- Spesifikasi arsitektur dan model data (berbasis **Supabase**)
- Alur bisnis dan state machine
- Kebutuhan non-fungsional dan keamanan (dengan **Row Level Security**)
- Spesifikasi teknis setiap modul

## 1.2 Ruang Lingkup

Sistem ini mencakup dua produk utama:

| Produk                      | Model Bisnis                  | Siklus                               |
| --------------------------- | ----------------------------- | ------------------------------------ |
| **Wedding Invitation**      | Beli putus (one-time payment) | Aktif 13 hari, data tetap tersimpan  |
| **Anniversary Memory Book** | Monthly subscription          | Link permanen, add moment tiap tahun |

Ruang lingkup sistem meliputi:

1. **Manajemen Multi-Tenant** — Onboarding Wedding Organization (WO), manajemen staff, isolasi data antar WO
2. **Manajemen Customer** — Data pasangan pengantin, metadata undangan
3. **Template & Plan** — Katalog template (Basic/Premium), konfigurasi plan pricing
4. **Subscription & Billing** — Charge WO, pembayaran invoice, penagihan subscription anniversary
5. **Undangan Digital** — Halaman undangan live selama 13 hari, RSVP tamu, komentar, photobooth, check-in
6. **Anniversary Memory Book** — Link permanen, upload momen tahunan, muat data otomatis dari wedding
7. **Payment Processing** — Integrasi **Midtrans** (Snap API), multi metode pembayaran (kartu, transfer, e-wallet)

## 1.3 Definisi, Akronim, dan Singkatan

| Istilah            | Definisi                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| **WO**             | Wedding Organization — tenant/platform yang mengelola undangan klien      |
| **WO Staff**       | Karyawan WO dengan role Admin, Editor, atau Viewer                        |
| **Customer**       | Pasangan pengantin / klien WO                                             |
| **Beli Putus**     | Model pembayaran satu kali untuk satu undangan                            |
| **Subscription**   | Model pembayaran bulanan berkelanjutan                                    |
| **RSVP**           | Répondez s'il vous plaît — konfirmasi kehadiran tamu                      |
| **Memory Book**    | Buku kenangan anniversary online dengan fitur Add Moment tahunan          |
| **Midtrans**       | Payment gateway utama — Snap API untuk popup/redirect payment             |
| **Tenant**         | Instance WO yang terisolasi dalam arsitektur multi-tenant                 |
| **Supabase**       | Backend-as-a-Service: PostgreSQL, Auth, Storage, Edge Functions, Realtime |
| **RLS**            | Row Level Security — mekanisme PostgreSQL untuk isolasi data antar tenant |
| **Edge Functions** | Server-side logic di Supabase (Deno/TypeScript) untuk webhook & cron      |
| **JSONB**          | JSON Binary — format penyimpanan konfigurasi fleksibel di database        |

## 1.4 Referensi

| Referensi                         | Lokasi                    |
| --------------------------------- | ------------------------- |
| Entity Relationship Diagram (ERD) | `database/erd.md`         |
| Business Flow & State Machine     | `flow/diagram.mmd`        |
| Project Knowledge Base            | `AGENTS.md`               |
| Supabase Documentation            | https://supabase.com/docs |
| Midtrans Documentation            | https://docs.midtrans.com |

## 1.5 Konvensi Dokumen

- **Entitas database** ditulis dengan `snake_case` (contoh: `wedding_organization`, `customer_template`)
- **Field/atribut** ditulis dalam blok kode inline (contoh: `status`, `role`)
- **Prioritas fitur** menggunakan skala: **HIGH** (wajib MVP), **MEDIUM** (sprint berikutnya), **LOW** (enhancement)
- Diagram referensi utama: `flow/diagram.mmd` — berisi 5 diagram: Main Flow, Anniversary Flow, ERD, State Machine, Multi-Tenant Architecture
- **Teknologi inti**: Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime) + Midtrans (payment gateway)
