# Spesifikasi Desain Web Undangan Digital
## Tema: Formal Editorial (Image Sequence / Scroll-Animation)

Dokumen ini berisi spesifikasi desain untuk undangan digital berkonsep *Image Sequence*. Mengambil inspirasi dari halaman produk teknologi premium (seperti Apple product pages) atau majalah mode, undangan ini bercerita melalui pergantian frame foto yang terikat pada interaksi *scroll* pengguna (Scroll-bound animation).

---

### 1. Konsep Visual & Palet Warna
Karena fokus utama adalah **Fotografi** (menampilkan banyak momen pengantin), antarmuka (UI) harus dibuat sangat minimalis dan bersih agar tidak bertabrakan dengan warna dari foto.
* **Background Utama:** `#0A0A0A` (Hitam Pekat) - Dipilih untuk mendukung kedalaman foto pre-wedding monokrom dan kontras teks putih.
* **Warna Teks Utama:** `#FFFFFF` (Putih Murni).
* **Warna Aksen:** `#8C8C8C` (Abu-abu elegan) untuk elemen sekunder seperti garis pemisah atau teks bantuan.
* **Tipografi:**
    * *Heading/Nama:* `Cinzel` (Serif tipis, formal, gaya majalah/editorial).
    * *Body Text:* `Inter` (Sans-serif, bersih, tingkat keterbacaan tinggi).

---

### 2. Mekanisme Interaksi (The "Image Sequence")
Struktur ini mengandalkan elemen yang di-pin (ditahan di layar) sementara latar belakang atau konten gambar berubah seiring guliran (scroll) pengguna.
* **Teknik Render:** JavaScript IntersectionObserver dan CSS opacity transitions untuk memanipulasi sequence gambar.
* **Transisi:** Cross-fade halus untuk menciptakan efek sinematik.

---

### 3. Alur Konten & Sekuens
1. **The Grand Opening (Cover):** Frame pertama sinematik dengan instruksi "Scroll to explore".
2. **The Couple (Pengenalan):** Fade-in nama mempelai di atas sequence foto pre-wedding.
3. **The Moments (Kisah & Galeri):** Timeline kisah cinta yang muncul sinkron dengan transisi foto latar.
4. **The Invitation (Acara):** Layout grid editorial minimalis untuk detail Akad & Resepsi.
5. **RSVP & Digital Envelope:** Form fungsional yang muncul setelah sekuens animasi berakhir.
6. **Closing Sequence:** Foto penutup dengan ucapan terima kasih melayang.

---

### 4. Panduan Optimasi
* Penggunaan format WebP untuk efisiensi pemuatan.
* Animasi berbasis `transform` dan `opacity` untuk akselerasi hardware (GPU).
* Pre-loading frame krusial di awal sesi.