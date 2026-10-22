# Deploy ke Vercel

Aplikasi ini **statis**: tidak perlu build, server, database, atau environment variable.
Semua file yang dibutuhkan sudah ada di folder `dashboard-tim/`.

## Opsi 1 — Vercel Dashboard + GitHub (disarankan)

1. Buat repository GitHub, lalu masukkan folder `dashboard-tim` ke repository tersebut.
2. Buka [vercel.com/new](https://vercel.com/new), lalu import repository-nya.
3. Isi pengaturan berikut:
   - **Framework Preset**: `Other`
   - **Root Directory**: `dashboard-tim` (jika di dalam repo ada folder ini)
   - **Build Command**: kosongkan
   - **Output Directory**: kosongkan (atau `.`)
   - **Install Command**: kosongkan
4. Klik **Deploy**.

Jika isi folder `dashboard-tim` dijadikan root repository (index.html langsung di root repo),
**Root Directory** boleh dikosongkan.

## Opsi 2 — Vercel CLI

1. Install **Node.js LTS** (sudah termasuk `npm`).
2. Buka terminal di folder `dashboard-tim`.
3. Jalankan:

   ```bash
   npx vercel
   ```

4. Saat ditanya:
   - **Set up and deploy?** → `Y`
   - **Which scope?** → pilih akun
   - **Link to existing project?** → `N`
   - **Project name** → misalnya `ruang-tim`
   - **In which directory is your code located?** → `./`
   - **Want to modify these settings?** → `N`
5. Untuk deploy production:

   ```bash
   npx vercel --prod
   ```

## Pindahkan data lama ke versi Vercel

Data `localStorage` terpisah per alamat. Data dari `file://` **tidak otomatis pindah** ke
domain Vercel.

1. Di aplikasi lokal: **Pengaturan → Unduh cadangan JSON**.
2. Buka URL Vercel hasil deploy.
3. Di aplikasi Vercel: **Pengaturan → Pulihkan cadangan**, pilih file JSON tadi.

## Hal penting

- Aplikasi ini **local-first**. Data proyek/tugas/catatan tersimpan di browser masing-masing,
  bukan di server Vercel. Jadi data tidak otomatis tersinkron antar perangkat atau anggota tim.
- Kalau butuh data yang dibagikan bersama, perlu backend/database dan autentikasi terpisah.
- Untuk **Cetak / PDF**, tetap aktifkan **Background graphics** di dialog cetak.
- Folder `assets/` hanya berisi berkas sumber. Aplikasi memakai data URI yang sudah tertanam
  di `cover.js` dan `logos.js`, jadi aman ikut di-deploy apa adanya.
