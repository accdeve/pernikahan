# 💬 Flow RSVP & Buku Ucapan (Guestbook)

![RSVP & Guestbook Flow Diagram](./5_rsvp_guestbook.svg)

Dokumen ini menjelaskan bagaimana interaksi tamu undangan mengirimkan RSVP dan ucapan restu yang akan langsung masuk ke database dan dapat dimoderasi oleh admin.

## 📊 Diagram Alur RSVP & Ucapan

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Tamu Undangan
    participant UI as RsvpForm / Guestbook (SPA)
    participant DB as Supabase Database (Tabel 'guests')
    participant Admin as Admin Panel (Dashboard WO)

    Guest->>UI: Buka form RSVP di bagian bawah Undangan
    Guest->>UI: Isi Nama, Jumlah Tamu, Konfirmasi Kehadiran, & Pesan Restu
    Guest->>UI: Klik tombol "Kirim RSVP"
    
    UI->>DB: INSERT INTO guests (customer_id, name, status, message, guest_count)
    
    alt Simpan Data Berhasil (RLS Allowed)
        DB-->>UI: Return HTTP 201 Created & Data Baru
        UI->>UI: Tampilkan notifikasi "Pesan Terkirim!"
        UI->>UI: Masukkan ucapan baru ke dalam daftar ucapan (Guestbook) tanpa reload
    else Simpan Data Gagal (RLS Denied / Validasi Error)
        DB-->>UI: Return HTTP Error / Constraint Violation
        UI->>UI: Tampilkan notifikasi error ke tamu
    end

    Note over Admin: Admin memantau halaman Moderasi Tamu
    DB->>Admin: Tampilkan daftar RSVP secara real-time / refresh data
    Admin->>DB: Klik "Hapus Ucapan" (jika terdapat spam / pesan kurang pantas)
```

## 📝 Penjelasan Detail Langkah:

1. **Input RSVP**: Tamu mengisi data konfirmasi kehadiran di komponen `RsvpForm` yang disematkan di halaman undangan pernikahan.
2. **Mutasi Database Langsung**:
   * Sisi klien melakukan query insert langsung ke tabel `guests` menggunakan Supabase Client SDK.
   * Supabase mengevaluasi kebijakan RLS untuk tabel `guests`. Kebijakan ini mengizinkan operasi *insert* secara anonim (publik) asalkan data berelasi dengan ID customer yang valid.
3. **Pembaruan Antarmuka Tanpa Memuat Ulang (Reactive Update)**:
   * Setelah data sukses tersimpan di database, list ucapan di komponen `Guestbook` diperbarui secara reaktif menggunakan local React state, menampilkan ucapan terbaru di bagian atas daftar.
4. **Moderasi oleh Admin**:
   * Administrator/Wedding Organizer memiliki akses penuh di dashboard admin untuk melihat rangkuman tamu yang hadir, jumlah orang yang akan datang (untuk estimasi katering), dan menghapus pesan ucapan jika dianggap mengandung spam.
