# 🕊️ Platform Undangan Digital SaaS (Wednity) — React & Supabase

Platform SaaS B2B *multi-tenant* modern yang dirancang untuk **Wedding Organizer (WO)** agar dapat membuat, mengelola, dan meluncurkan undangan pernikahan digital (**Wedding Invitation**) premium serta buku kenangan (**Anniversary Memory Book**) untuk klien mereka secara instan.

Proyek ini telah dimigrasikan sepenuhnya dari arsitektur lama (AdonisJS + Alpine.js) ke arsitektur modern berbasis **React SPA + Supabase (Self-hosted/Docker)** dengan performa tinggi, animasi GSAP interaktif, dan isolasi data tingkat tinggi.

---

## 🏗️ Arsitektur Sistem

Sistem ini berjalan sepenuhnya secara *client-side* (*Direct-to-Supabase*) tanpa server backend perantara tradisional. Semua query database, autentikasi, dan penyimpanan media dilakukan langsung dari browser ke API Gateway Supabase menggunakan `@supabase/supabase-js`.

```
                  ┌──────────────────────────────┐
                  │      React SPA Frontend      │
                  │   (GSAP, React Router, UI)   │
                  └──────────────┬───────────────┘
                                 │ (Direct Client SDK / Auth / Storage)
                                 ▼
                  ┌──────────────────────────────┐
                  │    Supabase local (Docker)   │
                  │  (Kong, Auth, Rest, Storage) │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   PostgreSQL Database RLS    │
                  │   (Isolasi Tenant wo_id)     │
                  └──────────────────────────────┘
```

### Pilar Utama Arsitektur:
1. **Tenant Isolation (PostgreSQL RLS)**: Isolasi data antar WO diimplementasikan di tingkat database via PostgreSQL **Row Level Security (RLS)** menggunakan kolom discriminator `wo_id`. Staff WO hanya dapat membaca dan menulis data milik WO mereka sendiri.
2. **Autentikasi (Supabase Auth)**: Autentikasi staff dikelola langsung oleh Supabase Auth (GoTrue) menggunakan alur PKCE.
3. **Onboarding & Registrasi (Edge Functions)**: Pendaftaran WO baru dan pembuatan akun administrator WO ditangani secara transaksional melalui Supabase Edge Function (`wo-signup`) di dalam Deno runtime.
4. **Penyimpanan Media**: Gambar galeri diunggah langsung ke Supabase Storage (dikonversi otomatis ke format WebP di sisi klien untuk efisiensi bandwidth).
5. **Animasi Premium**: Animasi interaktif menggunakan **GSAP (GreenSock)** dengan hook React yang dibersihkan dengan benar saat *unmount* untuk mencegah kebocoran memori.

### 🐳 Docker & Orchestration (Multi-YAML Config)
File [docker-compose.yml](./docker-compose.yml) di root proyek menggunakan fitur `include` pada Docker Compose (v2) untuk merangkai beberapa sub-konfigurasi secara modular:
* **[supabase/supabase.yml](./supabase/supabase.yml)**: Berisi konfigurasi 15 layanan Supabase lokal (seperti DB, Auth, Storage, Kong Gateway, Studio GUI, dll.).
* **[docker/redis.yml](./docker/redis.yml)**: Menyediakan instance Redis lokal untuk kebutuhan caching/realtime.
* **[docker/web.yml](./docker/web.yml)** *(Opsional)*: Menyediakan container web server untuk deployment terpadu (dimatikan di lingkungan development agar Vite HMR berjalan langsung di host machine).

Semua service internal Docker membaca variabel lingkungan dari file `.env` tunggal di root proyek via deklarasi `env_file: .env`.

---

## 📁 Struktur Folder & Kode Sumber

