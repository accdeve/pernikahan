# 🚀 Flow Onboarding & Pendaftaran (Signup)

![Onboarding Flow Diagram](./1_onboarding_signup.svg)

Dokumen ini menjelaskan alur kerja pendaftaran Wedding Organizer (WO) baru hingga pengguna berhasil masuk ke dalam sistem.

## 📊 Diagram Alur Pendaftaran

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna / WO Baru
    participant UI as SignupForm (React)
    participant EF as Edge Function (wo-signup)
    participant Auth as Supabase Auth (GoTrue)
    participant DB as PostgreSQL Database
    participant Mail as Mailpit / SMTP Server

    User->>UI: Isi Informasi WO (Nama & Domisili) & Akun Staff (Email, Password)
    UI->>EF: HTTP POST /functions/v1/wo-signup (Payload pendaftaran)
    
    note over EF: Validasi email & data input
    EF->>Auth: Buat Akun User Baru via Service Role Client
    Auth-->>EF: Return User ID & Status
    
    EF->>DB: Insert data WO baru (Tabel 'wedding_organizers')
    EF->>DB: Insert data Staff WO (Tabel 'wo_staff' dengan role 'admin')
    
    EF->>Auth: Kirim email konfirmasi / OTP
    Auth->>Mail: Kirim Email Verifikasi
    
    EF-->>UI: Return HTTP 200 OK (Sukses terdaftar)
    
    UI->>UI: Simpan data pendaftaran di sessionStorage
    UI->>User: Dialihkan ke halaman Verifikasi OTP (/otp)
    
    User->>UI: Input kode OTP dari email
    UI->>Auth: Verifikasi OTP via Supabase SDK
    Auth-->>UI: Return Sesi Aktif (Access Token & Refresh Token)
    
    UI->>UI: Redirect ke Dashboard Admin (/admin/:slug_wo)
```

## 📝 Penjelasan Detail Langkah:

1. **Input Data**: Pengguna mengisi formulir pendaftaran 2-langkah di halaman `/signup`:
   * **Langkah 1**: Nama Wedding Organizer dan Domisili.
   * **Langkah 2**: Nama lengkap Staff Utama, Email, dan Kata Sandi.
2. **Pengiriman Data**: Form mengirim request ke Edge Function `wo-signup` di Supabase untuk menjaga kerahasiaan `service_role_key` selama proses penulisan terstruktur ke database.
3. **Pembuatan User Auth**: Edge Function mendaftarkan user baru di sistem autentikasi Supabase.
4. **Pembuatan Entitas WO**: System memasukkan entri organisasi baru ke tabel `wedding_organizers` untuk mendapatkan `wo_id`.
5. **Pembuatan Akun Staff**: Menghubungkan ID user auth dengan `wo_id` baru di tabel `wo_staff` dengan jabatan `admin`.
6. **Kirim Email Konfirmasi**: Supabase Auth mengirimkan token verifikasi (OTP) ke alamat email pendaftar.
7. **Verifikasi OTP**: Pengguna memasukkan OTP di halaman `/otp`. Setelah divalidasi oleh Supabase, token sesi dibuat dan pengguna dialihkan ke halaman dashboard admin.
