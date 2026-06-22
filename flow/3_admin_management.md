# ⚙️ Flow Panel Admin & Manajemen Klien (CRUD)

![Admin Management Flow Diagram](./3_admin_management.svg)

Dokumen ini menjelaskan alur kerja pengelolaan data pengantin (customer), kisah cinta (stories), serta pengelolaan media (gallery) menggunakan drag-and-drop.

## 📊 Diagram Alur Manajemen Admin

```mermaid
flowchart TD
    subgraph Dashboard Utama
        A[Staff masuk ke Dashboard] --> B[Tampilkan Ringkasan & Grafik Klien]
        B --> C[Tambah Customer Baru]
        B --> D[Pilih / Kelola Customer Eksisting]
    end

    subgraph Detail Customer
        D --> E[Buka Detail Customer]
        E --> F[Kelola Informasi Mempelai & Acara]
        E --> G[Kelola Kisah Cinta / Stories]
        E --> H[Kelola Galeri Foto / Gallery]
        E --> I[Kelola Tamu & Buku Ucapan]
    end

    subgraph Upload & Susun Galeri
        H --> H1[Seret & Letakkan / Drag & Drop Gambar]
        H1 --> H2[Client-Side WebP Converter & Compression]
        H2 --> H3[Upload Direct-to-Supabase Storage]
        H3 --> H4[Simpan Media URL ke Tabel 'galleries']
        H4 --> H5[Reorder Urutan Gambar dengan @dnd-kit]
        H5 --> H6[Update Urutan 'order_index' ke PostgreSQL]
    end
```

## 📝 Penjelasan Detail Langkah:

1. **Tambah Customer**: Staff WO membuat data klien pernikahan baru. Data ini otomatis tersimpan ke tabel `customers` dan berelasi dengan `wo_id` milik staff yang sedang aktif (dijamin oleh RLS).
2. **Manajemen Acara & Akad/Resepsi**: Form ini memperbarui informasi tanggal, waktu, lokasi peta (*embed map*), dan detail kontak pasangan mempelai.
3. **Pengunggahan Foto Galeri**:
   * Sistem menghindari pengunggahan gambar mentah berukuran besar.
   * Gambar dikonversi ke format **WebP** di sisi klien untuk meminimalkan ukuran file tanpa menurunkan kualitas visual secara drastis.
   * File diunggah langsung ke bucket Supabase Storage, lalu URL publiknya disimpan di tabel `galleries`.
4. **Pengurutan Menggunakan Drag & Drop**:
   * Pengurutan kisah cinta (`stories`) dan foto galeri (`galleries`) menggunakan `@dnd-kit/sortable` untuk pengalaman visual yang interaktif.
   * Posisi urutan baru diperbarui langsung di database dengan mengubah kolom integer `order_index`.
