# 02 — Gambaran Umum Sistem

## 2.1 Deskripsi Platform

Platform Undangan Digital B2B adalah sistem SaaS multi-tenant yang menghubungkan **Wedding Organization (WO)** sebagai penyedia layanan pernikahan dengan **pasangan pengantin (customer)** sebagai klien akhir. WO bertindak sebagai perantara yang mengelola pembuatan, penagihan, dan penerbitan undangan digital untuk customer mereka.

Sistem ini mengadopsi arsitektur **multi-tenant** di mana setiap WO adalah tenant terisolasi dengan data mereka sendiri, namun berbagi resource platform seperti templates dan plan pricing.

## 2.2 Model Bisnis

### 2.2.1 Wedding Invitation (Beli Putus)

- WO membeli plan (Basic/Premium) untuk customer mereka
- Pembayaran satu kali per customer
- Undangan aktif selama **13 hari** (1 minggu 6 hari)
- Setelah 13 hari: undangan tidak lagi aktif, namun data tetap tersimpan
- WO bisa mengaktifkan ulang dengan pembelian baru

### 2.2.2 Anniversary Memory Book (Subscription)

- WO mengaktifkan Anniversary Memory Book untuk customer
- Model **monthly subscription** berkelanjutan
- Customer mendapat **link permanen** (tidak kadaluarsa)
- Data wedding otomatis termuat: foto undangan, photobooth tamu, detail pasangan
- Setiap tahun customer bisa **Add Moment** — upload foto, cerita, lokasi
- WO bisa berhenti berlangganan kapan saja

### 2.2.3 Perbandingan Produk

| Aspek            | Wedding                              | Anniversary                          |
| ---------------- | ------------------------------------ | ------------------------------------ |
| Model Pembayaran | One-time (beli putus)                | Monthly subscription                 |
| Masa Aktif       | 13 hari                              | Permanen (selama subscription aktif) |
| Target           | Acara pernikahan                     | Memori pernikahan tahunan            |
| Fitur Utama      | RSVP, komentar, photobooth, check-in | Add moment, gallery tahunan          |
| Data Otomatis    | -                                    | Muat dari data wedding               |
| Penghentian      | Otomatis setelah 13 hari             | WO berhenti berlangganan             |

## 2.3 Aliran Data Utama

```
WO (Tenant) → Manage Customers → Select Plan/Template →
→ Charge Invoice → Payment → Activate Invitation →
→ Tamu RSVP/Comment/Check-in/Photobooth →
→ 13 Hari → Data Tersimpan
```

```
WO → Activate Anniversary → Link Permanen →
→ Muat Data Wedding → Customer Add Moment Tahunan →
→ Monthly Subscription (berkelanjutan)
```

## 2.4 Diagram Utama (Referensi)

Lihat `flow/diagram.mmd` untuk:

1. **Main Flow** — Wedding Invitation lifecycle (beli putus)
2. **Anniversary Flow** — Memory Book monthly subscription
3. **Entity Relationship Diagram** — Semua entitas dan relasi
4. **Invoice State Machine** — State transisi invoice
5. **Multi-Tenant Architecture** — Isolasi tenant WO

## 2.5 Asumsi Dasar

- Setiap WO memiliki minimal 1 staff dengan role Admin
- Customer adalah pasangan (male + female name)
- Satu customer hanya memiliki 1 undangan aktif dalam satu waktu
- Template bersifat global (dibuat oleh platform, digunakan oleh semua WO)
- Plan pricing ditentukan oleh platform (tidak oleh WO)
- Payment gateway mendukung multiple metode: kartu, transfer, Gopay, OVO
