# Platform Undangan Digital B2B — Wedding & Anniversary MVP

Platform SaaS B2B multi-tenant untuk **Wedding Organizer (WO)** untuk membuat, mengelola, dan mengaktifkan undangan digital (**Wedding Invitation**) serta buku memori abadi (**Anniversary Memory Book**) bagi klien mereka.

Proyek ini menggunakan **AdonisJS 7** sebagai renderer kerangka UI ringan (Edge.js & Vite) dan **Supabase (Docker)** sepenuhnya sebagai engine backend (PostgreSQL, Auth, Storage, RLS, dan JSONB metadata) dengan komunikasi langsung (_direct-to-Supabase_) secara client-side memanfaatkan **Alpine.js**.

---

## 🏗️ Arsitektur Proyek

Sistem ini didesain dengan konsep **SaaS Multi-Tenant** yang aman, modular, dan sangat berkinerja tinggi:

- **Database & Tenant Isolation (PostgreSQL RLS)**: Pemisahan data ketat antar WO dilakukan langsung di level database via PostgreSQL **Row Level Security (RLS)** menggunakan discriminator `wo_id`.
- **Autentikasi (Supabase Auth)**: Keamanan pendaftaran dan sesi staff WO dikelola langsung oleh engine autentikasi bawaan Supabase (GoTrue).
- **Direct-to-Client**: Operasi CRUD data customer, RSVP, komentar, dan pembaruan memori tahunan dilakukan langsung dari browser ke API Gateway Supabase menggunakan `@supabase/supabase-js`.
- **Client-Side Decoupling**: Seluruh logic interaksi frontend dipisah secara bersih ke file-file modul ES di `resources/js/` dan diikat secara otomatis menggunakan `Alpine.data()`, menjamin kode bebas dari inline script anti-pattern.

---

## 📁 Struktur Folder

```
pernikahan/
├── supabase/                      # Konfigurasi Supabase Docker lokal
│   ├── migrations/                # Database Migrations (PostgreSQL SQL)
│   │   ├── 20260528000001_create_mvp_tables.sql  # DDL Tabel Utama MVP
│   │   └── 20260528000002_rls_policies.sql      # Keamanan RLS & Onboarding
│   ├── seed.sql                   # Global seeding: Pricing Plans & Templates
│   └── config.toml                # Supabase local environment config
├── resources/
│   ├── js/                        # Modular Frontend Javascript (Alpine.js)
│   │   ├── lib/
│   │   │   └── supabase-client.js # Inisialisasi Supabase Client SDK ke Docker
│   │   ├── b2b/
│   │   │   └── auth.js            # Handler login & signup onboarding
│   │   ├── themes/
│   │   │   ├── wedding.js         # Handler interaktif public Wedding invitation
│   │   │   └── anniversary.js     # Handler Timeline abadi & Add Moment
│   │   └── app.js                 # Entrypoint & registrasi global Alpine
│   └── views/
│       └── pages/b2b/             # Layout & views portal B2B
│           ├── login.edge         # Login staff WO
│           ├── signup.edge        # Onboarding WO & staff baru
│           ├── dashboard.edge     # Panel utama WO & Aktivasi template
│           └── templates/         # Viewer public templates
│               ├── wedding.edge   # Tema Royal Java Wedding
│               └── anniversary.edge # Tema Modern Memory Anniversary
```

---

## 🚀 Panduan Setup & Instalasi Lokal

### Prasyarat

- **Node.js** >= 24.0.0
- **Docker Desktop** (harus dalam keadaan aktif untuk menjalankan Supabase)

### Langkah-Langkah

1. **Clone repositori** dan masuk ke direktori proyek.
2. **Instal dependensi Node**:
   ```bash
   npm install
   ```
3. **Start local Supabase (Docker)**:
   Perintah ini akan otomatis menarik image Docker, menjalankan container Supabase lokal, mengeksekusi semua file migrasi schema database, dan mempopulerkan seed data:
   ```bash
   npx supabase start
   ```
4. **Verifikasi skema database (Opsional)**:
   Untuk memastikan migrasi database ter-deploy bersih tanpa error, Anda bisa mereset local database kapan saja:
   ```bash
   npx supabase db reset
   ```
5. **Jalankan Aplikasi Web**:
   Jalankan server pengembangan lokal AdonisJS:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://127.0.0.1:3333`.

---

## 💻 Cara Menguji Alur Kerja Portal B2B (MVP)

1. **Onboarding Wedding Organizer Baru**:
   Buka `http://127.0.0.1:3333/b2b/signup` untuk mendaftarkan nama WO, domisili, beserta akun Staff Utama (Admin). Sistem akan otomatis meregistrasikan WO baru, membuat user di Supabase Auth, merekam data di `wo_staff`, dan mengaitkan paket basic default aktif di database PostgreSQL!
2. **Dashboard WO**:
   Setelah pendaftaran sukses, Anda akan dialihkan ke `/b2b/dashboard`.
   - Klik tombol **"Customer Baru"** untuk mendaftarkan pasangan pengantin klien Anda.
   - Klik tombol **"Wedding"** atau **"Anniversary"** di baris customer untuk mengaktifkan template instan untuk customer tersebut (mock billing bypass otomatis aktif).
3. **Melihat Undangan Pernikahan (Wedding)**:
   Klik tombol **"Undangan"** untuk melihat halaman undangan publik bertema Royal Java di `/undangan/nama-wanita-nama-pria`. Uji fitur widget Countdown, kirim RSVP, dan berikan Ucapan Restu di kolom Buku Tamu!
4. **Melihat Lembar Kenangan (Anniversary)**:
   Klik tombol **"Memory"** untuk mengakses halaman abadi di `/memory/nama-wanita-nama-pria`. Di bagian bawah halaman, isi form **"Tulis Momen Baru"** (klik Add Moment) untuk melihat cerita perjalanan cinta pasangan bertambah secara real-time ke dalam database Supabase!

---

## 🛠️ Dashboard & Tooling Tambahan Supabase

Begitu kontainer lokal Supabase Anda berjalan, Anda dapat mengakses utility berikut secara lokal:

- **Supabase Studio (Database GUI)**: [http://127.0.0.1:54323](http://127.0.0.1:54323) — Untuk melihat tabel, data seeder, logs, dan menguji query SQL.
- **Mailpit (Local Email Tester)**: [http://127.0.0.1:54324](http://127.0.0.1:54324) — Untuk menangkap email konfirmasi dari autentikasi Supabase.
