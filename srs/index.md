# Software Requirements Specification (SRS)

## Platform Undangan Digital B2B — Wedding & Anniversary

|                      |                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Dokumen**          | Software Requirements Specification                                                   |
| **Proyek**           | Platform Undangan Digital B2B                                                         |
| **Versi**            | 2.0                                                                                   |
| **Tanggal**          | 2026-05-25                                                                            |
| **Basis Data**       | `database/erd.md` — Entity Relationship Diagram                                       |
| **Basis Alur**       | `flow/diagram.mmd` — Business Process Flows, State Machine, Multi-Tenant Architecture |
| **Backend Platform** | **Supabase** (PostgreSQL, Auth, Storage, Edge Functions, Realtime, RLS)               |
| **Payment Gateway**  | **Midtrans**                                                                          |

---

## Daftar Isi

| #   | Bagian                                | File                                                                                     | Deskripsi                                                                  |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 01  | **Pendahuluan**                       | [`./index/01-introduction.md`](./index/01-introduction.md)                               | Tujuan, ruang lingkup, definisi, referensi, konvensi dokumen               |
| 02  | **Gambaran Umum Sistem**              | [`./index/02-system-overview.md`](./index/02-system-overview.md)                         | Deskripsi platform, model bisnis (beli putus + subscription), target pasar |
| 03  | **Arsitektur Sistem**                 | [`./index/03-system-architecture.md`](./index/03-system-architecture.md)                 | Supabase-native: Auth, PostgreSQL, Storage, Edge Functions, Realtime, RLS  |
| 04  | **Aktor & Peran Pengguna**            | [`./index/04-user-roles.md`](./index/04-user-roles.md)                                   | Definisi aktor: WO Admin, Editor, Viewer, Customer, Tamu, System           |
| 05  | **Kebutuhan Fungsional**              | [`./index/05-functional-requirements.md`](./index/05-functional-requirements.md)         | Daftar lengkap fitur per modul dengan prioritas                            |
| 06  | **Kebutuhan Non-Fungsional**          | [`./index/06-non-functional-requirements.md`](./index/06-non-functional-requirements.md) | Performa, keamanan, skalabilitas, ketersediaan, retensi data               |
| 07  | **Model Data & Entitas**              | [`./index/07-data-model.md`](./index/07-data-model.md)                                   | Semua entitas, atribut, relasi dari ERD, integrasi `auth.users`, RLS       |
| 08  | **Alur Proses Bisnis**                | [`./index/08-business-flows.md`](./index/08-business-flows.md)                           | Wedding flow (beli putus, 13 hari), Anniversary flow (subscription)        |
| 09  | **State Machine & Siklus Invoice**    | [`./index/09-invoice-state-machine.md`](./index/09-invoice-state-machine.md)             | State diagram invoice, transisi status, triggers                           |
| 10  | **Spesifikasi Modul Detail**          | [`./index/10-module-specifications.md`](./index/10-module-specifications.md)             | Spesifikasi teknis setiap modul via Supabase Client + Supabase RPC         |
| 11  | **Kebutuhan Keamanan**                | [`./index/11-security-requirements.md`](./index/11-security-requirements.md)             | Supabase Auth, RLS policies, Row-Level Security multi-tenant isolation     |
| 12  | **API & Integrasi**                   | [`./index/12-api-integration.md`](./index/12-api-integration.md)                         | **Midtrans** payment, Supabase Storage, Edge Functions webhook             |
| 13  | **Roadmap & Pertimbangan Masa Depan** | [`./index/13-future-roadmap.md`](./index/13-future-roadmap.md)                           | Fitur lanjutan, scalability planning, iterasi berikutnya                   |

---

## Referensi Dokumen

| Referensi     | Deskripsi                                                         | Lokasi                    |
| ------------- | ----------------------------------------------------------------- | ------------------------- |
| ERD           | Entity Relationship Diagram — seluruh entitas dan relasi database | `database/erd.md`         |
| Diagram Alur  | Business flow, state machine, multi-tenant architecture           | `flow/diagram.mmd`        |
| AGENTS.md     | Project knowledge base, konvensi kode, struktur proyek            | `AGENTS.md`               |
| Supabase Docs | Auth, Database, Storage, Edge Functions, Realtime                 | https://supabase.com/docs |
| Midtrans Docs | Payment gateway API, webhook, Snap, Core API                      | https://docs.midtrans.com |
