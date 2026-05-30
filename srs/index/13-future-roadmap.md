# 13 — Roadmap & Pertimbangan Masa Depan

## 13.1 Iterasi MVP (Prioritas Tinggi)

Fitur yang harus ada di rilis pertama:

| Modul                         | Estimasi Effort | Dependencies       |
| ----------------------------- | --------------- | ------------------ |
| WO Onboarding & Staff Auth    | 5-7 hari        | —                  |
| Customer CRUD                 | 2-3 hari        | WO module          |
| Template CRUD (Admin)         | 3-5 hari        | —                  |
| Plan & Subscription           | 5-7 hari        | WO, Template       |
| Invoice & Payment (1 gateway) | 7-10 hari       | Plan, Template     |
| Invitation Public Page        | 5-7 hari        | Template, Customer |
| Guest RSVP                    | 3-5 hari        | Invitation         |
| Dashboard WO (read-only)      | 3-5 hari        | Semua module       |

**Total estimasi MVP:** 33-49 hari (1.5 - 2.5 bulan)

## 13.2 Iterasi 2 (Prioritas Sedang)

| Modul                       | Estimasi Effort | Notes                         |
| --------------------------- | --------------- | ----------------------------- |
| Guest Comments              | 2-3 hari        | Sederhana, CRUD dasar         |
| Check-in / Attendance       | 2-3 hari        | QR code generation            |
| Guest Export (CSV)          | 1-2 hari        | Download report               |
| Multiple Payment Gateways   | 3-5 hari        | Abstraction layer sudah siap  |
| Invoice History & Filtering | 2-3 hari        | Search, filter by status      |
| Editor & Viewer Roles       | 2-3 hari        | Middleware + permission check |
| Password Reset              | 2-3 hari        | Email-based                   |

**Total estimasi Iterasi 2:** 14-22 hari

## 13.3 Iterasi 3 (Anniversary Phase)

| Modul                        | Estimasi Effort | Notes                        |
| ---------------------------- | --------------- | ---------------------------- |
| Anniversary Activation       | 3-5 hari        | Copy data wedding            |
| Memory Book Page             | 5-7 hari        | Gallery view, timeline       |
| Add Moment Feature           | 3-5 hari        | Upload + JSONB append        |
| Monthly Subscription Billing | 5-7 hari        | Cron job, invoice generation |
| Link Permanen                | 2-3 hari        | Slug yang tidak expires      |

**Total estimasi Iterasi 3:** 18-27 hari

## 13.4 Iterasi 4+ (Enhancement & Skalabilitas)

### 13.4.1 Fitur Enhancement

| Fitur                        | Prioritas | Deskripsi Teknis                                    |
| ---------------------------- | --------- | --------------------------------------------------- |
| **Photobooth (upload foto)** | LOW       | Upload via public endpoint, integrasi kamera device |
| **Multi-language**           | LOW       | i18n untuk template undangan (Indonesia, English)   |
| **Custom Domain**            | LOW       | WO bisa pakai domain sendiri untuk undangan         |
| **Email Notification**       | MEDIUM    | Kirim link undangan ke customer + tamu via email    |
| **WhatsApp Integration**     | LOW       | Kirim reminder RSVP via WhatsApp                    |
| **Analytics Dashboard**      | MEDIUM    | Statistik tamu, RSVP rate, popular template         |
| **Bulk Import Customer**     | LOW       | Import dari CSV/Excel                               |
| **Custom Template Builder**  | LOW       | WO bisa custom template via drag-drop               |

### 13.4.2 Skalabilitas Teknis

| Inisiatif                 | Deskripsi                                                     |
| ------------------------- | ------------------------------------------------------------- |
| **Redis Caching**         | Cache halaman undangan publik untuk mengurangi beban database |
| **CDN for Static Assets** | Template assets, photobooth images via CDN                    |
| **Read Replica Database** | Pisahkan read/write untuk skalabilitas                        |
| **Queue Worker Scaling**  | Pisahkan job processing ke worker terpisah                    |
| **Database Sharding**     | Jika tenant > 1000, pertimbangkan shard per region            |
| **API Rate Limiting**     | Redis-based rate limiting untuk endpoint publik               |
| **Auto-scaling**          | Kubernetes / Docker Swarm untuk horizontal scaling            |

