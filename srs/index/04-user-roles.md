# 04 — Aktor & Peran Pengguna

## 4.1 Daftar Aktor

| Aktor            | Definisi                                                                    | Contoh                  |
| ---------------- | --------------------------------------------------------------------------- | ----------------------- |
| **WO Admin**     | Staff WO dengan akses penuh                                                 | Pemilik / manager WO    |
| **WO Editor**    | Staff WO dengan akses terbatas (edit data, tidak bisa hapus/kelola billing) | Karyawan WO             |
| **WO Viewer**    | Staff WO dengan akses read-only                                             | Owner / stakeholder     |
| **Customer**     | Pasangan pengantin / klien WO                                               | Pengantin pria & wanita |
| **Tamu (Guest)** | Orang yang diundang ke acara pernikahan                                     | Keluarga, teman         |
| **System**       | Backend sistem (cron job, queue worker)                                     | Background processor    |

## 4.2 Role WO Staff

Berdasarkan entitas `wo_staff` dengan field `role`:

| Role       | Nilai `role` | Izin                                                                                                      |
| ---------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| **Admin**  | `admin`      | Full akses: CRUD semua data WO, billing, staff management, semua fitur                                    |
| **Editor** | `editor`     | CRUD customer, template assignment, guest management. **Tidak bisa**: kelola staff, billing, hapus data   |
| **Viewer** | `viewer`     | Read-only: lihat dashboard, lihat data customer, lihat report. **Tidak bisa**: membuat/mengedit/menghapus |

### 4.2.1 Matrix Akses Role WO Staff

| Fitur                      | Admin | Editor | Viewer |
| -------------------------- | ----- | ------ | ------ |
| Kelola Staff (CRUD)        | ✅    | ❌     | ❌     |
| Buat/Edit Customer         | ✅    | ✅     | ❌     |
| Assign Template            | ✅    | ✅     | ❌     |
| Konfigurasi Undangan       | ✅    | ✅     | ❌     |
| Lihat Invoice              | ✅    | ✅     | ✅     |
| Bayar Invoice              | ✅    | ❌     | ❌     |
| Lihat Tamu & RSVP          | ✅    | ✅     | ✅     |
| Kelola Template (WO-level) | ✅    | ✅     | ❌     |
| Aktivasi Anniversary       | ✅    | ✅     | ❌     |
| Hapus Data                 | ✅    | ❌     | ❌     |

## 4.3 Customer (Pasangan)

Berdasarkan entitas `customers`:

- Customer memiliki `male_name` dan `female_name` (pasangan)
- Customer diikat ke satu WO (`wo_id`)
- Customer dapat memiliki banyak `customer_template` (untuk berbagai keperluan: wedding, anniversary)
- Customer tidak login ke sistem — semua diurus oleh WO
- Customer menerima link undangan untuk dibagikan ke tamu

**Data Customer:**

- `email` — kontak customer
- `male_name` — nama pria
- `female_name` — nama wanita
- Metadata tambahan di `cust_metadata`: tanggal acara, lokasi, love story, bank account, dll.

## 4.4 Tamu (Guest)

Berdasarkan entitas `guests`:

- Tamu adalah individu yang diundang oleh customer melalui undangan digital
- Tamu bisa melakukan:
  - **RSVP** — konfirmasi kehadiran (`rsvp_status`: boolean)
  - **Menulis komentar** (`cust_comment`)
  - **Check-in / Attendance** saat hari H
  - **Photobooth** — upload foto
- Tamu tidak memiliki akun — akses via link undangan
- Setiap tamu memiliki `guest_count` (jumlah orang yang ikut)

## 4.5 System

Aktor non-manusia yang menjalankan proses otomatis:

| Proses                 | Trigger      | Deskripsi                                                       |
| ---------------------- | ------------ | --------------------------------------------------------------- |
| Invoice Due Date Check | Cron harian  | Ubah status invoice `pending` → `overdue` jika lewat `due_date` |
| Invitation Expiry      | Cron harian  | Nonaktifkan undangan setelah 13 hari masa aktif                 |
| Subscription Charge    | Cron bulanan | Generate invoice untuk anniversary subscription                 |
| Payment Confirmation   | Webhook      | Update status invoice setelah menerima callback payment gateway |
| Invoice Cancellation   | Cron         | Batalkan invoice pending yang sudah sangat overdue              |

## 4.6 Hierarki Organisasi

```
Platform (Sistem)
└── Wedding Organization (Tenant)
    ├── WO Admin
    ├── WO Editor
    ├── WO Viewer
    └── Customers (Pasangan)
         └── Tamu (Guest)
              ├── RSVP
              ├── Komentar
              ├── Check-in
              └── Photobooth
```
