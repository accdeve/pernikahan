import { renderMermaidSVG } from 'beautiful-mermaid'
import * as fs from 'fs'
import * as path from 'path'

const FLOW_DIR = path.resolve('./flow')

const DIAGRAMS = {
  '1_onboarding_signup': `sequenceDiagram
    autonumber
    actor User as Pengguna / WO Baru
    participant UI as SignupForm (React)
    participant EF as Edge Function (wo-signup)
    participant Auth as Supabase Auth (GoTrue)
    participant DB as PostgreSQL Database
    participant Mail as Mailpit / SMTP Server

    User->>UI: Isi Info WO & Akun Staff
    UI->>EF: POST /functions/v1/wo-signup
    EF->>Auth: Buat Akun User Baru
    Auth-->>EF: Return User ID
    EF->>DB: Insert WO & Staff (Admin)
    EF->>Auth: Kirim email OTP
    Auth->>Mail: Kirim Email Verifikasi
    EF-->>UI: Return HTTP 200 OK
    UI->>UI: Simpan data di sessionStorage
    UI->>User: Dialihkan ke /otp
    User->>UI: Input kode OTP
    UI->>Auth: Verifikasi OTP via SDK
    Auth-->>UI: Return Sesi Aktif
    UI->>UI: Redirect ke Dashboard
`,
  '2_auth_session': `flowchart TD
    A[Akses Halaman] --> B{Rute Publik?}
    B -->|Ya| C[Render Undangan / RSVP]
    B -->|Tidak| D[Periksa AuthContext]
    D --> E{Sesi Aktif?}
    E -->|Tidak| F[Redirect ke /login]
    E -->|Ya| G{Ada slug_wo?}
    G -->|Ya| H{Sesuai Sesi User?}
    G -->|Tidak| I[Redirect ke /admin/:wo_slug]
    H -->|Ya| J[Render Panel Admin]
    H -->|Tidak| K[Tampilkan Error 403]
    F --> L[Login di /login]
    L --> M[Kirim ke Supabase Auth]
    M --> N{Sukses?}
    N -->|Ya| I
    N -->|Tidak| O[Tampilkan Error]
`,
  '3_admin_management': `flowchart TD
    A[Dashboard WO] --> B[Statistik & List Klien]
    B --> C[Tambah Customer]
    B --> D[Kelola Customer]
    D --> E[Detail Customer]
    E --> F[Info Mempelai & Acara]
    E --> G[Kisah Cinta / Stories]
    E --> H[Galeri Foto / Gallery]
    E --> I[Tamu & RSVP]
    H --> H1[Seret Gambar]
    H1 --> H2[Client WebP Compress]
    H2 --> H3[Upload ke Storage]
    H3 --> H4[Simpan URL ke galleries]
    H4 --> H5[Reorder via @dnd-kit]
    H5 --> H6[Update order_index di DB]
`,
  '4_public_invitation': `flowchart TD
    A[Tamu ke /:slug_wo/:slug] --> B[Fetch Data dari Supabase]
    B --> C1[Data Customer]
    B --> C2[Data Stories]
    B --> C3[Data Galleries]
    B --> C4[Data Guests]
    C1 & C2 & C3 & C4 --> D{Valid?}
    D -->|Tidak| E[Halaman 404]
    D -->|Ya| F[Baca customer.style]
    F --> G[Peta Tema Dinamis: themes-style]
    G --> H{Kategori Animasi / Interaksi?}
    H -->|Scroll-driven / Seq| I[Gunakan Sequence Hooks / e.g. useScrollSequence]
    H -->|Overlay / Storytelling| J[Gunakan Slide Hooks / e.g. useCoverAnimation]
    H -->|Custom Particle / FX| K[Gunakan Special Effects / e.g. useFlowerPetals]
    I & J & K --> L[Render Layout & Tampilkan Cover Halaman]
    L --> M[Tamu Klik Buka Undangan / Mulai Scroll]
    M --> N[Mainkan Musik & Trigger Animasi Transisi Halaman]
`,
  '5_rsvp_guestbook': `sequenceDiagram
    autonumber
    actor Guest as Tamu Undangan
    participant UI as RsvpForm / Guestbook
    participant DB as Supabase (Tabel guests)
    participant Admin as Admin Panel

    Guest->>UI: Isi Form RSVP & Ucapan
    Guest->>UI: Klik Kirim RSVP
    UI->>DB: INSERT INTO guests (Data RSVP)
    alt Sukses
        DB-->>UI: Return HTTP 201
        UI->>UI: Tampilkan Notifikasi & Update List
    else Gagal
        DB-->>UI: Return HTTP Error
        UI->>UI: Tampilkan Error
    end
    Note over Admin: Admin memantau tamu
    DB->>Admin: Tampilkan daftar RSVP
    Admin->>DB: Hapus Ucapan (Spam)
`
}

async function main() {
  if (!fs.existsSync(FLOW_DIR)) {
    fs.mkdirSync(FLOW_DIR, { recursive: true })
  }

  for (const [name, code] of Object.entries(DIAGRAMS)) {
    console.log(`Rendering diagram: ${name}...`)
    try {
      const svg = renderMermaidSVG(code, {
        bg: '#18181b', // matching zinc-dark style background
        fg: '#fafafa', // matching zinc-dark foreground
        line: '#3f3f46',
        accent: '#3b82f6',
        muted: '#71717a',
        surface: '#27272a',
        border: '#3f3f46',
        transparent: false,
      })

      const outputPath = path.join(FLOW_DIR, `${name}.svg`)
      fs.writeFileSync(outputPath, svg)
      console.log(`Saved SVG to ${outputPath}`)
    } catch (err) {
      console.error(`Failed to render ${name}:`, err)
    }
  }
}

main().catch(console.error)