```
pernikahan/
├── resources/
│   ├── js/                          # React SPA source (TypeScript)
│   │   ├── main.tsx                 # Entry point aplikasi (Vite + React Router)
│   │   ├── router.tsx               # Rute-rute aplikasi (React Router v7)
│   │   ├── admin/                   # Modul Panel Admin
│   │   │   ├── App.tsx              # Aplikasi Monolitik Admin (Dashboard, CRUD, Charts)
│   │   │   └── login/signup.tsx     # Komponen legacy (tetap dipertahankan sebagai referensi)
│   │   ├── components/
│   │   │   ├── ui/                  # Primitives UI menggunakan shadcn/ui
│   │   │   ├── public/              # Komponen publik (RsvpForm, Guestbook)
│   │   │   ├── shared/              # Komponen bersama (AudioPlayer, Toast)
│   │   │   ├── login-form.tsx       # Form Login menggunakan Supabase Auth PKCE
│   │   │   └── signup-form.tsx      # Form Signup memicu Edge Function wo-signup
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx      # Provider status autentikasi Supabase
│   │   │   └── ThemeContext.tsx     # Provider tema global
│   │   ├── hooks/                   # Custom Hooks global (useAudio, useClipboard, useRsvp)
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx       # Layout publik (overlay sampul + Outlet)
│   │   │   └── AdminLayout.tsx      # Layout admin (Sidebar shadcn/ui)
│   │   ├── lib/
│   │   │   ├── supabase-client.ts   # Inisialisasi Klien Supabase SDK
│   │   │   └── utils.ts             # Utilitas kelas Tailwind (cn helper)
│   │   ├── pages/                   # Halaman-halaman utama
│   │   │   ├── InvitationPage.tsx   # Halaman Undangan Publik (memilih tema secara dinamis)
│   │   │   ├── RsvpPage.tsx         # Halaman RSVP / Buku Tamu mandiri
│   │   │   └── admin/               # Halaman portal admin
│   │   └── themes/                  # Tema Undangan Premium
│   │       ├── java_style/          # Tema Adat Jawa Tradisional (Javanese Royal Heritage)
│   │       └── image_sequence/      # Tema Editorial modern berbasis sequence scroll GSAP
│   └── css/
│       ├── app.css                  # CSS Global & Styling custom tema GSAP (~2800 baris)
│       └── tailwind.css             # Entry point Tailwind CSS v4
├── supabase/                        # Konfigurasi Supabase Docker & CLI
│   ├── config.toml                  # Konfigurasi CLI Supabase lokal
│   ├── supabase.yml                 # Layanan Docker Compose (15 service internal)
│   ├── migrations/                  # Script migrasi database (DDL & RLS Policies)
│   └── volumes/functions/           # Supabase Edge Functions (Deno TS)
└── package.json                     # Definisi dependensi & skrip Node.js
```

---

## 🛠️ Panduan Pengembangan & Setup Lokal

### Prasyarat System:
* **Node.js** >= 24.0.0
* **Docker Desktop** (harus aktif untuk menjalankan kontainer Supabase lokal)

### Langkah Setup:

1. **Clone Repositori & Install Dependensi**:
   ```bash
   npm install
   ```

2. **Setup File Environment**:
   Salin `.env.example` menjadi `.env` dan sesuaikan nilainya:
   ```bash
   cp .env.example .env
   ```

3. **Jalankan Layanan Supabase Lokal**:
   Supabase CLI akan mengunduh image Docker yang diperlukan, menjalankan 15 service (database, auth, storage, studio, dll.), serta menjalankan migrasi database secara otomatis:
   ```bash
   npx supabase start
   ```

4. **Reset Database (Opsional)**:
   Jika Anda ingin mengosongkan database dan menjalankan ulang migrasi & seed dari awal:
   ```bash
   npx supabase db reset
   ```

5. **Jalankan Aplikasi Web**:
   Mulai server pengembangan Vite lokal:
   ```bash
   npm run dev
   ```
   Aplikasi secara default akan berjalan di **`http://localhost:5173`** (atau port lain yang ditunjukkan di terminal).

---

## 📡 Alamat Layanan Lokal & Kredensial

Setelah Supabase berhasil dijalankan secara lokal, Anda dapat mengakses tool bantu berikut:

| Layanan | URL | Kredensial / Catatan |
| :--- | :--- | :--- |
| **Aplikasi Web (Dev)** | `http://localhost:5173` | Server HMR Vite |
| **Supabase Studio** | `http://localhost:8000` | Akun default: `admin` / `supabase-admin` |
| **Mailpit (Email Tester)** | `http://localhost:54324` | Untuk menangkap email verifikasi autentikasi |
| **Postgres Database** | `localhost:5432` | Port langsung PostgreSQL |

---

## 🗺️ Panduan Rute Aplikasi (Routing)

Aplikasi React SPA ini menggunakan **React Router v7** untuk navigasi halaman:

### Rute Publik (Tamu Undangan)
* **`/:slug_wo/:slug`**: Menampilkan undangan pernikahan berdasarkan slug WO dan slug customer. Tema yang dirender dideteksi secara otomatis dari kolom `style` di database (misalnya `java_style` atau `image_sequence`).
* **`/:slug_wo/:slug/rsvp`**: Halaman pengisian RSVP dan Buku Tamu mandiri.

