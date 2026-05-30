# 08 — Alur Proses Bisnis

## 8.1 Wedding Invitation Flow (Beli Putus)

Referensi diagram: `flow/diagram.mmd` — Main Flow (baris 12-68)

### 8.1.1 Fase 1: Onboarding WO

```
[A1] WO Daftar
  → Input: name, email, location
  → Output: wedding_organization record created
  → Akses: Platform Admin (belum ada staff)

[A2] Buat Staff Admin
  → Input: name, email, password
  → Output: wo_staff record dengan role='admin'
  → Akses: Staff pertama dengan role Admin
```

**Technical notes:**

- Saat WO daftar, sistem langsung membuat 1 staff dengan role Admin
- Staff ini yang akan login dan mengelola WO

### 8.1.2 Fase 2: Charge & Pembayaran

```
[B1] WO buat data customer (pasangan pengantin)
  → Input: email, male_name, female_name
  → Output: customers record created
  → Sistem: mengikat customer ke WO (wo_id)

[B2] WO di-charge → INSERT invoice (pending)
  → Trigger: WO memilih untuk mengaktifkan undangan customer
  → Output: invoice record dengan status='pending'
  → Sistem: menghitung total berdasarkan plan yang dipilih

[B3] WO bayar
  → WO memilih payment method
  → Sistem: initiate payment via payment gateway
  → Status payment: 'pending' → 'success'

[B4] Invoice lunas
  → Trigger: payment status berubah menjadi 'success'
  → Output: invoice.status = 'paid', invoice.paid_at = now()
```

**Technical notes:**

- Jika WO belum bayar, mereka kembali ke [B2] jika mencoba lanjut
- Payment gateway menangani proses pembayaran yang sebenarnya
- Webhook dari payment gateway mengupdate status payment dan invoice

### 8.1.3 Fase 3: Pilih Plan & Template

```
[C1] WO pilih Plan (Basic/Premium)
  → Input: plan_id
  → Sistem: cek apakah plan sudah dibayar via wo_plan

[C2] Cek: plan sudah dibayar?
  → Ya (sudah ada wo_plan active) → lanjut ke [C3]
  → Tidak → kembali ke [B2] (charge WO)

[C3] WO pilih Template
  → Sistem: menampilkan template yang termasuk dalam plan (via plan_template)
  → Input: template_id

[C4] Set tanggal aktif (1 minggu 6 hari = 13 hari)
  → Input: start_date (kapan undangan mulai aktif)
  → Sistem: hitung end_date = start_date + 13 hari

[C5] INSERT customer_template + cust_metadata
  → Output: customer_template record (active=true)
  → Output: cust_metadata record (dengan detail undangan)
```

**Technical notes:**

- `wo_plan` harus status `active` sebelum WO bisa memilih template
- Template yang tampil adalah yang terhubung ke plan via `plan_template`
- `customer_template.active=true` berarti undangan live
- `customer_template.type = 'wedding'`

### 8.1.4 Fase 4: Undangan Live (13 Hari)

```
[D1] Undangan aktif
  → customer_template.active = true
  → Link unik undangan bisa diakses publik
  → Masa aktif: 13 hari dari start_date

[D2] Tamu RSVP
  → Tamu buka link undangan
  → Isi: nama, status hadir, jumlah tamu, alasan
  → Output: guests record
  → Tamu bisa update RSVP (ubah status)

[D3] Tamu komen
  → Tamu tulis komentar di halaman undangan
  → Output: cust_comment record

[D4] Hari H: check-in
  → Tamu yang sudah RSVP melakukan check-in
  → Output: attendance record

[D5] Photobooth tamu
  → Tamu upload foto via fitur photobooth
  → Output: photobooth record
```

**Technical notes:**

- Semua interaksi tamu (RSVP, comment, check-in, photobooth) direkam dengan `wo_id` dan `customer_id`
- Tamu tidak perlu login — identifikasi via session atau guest identifier
- Guest `rsvp_status` bisa diupdate (perubahan konfirmasi)

### 8.1.5 Fase 5: Setelah 13 Hari

```
[E1] Masa aktif habis
  → Trigger: end_date tercapai
  → Sistem: customer_template.active = false
  → Halaman undangan tidak lagi bisa diakses publik

[E2] Data tetap tersimpan
  → Semua data customer, tamu, komentar, dll tetap ada di database
  → WO bisa melihat data (read-only) di dashboard
  → WO bisa mengaktifkan ulang dengan pembelian baru
```

**Technical notes:**

- Data tidak dihapus — hanya undangan yang dinonaktifkan
- Cron job atau queue worker bertanggung jawab untuk menonaktifkan undangan yang expired
- Re-activation membuat `customer_template` baru

## 8.2 Anniversary Memory Book Flow (Monthly Subscription)

Referensi diagram: `flow/diagram.mmd` — Anniversary Flow (baris 72-103)

### 8.2.1 Fase 1: Aktivasi Awal

```
[A1] WO aktivasi Anniversary Memory Book untuk customer
  → Input: customer_id, template_id (type='anniversary')
  → Output: customer_template record (type='anniversary', active=true)
  → Sistem: membuat cust_metadata dengan type='anniversary'

[A2] Dapat link permanen
  → Sistem: generate link unik yang tidak pernah kadaluarsa
  → Link bisa diakses selama subscription aktif

[A3] Data wedding otomatis termuat
  → Sistem: mengambil data dari wedding customer_template sebelumnya
  → Data yang termuat:
    - Foto undangan dari gallery
    - Foto photobooth tamu
    - Detail pasangan (nama, tanggal nikah)
    - Love story
```

### 8.2.2 Fase 2: Setiap Tahun — Add Moment

```
[B1] Pasangan buka link
  → Akses via link permanen
  → Melihat semua momen yang sudah ada

[B2] Klik Add Moment
  → Trigger: customer ingin menambahkan momen baru

[B3] Upload foto momen anniversary
  → Input: foto (image upload)

[B4] Isi detail momen
  → Input: tanggal, cerita, lokasi
  → Data disimpan di cust_metadata.love_story (JSONB) atau record anniversary terpisah

[B5] Momen tersimpan
  → Output: data momen baru tersimpan
  → Loop: setiap tahun [B1] → [B5]
```

### 8.2.3 Fase 3: Billing Subscription

```
[C1] Monthly subscription berkelanjutan
  → Sistem: generate invoice setiap bulan
  → Status invoice: 'pending'
  → WO harus membayar setiap bulan

[C2] WO bisa berhenti kapan
  → WO cancel subscription
  → Status: tidak ada invoice baru
  → Link permanen tidak lagi aktif
```

**Technical notes:**

- Subscription billing menggunakan cron job bulanan
- Saat WO berhenti berlangganan, data tetap tersimpan
- Re-activation bisa dilakukan kapan saja

## 8.3 Perbandingan Alur Wedding vs Anniversary

| Aspek                  | Wedding                           | Anniversary             |
| ---------------------- | --------------------------------- | ----------------------- |
| **Trigger Aktivasi**   | WO buat customer + bayar          | WO aktivasi             |
| **Masa Aktif**         | 13 hari                           | Permanen (selama bayar) |
| **Link**               | Temporal                          | Permanen                |
| **Data Awal**          | Dari input WO                     | Dari data wedding       |
| **Interaksi Tamu**     | RSVP, komen, photobooth, check-in | (tidak ada)             |
| **Interaksi Customer** | (tidak ada)                       | Add moment tiap tahun   |
| **Billing**            | One-time                          | Monthly subscription    |
| **Penghentian**        | Otomatis 13 hari                  | Manual oleh WO          |
