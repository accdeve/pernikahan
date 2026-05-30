# 09 — State Machine & Siklus Invoice

## 9.1 State Diagram Invoice

Referensi diagram: `flow/diagram.mmd` — Invoice State Machine (baris 138-157)

```
                  ┌──────────┐
                  │  [*]      │
                  └────┬─────┘
                       │ WO di-charge
                       ▼
                  ┌──────────┐
                  │  PENDING  │
                  └──┬───┬───┘
                     │   │
          ┌──────────┘   └──────────┐
          │ WO bayar                │ Lewat due_date
          ▼                         ▼
     ┌────────┐              ┌──────────┐
     │  PAID  │              │ OVERDUE   │
     └──┬─────┘              └──────────┘
        │ WO minta refund           │
        ▼                           │
   ┌──────────┐                     │
   │ REFUNDED │                     │
   └──────────┘                     │
                                    │ WO batalkan
                                    ▼
                              ┌──────────┐
                              │ CANCELLED│
                              └──────────┘
```

## 9.2 State Definitions

| State       | Definisi                                      | Actions yang Mungkin                                                     |
| ----------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| `[*]`       | Initial state — invoice belum dibuat          | None                                                                     |
| `pending`   | Invoice sudah dibuat, menunggu pembayaran     | WO bayar → `paid`; Lewat due date → `overdue`; WO batalkan → `cancelled` |
| `paid`      | Invoice sudah dibayar lunas                   | WO minta refund → `refunded`                                             |
| `overdue`   | Invoice melewati due_date tanpa pembayaran    | Tidak bisa lanjut pembayaran; WO harus buat invoice baru                 |
| `cancelled` | Invoice dibatalkan oleh WO                    | None (terminal state)                                                    |
| `refunded`  | Invoice yang sudah dibayar kemudian di-refund | Data template dinonaktifkan; tidak bisa diaktifkan kembali               |

## 9.3 Transisi State

| From      | To          | Trigger                          | Condition                                 | Actor             |
| --------- | ----------- | -------------------------------- | ----------------------------------------- | ----------------- |
| `[*]`     | `pending`   | WO di-charge untuk customer baru | WO create customer + pilih plan           | System            |
| `pending` | `paid`      | Pembayaran berhasil              | Payment gateway callback success          | System (webhook)  |
| `pending` | `overdue`   | Lewat due_date                   | Cron job: current_date > invoice.due_date | System (cron)     |
| `pending` | `cancelled` | WO batalkan invoice              | WO meminta pembatalan sebelum bayar       | WO Admin          |
| `paid`    | `refunded`  | WO minta refund                  | Validasi: refund masih dalam periode      | WO Admin + System |

## 9.4 Sub-State Details

### 9.4.1 State `paid` — Template Aktif

```
state paid {
  [*] → template_aktif
}
```

- Setelah `paid`, `customer_template.active` di-set ke `true`
- Template undangan live dan bisa diakses publik
- Masa aktif dimulai

### 9.4.2 State `refunded` — Template Dinonaktifkan

```
state refunded {
  [*] → template_dinonaktifkan
}
```

- `customer_template.active` di-set ke `false`
- Template undangan tidak bisa diakses
- Ini adalah terminal state

### 9.4.3 State `overdue` — Tidak Bisa Lanjut Pembayaran

```
state overdue {
  [*] → tidak_bisa_lanjut_pembayaran
}
```

- WO tidak bisa membayar invoice yang sudah overdue
- WO harus membuat invoice baru
- Ini adalah terminal state

## 9.5 Invoice Number Format

```
INV/{YEAR}/{MONTH}/WO-{SHORT_ID}/{SEQUENCE}
```

Contoh: `INV/2026/05/WO-A3F2/001`

## 9.6 Timing & Scheduler

| Event                | Timing                   | Action                                                            |
| -------------------- | ------------------------ | ----------------------------------------------------------------- |
| Due date check       | Cron harian (00:00)      | Cek semua invoice `pending` dengan `due_date < now()` → `overdue` |
| Payment timeout      | Real-time (webhook)      | Payment gateway callback → update status                          |
| Subscription billing | Cron bulanan (tanggal 1) | Generate invoice untuk WO dengan anniversary subscription aktif   |
| Invoice cancellation | Cron harian              | Batalkan invoice `pending` yang sudah >30 hari overdue            |
| Invitation expiry    | Cron harian              | Nonaktifkan undangan wedding yang sudah >13 hari                  |

## 9.7 Validation Rules

| Rule                        | Deskripsi                                 | Error Handling                                  |
| --------------------------- | ----------------------------------------- | ----------------------------------------------- |
| Invoice total > 0           | Jumlah tagihan harus lebih dari 0         | Reject creation                                 |
| Due date > created_at       | Due date harus setelah tanggal dibuat     | Reject creation                                 |
| Only `pending` can be paid  | Status harus `pending` untuk bisa dibayar | Return error "Invoice sudah dibayar/dibatalkan" |
| Only `paid` can be refunded | Hanya invoice `paid` yang bisa di-refund  | Return error "Invoice belum dibayar"            |
| Refund period               | Refund hanya dalam 30 hari setelah paid   | Return error "Periode refund sudah habis"       |
| Unique invoice number       | Setiap invoice harus punya nomor unik     | Auto-generate dengan sequence                   |
