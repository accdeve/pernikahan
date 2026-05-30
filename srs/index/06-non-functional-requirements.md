# 06 — Kebutuhan Non-Fungsional

## 6.1 Performa

| ID     | Kebutuhan                            | Target                              |
| ------ | ------------------------------------ | ----------------------------------- |
| NFR-01 | Waktu render halaman undangan publik | < 2 detik (first paint)             |
| NFR-02 | Waktu response API internal          | < 500ms untuk 95% request           |
| NFR-03 | Concurrent visitors per undangan     | Support minimal 500 concurrent tamu |
| NFR-04 | Query daftar customer WO             | < 1 detik untuk 10.000 customer     |
| NFR-05 | Upload foto photobooth               | < 5 detik untuk file 5MB            |

## 6.2 Skalabilitas

| ID     | Kebutuhan                                                                    | Target               |
| ------ | ---------------------------------------------------------------------------- | -------------------- |
| NFR-06 | Arsitektur harus mendukung penambahan tenant WO tanpa batas linear           | Horizontal scaling   |
| NFR-07 | Database harus mampu menangani 100.000+ tamu per WO                          | Index optimization   |
| NFR-08 | Sistem harus dapat diskalakan secara horizontal (menambah instance aplikasi) | Stateless app design |
| NFR-09 | Query yang melibatkan `wo_id` harus menggunakan index                        | WAJIB                |

## 6.3 Ketersediaan (Availability)

| ID     | Kebutuhan                                                                | Target                                |
| ------ | ------------------------------------------------------------------------ | ------------------------------------- |
| NFR-10 | Uptime sistem                                                            | 99.5% (kecuali maintenance terjadwal) |
| NFR-11 | Halaman undangan publik harus tetap bisa diakses meski sistem admin down | Graceful degradation                  |
| NFR-12 | Maintenance window harus di luar jam sibuk (00:00 - 06:00 WIB)           | Minimal 1x/bulan                      |

## 6.4 Keamanan

| ID     | Kebutuhan                                                         | Target                                                       |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| NFR-13 | Semua password staff di-hash (bukan plaintext)                    | bcrypt / Argon2                                              |
| NFR-14 | Semua komunikasi client-server menggunakan HTTPS                  | TLS 1.2+                                                     |
| NFR-15 | Auth menggunakan Supabase Auth JWT — access token + refresh token | Sesuai Supabase Auth                                         |
| NFR-16 | Isolasi data tenant: staff WO A tidak bisa mengakses data WO B    | WAJIB — via PostgreSQL RLS                                   |
| NFR-17 | Midtrans Server Key disimpan di Edge Function secrets             | Jangan pernah di frontend                                    |
| NFR-18 | Rate limiting pada endpoint publik (RSVP, komentar)               | Mencegah spam & abuse                                        |
| NFR-19 | Input validation pada semua form (XSS, SQL injection prevention)  | WAJIB — validasi di DB level (CHECK) + Zod di Edge Functions |

## 6.5 Reliabilitas

| ID     | Kebutuhan                                                                                    | Target                  |
| ------ | -------------------------------------------------------------------------------------------- | ----------------------- |
| NFR-20 | Semua transaksi keuangan (invoice, payment) harus ACID                                       | Transactional database  |
| NFR-21 | Jika payment gateway gagal, sistem harus menyimpan log dan memberikan feedback jelas ke user | Retry mechanism         |
| NFR-22 | Cron job / queue worker untuk invoice due date harus reliable                                | Job queue dengan retry  |
| NFR-23 | Data customer tidak boleh hilang meski undangan sudah expired                                | Data retention permanen |

## 6.6 Maintainability

| ID     | Kebutuhan                                                                                                                           | Target                  |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| NFR-24 | Semua migration SQL di-version control melalui `supabase/migrations/`                                                               | Sesuai praktik Supabase |
| NFR-25 | Edge Functions menggunakan TypeScript dengan Supabase client SDK                                                                    | Deno runtime            |
| NFR-26 | Migration database menggunakan format timestamped SQL files di `supabase/migrations/`                                               | Sesuai Supabase CLI     |
| NFR-27 | Business logic terpisah: RLS untuk auth/authorization, Edge Functions untuk logic kompleks, Database Functions untuk operasi atomik | Recommended             |

## 6.7 Usability

| ID     | Kebutuhan                                                         | Target         |
| ------ | ----------------------------------------------------------------- | -------------- |
| NFR-28 | Dashboard WO harus responsif (desktop & mobile)                   | TailwindCSS    |
| NFR-29 | Halaman undangan harus mobile-first (tamu mayoritas akses via HP) | WAJIB          |
| NFR-30 | Proses pembayaran WO maksimal 3 langkah                           | UX requirement |

## 6.8 Compliance

| ID     | Kebutuhan                                                                | Target                        |
| ------ | ------------------------------------------------------------------------ | ----------------------------- |
| NFR-31 | Data pengguna tidak boleh dijual atau digunakan di luar konteks platform | Privacy policy                |
| NFR-32 | Sistem harus menyediakan export data customer jika WO berhenti           | Data portability              |
| NFR-33 | Payment processing harus sesuai dengan regulasi yang berlaku             | PCI DSS (via payment gateway) |

## 6.9 Database Constraints

| ID     | Kebutuhan                                                                             | Detail                         |
| ------ | ------------------------------------------------------------------------------------- | ------------------------------ |
| NFR-34 | Semua `id` bertipe UUID                                                               | Konsisten dengan ERD           |
| NFR-35 | Kolom `created_at` dan `updated_at` harus auto-managed                                | Timestamp dengan default now() |
| NFR-36 | Foreign key `wo_id` harus indexed di semua tabel tenant                               | Performance                    |
| NFR-37 | Status field harus menggunakan constraint (enum atau check)                           | Data integrity                 |
| NFR-38 | `customer_template` hanya boleh memiliki 1 `active` per customer untuk tipe `wedding` | Business rule                  |
