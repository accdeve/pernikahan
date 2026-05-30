# Daftar Rute Aplikasi (Routes List)

Aplikasi berjalan pada:

- **IP**: `127.0.0.1` (atau `localhost`)
- **Port**: `3333`
- **URL Basis**: `http://127.0.0.1:3333`

---

## 1. Rute Beranda & Redirect

| Metode  | Rute | Nama Rute (`.as()`) | Handler           | Deskripsi                                             |
| :------ | :--- | :------------------ | :---------------- | :---------------------------------------------------- |
| **GET** | `/`  | `home`              | _Inline Redirect_ | Mengalihkan ke default invitation `/juliana-muhammad` |

---

## 2. Rute B2B Public Viewer

| Metode  | Rute              | Nama Rute (`.as()`) | Handler                                   | Deskripsi                    |
| :------ | :---------------- | :------------------ | :---------------------------------------- | :--------------------------- |
| **GET** | `/undangan/:slug` | `b2b.wedding`       | `InvitationController.showB2bWedding`     | Tampilan Web Pernikahan B2B  |
| **GET** | `/memory/:slug`   | `b2b.anniversary`   | `InvitationController.showB2bAnniversary` | Tampilan Web Anniversary B2B |

---

## 3. Rute B2B Portal (Klien)

| Metode  | Rute             | Nama Rute (`.as()`) | Handler                    | Deskripsi                     |
| :------ | :--------------- | :------------------ | :------------------------- | :---------------------------- |
| **GET** | `/b2b/login`     | `b2b.login`         | `B2bController.showLogin`  | Halaman login klien B2B       |
| **GET** | `/b2b/signup`    | `b2b.signup`        | `B2bController.showSignup` | Halaman daftar akun klien B2B |
| **GET** | `/b2b/dashboard` | `b2b.dashboard`     | `B2bController.dashboard`  | Halaman dashboard utama B2B   |
| **GET** | `/b2b/customers` | `b2b.customers`     | `B2bController.customers`  | Halaman pelanggan B2B         |

---

## 4. Halaman Login Administrator (Guest Group)

_Hanya dapat diakses jika belum melakukan autentikasi._

| Metode   | Rute           | Nama Rute (`.as()`) | Handler                         | Deskripsi                      |
| :------- | :------------- | :------------------ | :------------------------------ | :----------------------------- |
| **GET**  | `/admin/login` | `admin.login`       | `AdminAuthController.showLogin` | Halaman form login admin       |
| **POST** | `/admin/login` | `admin.login.store` | `AdminAuthController.login`     | Proses autentikasi login admin |

---

## 5. Panel Manajemen Administrator (Guarded Group)

_Membutuhkan autentikasi admin (`middleware.auth`)._

| Metode   | Rute                        | Nama Rute (`.as()`)    | Handler                         | Deskripsi                          |
| :------- | :-------------------------- | :--------------------- | :------------------------------ | :--------------------------------- |
| **POST** | `/admin/logout`             | `admin.logout`         | `AdminAuthController.logout`    | Proses keluar dari sesi admin      |
| **GET**  | `/admin`                    | `admin.dashboard`      | `AdminController.dashboard`     | Halaman ringkasan dashboard admin  |
| **GET**  | `/admin/edit`               | `admin.edit`           | `AdminController.edit`          | Form pengeditan informasi undangan |
| **POST** | `/admin/edit`               | `admin.edit.update`    | `AdminController.update`        | Menyimpan perubahan data undangan  |
| **GET**  | `/admin/stories`            | `admin.stories`        | `AdminController.stories`       | Kelola cerita / love stories       |
| **POST** | `/admin/stories`            | `admin.stories.store`  | `AdminController.createStory`   | Membuat data cerita baru           |
| **POST** | `/admin/stories/delete/:id` | `admin.stories.delete` | `AdminController.deleteStory`   | Menghapus data cerita              |
| **GET**  | `/admin/gallery`            | `admin.gallery`        | `AdminController.gallery`       | Kelola galeri foto pre-wedding     |
| **POST** | `/admin/gallery`            | `admin.gallery.store`  | `AdminController.createGallery` | Mengunggah foto galeri baru        |
| **POST** | `/admin/gallery/delete/:id` | `admin.gallery.delete` | `AdminController.deleteGallery` | Menghapus foto galeri              |
| **GET**  | `/admin/guests`             | `admin.guests`         | `AdminController.guests`        | Kelola dan moderasi tamu / RSVP    |
| **POST** | `/admin/guests/delete/:id`  | `admin.guests.delete`  | `AdminController.deleteGuest`   | Menghapus data tamu                |

---

## 6. Rute Undangan Publik (Greedy)

_Rute penangkap global diletakkan di paling bawah agar tidak memblokir rute statis lainnya._

| Metode   | Rute          | Nama Rute (`.as()`) | Handler                     | Deskripsi                                        |
| :------- | :------------ | :------------------ | :-------------------------- | :----------------------------------------------- |
| **GET**  | `/:slug`      | `invitation.show`   | `InvitationController.show` | Menampilkan undangan pernikahan berdasarkan slug |
| **POST** | `/:slug/rsvp` | `invitation.rsvp`   | `InvitationController.rsvp` | Mengirim data RSVP/Ucapan dari tamu              |