### Rute Autentikasi
* **`/login`**: Halaman login terpusat untuk staff WO.
* **`/signup`**: Halaman pendaftaran Wedding Organizer baru.
* **`/otp`**: Verifikasi One Time Password / Tautan Masuk.

### Rute Panel Admin (Pengelolaan WO)
* **`/admin`**: Mengalihkan staff WO ke dashboard utama mereka berdasarkan data sesi.
* **`/admin/:slug_wo`**: Dashboard utama WO (melihat statistik, daftar customer, ringkasan aktivitas).
* **`/admin/:slug_wo/customers/:customer_id`**: Manajemen detail satu customer (mengedit profil mempelai, acara, kisah cinta, foto galeri via drag-and-drop, dan ekspor tamu undangan).

---

## 💎 Detail Tema Undangan & Hook Animasi

Wednity memiliki dua pilihan tema default yang diatur dari database via atribut `invitation.style`:

### 1. Java Style (`java_style`)
Tema adat tradisional dengan estetika Royal Javanese Heritage yang kaya warna dan ornamen elegan.
* **Komponen**: `Cover`, `Couple`, `Event`, `Story`, `Gallery`, `Rsvp`, `Nav`, `Closing`
* **Custom Hooks & Animasi**:
  * `useCoverAnimation`: Mengontrol transisi pembukaan sampul undangan.
  * `useFlowerPetals`: Efek jasmine gugur yang berjatuhan secara acak di latar belakang.
  * `useCountdown`: Penghitung mundur hari H pernikahan.
  * `useGalleryLightbox`: Modal penampil foto galeri skala penuh.
  * `useScrollReveal`: Efek fade-up elemen menggunakan Intersection Observer.

### 2. Image Sequence (`image_sequence`)
Tema minimalis editorial modern yang didorong oleh urutan visual (scroll-driven animations).
* **Komponen**: `Cover`, `Couple`, `Event`, `Rsvp`, `Closing`, `Nav`
* **Custom Hooks & Animasi**:
  * `useScrollSequence`: Pinning frame dan penggantian sequence gambar berbasis GSAP ScrollTrigger.
  * `useCoverSequence`: Animasi transisi pembuka sampul.
  * `useEditorialNav`: Navigasi melayang dengan highlight aktif sesuai posisi scroll pembaca.

---

## ⚠️ Aturan Pengembangan & Anti-Patterns (WAJIB DIIKUTI)

Pastikan rekan pengembang Anda memahami batasan teknis berikut sebelum melanjutkan penulisan kode:

1. **Jangan Mengekspos `SUPABASE_SERVICE_ROLE_KEY`**: Key ini memiliki akses bypass RLS. Hanya gunakan key ini di dalam Supabase Edge Functions. Frontend React SPA hanya boleh menggunakan `VITE_SUPABASE_ANON_KEY`.
2. **Wajib Membersihkan GSAP Tweens**: Di React 19, pastikan semua tween, timeline, dan ScrollTrigger yang dibuat di dalam `useEffect` selalu di-kill/destroy pada fungsi pembersihan (*return cleanup function*) untuk menghindari kebocoran memori (memory leak) dan glitch visual pada re-render.
   ```typescript
   useEffect(() => {
     const ctx = gsap.context(() => {
       // Buat animasi GSAP di sini
     });
     return () => ctx.revert(); // Wajib bersihkan!
   }, []);
   ```
3. **No Direct Backend Form POST**: Semua interaksi mutasi data harus menggunakan Supabase Client SDK (`supabase.from().insert()`, dll.) atau memicu Edge Function via REST client-side. Jangan membuat route controller tradisional.
4. **Isolasi RLS**: Saat membuat migrasi database baru di `supabase/migrations/`, pastikan Anda mengaktifkan RLS (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`) dan menulis policy yang sesuai menggunakan parameter `wo_id`.
5. **Generasi Tipe Data TypeScript**: Jika ada perubahan skema database, perbarui tipe data TypeScript secara lokal menggunakan perintah generator otomatis:
   ```bash
   npx supabase gen types typescript --local > types/supabase.ts
   ```

---

## ⚡ Skrip Terminal yang Berguna

* **`npm run dev`**: Menjalankan local development server Vite.
* **`npm run build`**: Melakukan build produksi (hasil di folder `dist/`).
* **`npm run lint`**: Mengecek kualitas kode dengan ESLint.
* **`npm run format`**: Merapikan struktur kode dengan Prettier.
* **`npx supabase db push`**: Mengirim migrasi lokal ke database produksi.
* **`npx supabase functions deploy <nama-function>`**: Mendeploy Edge Function ke Supabase Cloud.
