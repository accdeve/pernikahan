# 🔐 Flow Autentikasi & Proteksi Rute (Session Management)

![Auth & Session Flow Diagram](./2_auth_session.svg)

Dokumen ini menjelaskan bagaimana status autentikasi dipertahankan dan bagaimana sistem memproteksi halaman admin menggunakan session state.

## 📊 Diagram Alur Autentikasi

```mermaid
flowchart TD
    A[Pengguna Akses Rute Halaman] --> B{Apakah Rute Publik?}
    
    B -- Ya (contoh: /:slug_wo/:slug) --> C[Render Undangan / RsvpPage]
    B -- Tidak (akses rute /admin/*) --> D[Periksa AuthContext]
    
    D --> E{Apakah Sesi Supabase Aktif?}
    
    E -- Tidak --> F[Simpan target rute & Redirect ke /login]
    E -- Ya --> G{Apakah URL memiliki slug_wo?}
    
    G -- Ya --> H{Apakah slug_wo cocok dengan Sesi User?}
    G -- Tidak --> I[Ambil wo_slug dari metadata user & Redirect ke /admin/:wo_slug]
    
    H -- Ya --> J[Render Halaman Panel Admin / Dashboard]
    H -- Tidak --> K[Tampilkan Error: Akses Ditolak / 403]

    F --> L[Pengguna Login di /login]
    L --> M[Kirim email + password ke Supabase Auth]
    M --> N{Login Sukses?}
    N -- Ya --> I
    N -- Tidak --> O[Tampilkan Error Login]
```

## 📝 Penjelasan Detail Langkah:

1. **Auth Context Provider (`AuthContext.tsx`)**:
   * Melakukan inisialisasi awal dengan memanggil `supabase.auth.getSession()`.
   * Mendengarkan perubahan sesi secara real-time via `supabase.auth.onAuthStateChange()`.
   * Menyediakan state `user`, `session`, `loading`, dan `signOut` ke seluruh komponen anak.
2. **Proteksi Halaman (`AdminLayout.tsx` & `DashboardPage.tsx`)**:
   * Menggunakan status dari `AuthContext` untuk memverifikasi apakah token JWT aktif.
   * Jika tidak ada sesi, pengguna otomatis dikembalikan ke halaman `/login`.
3. **Mekanisme Tenant Binding**:
   * Setiap akun staff terikat pada satu Wedding Organizer tertentu (`wo_id`).
   * Detail `wo_slug` disimpan dalam metadata pengguna Supabase Auth, sehingga memudahkan pengalihan rute dinamis dari `/admin` ke `/admin/:slug_wo`.