### 13.4.3 Fitur Monetisasi Tambahan

| Fitur                 | Model                    | Deskripsi                                       |
| --------------------- | ------------------------ | ----------------------------------------------- |
| **Premium Templates** | Included in premium plan | Template eksklusif dengan animasi GSAP          |
| **Additional Days**   | Add-on purchase          | Perpanjangan masa aktif undangan > 13 hari      |
| **White Label**       | Enterprise plan          | WO bisa branded sebagai platform mereka sendiri |
| **SMS Gateway**       | Add-on                   | Kirim undangan via SMS                          |
| **Music Player**      | Premium feature          | Background music di halaman undangan            |
| **Live Streaming**    | Premium feature          | Integrasi YouTube Live / Zoom                   |

## 13.5 Arsitektur Jangka Panjang

```
                    ┌─────────────┐
                    │   CDN/CDN   │
                    └──────┬──────┘
                           │
┌──────────┐    ┌──────────┴──────────┐    ┌──────────┐
│  Client  │───>│   Load Balancer     │<───│  Admin   │
│  (Tamu)  │    └──────────┬──────────┘    │  (WO)    │
└──────────┘               │               └──────────┘
                    ┌──────┴──────┐
                    │  App Server │ (auto-scaled)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────┴───┐  ┌────┴───┐  ┌────┴───┐
         │  Main  │  │  Read  │  │  Redis │
         │  DB    │  │Replica │  │ (Cache)│
         └────────┘  └────────┘  └────────┘

         ┌─────────────────────────────────┐
         │         Queue Worker            │
         │  (Invoice, Expiry, Subscription)│
         └─────────────────────────────────┘

         ┌─────────────────────────────────┐
         │      File Storage (S3)          │
         │  (Photobooth, Gallery, Assets)  │
         └─────────────────────────────────┘
```

## 13.6 Technical Debt Tracking

| Item                                           | Priority | Notes                                               |
| ---------------------------------------------- | -------- | --------------------------------------------------- |
| Add proper TypeScript types untuk JSONB fields | MEDIUM   | Saat ini JSONB di-typ sebagai `Record<string, any>` |
| Migration script dari SQLite ke PostgreSQL     | LOW      | Untuk production deployment                         |
| Unit test coverage untuk critical flows        | HIGH     | Payment, invoice state machine, tenant isolation    |
| Error handling standardization                 | MEDIUM   | Format error response konsisten                     |
| API documentation (OpenAPI/Swagger)            | MEDIUM   | Untuk integrasi third-party nanti                   |
| Audit logging                                  | MEDIUM   | Track siapa melakukan apa di sistem                 |
| Database index optimization                    | HIGH     | Index untuk `wo_id`, `status`, `due_date`           |

## 13.7 Catatan Teknis

### 13.7.1 JSONB Fields

Dua field JSONB di sistem ini memerlukan perhatian khusus:

1. **`templates.config`** — Konfigurasi template yang sangat fleksibel. Perlu schema versioning.
2. **`cust_metadata.love_story`** — Array of moments. Perlu validasi struktur data.
3. **`cust_metadata.bank_account`** — Array of bank accounts. Perlu validasi.

**Rekomendasi:** Buat TypeScript interface/type untuk setiap struktur JSONB, dan validasi menggunakan Zod di Edge Functions serta CHECK constraint di PostgreSQL.

### 13.7.2 Integer vs UUID

`gallery.id` menggunakan integer, berbeda dengan entitas lain yang UUID. Hal ini perlu diperhatikan saat JOIN dengan `cust_metadata.image_id` (yang juga integer).

### 13.7.3 Cron Job Reliability

Gunakan job queue (Bull/BullMQ) daripada cron job tradisional untuk:

- Retry mechanism jika job gagal
- Job monitoring dan alerting
- Parallel job processing
- Delayed jobs (misal: kirim reminder RSVP H-3)

### 13.7.4 Data Migration Strategy

Saat migrasi dari development ke production:

1. Seeder untuk template default dan plan pricing
2. Migration untuk indeks database
3. Script untuk generate admin credentials
4. Konfigurasi environment variables (.env.production)
