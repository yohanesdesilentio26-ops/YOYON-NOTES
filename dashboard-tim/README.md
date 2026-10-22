# Ruang Tim — Dashboard Kinerja

Aplikasi web lokal (tanpa server, tanpa internet) untuk memantau kinerja tim per proyek. Data tersimpan otomatis di browser Anda.

## Cara menjalankan

1. Buka folder `dashboard-tim`.
2. Klik dua kali **`index.html`** (disarankan Google Chrome atau Microsoft Edge).
3. Selesai — aplikasi langsung bisa dipakai. Tidak perlu instalasi apa pun.

> Agar data tidak hilang, selalu buka lewat file yang sama dan jangan menghapus data situs/browser. Gunakan **Pengaturan → Unduh cadangan (.json)** secara berkala.

## Fitur

### Sidebar
- Tombol **Tambah Proyek** di bagian kiri atas.
- Menu **Tugas Saya** untuk daftar tugas pribadi di luar proyek.
- Menu **Catatan** untuk catatan cepat yang tersimpan otomatis.
- Bagian **Proyek Tim** berisi setiap proyek sebagai menu di sidebar, lengkap dengan progress dan status.
- Klik ikon titik tiga pada proyek untuk **edit, duplikat, atau hapus**.

### Tambah / edit proyek
- Nama proyek
- Deskripsi proyek
- Batas selesai proyek (bulan & tahun)
- Gambar proyek (opsional). Gambar ini tampil di bagian **atas** panel kiri bawah lembar kerja, di atas ilustrasi mockup perangkat.

### Di dalam proyek
- **Tambah Step**: nama step, keterangan, deadline, dan status.
- Tiga status dengan warna:
  - **Selesai** — hijau
  - **Sedang berjalan** — oranye
  - **Belum berjalan** — abu-abu
- Klik pill status untuk mengganti status dengan cepat.
- Klik dua kali kartu step (atau ikon pensil) untuk mengedit.
- Geser kartu step untuk mengubah urutan. Di layar sentuh, gunakan ikon titik-titik di kartu.
- Progress proyek, jumlah step, dan timeline dihitung otomatis.

### Tugas Saya
- Buka menu **Tugas Saya** di sidebar.
- Klik **Tambah Tugas**, lalu isi:
  - Nama tugas
  - Tugas dari siapa
  - Deskripsi
  - Tanggal deadline
  - Ceklis **Sudah selesai**
- Klik kotak ceklis di daftar untuk menandai tugas selesai/belum.
- Tugas yang belum selesai diurutkan berdasarkan deadline terdekat; tugas terlambat ditandai merah.
- Tugas yang deadline-nya tinggal **kurang dari 24 jam** mendapat penanda merah. Jumlahnya muncul sebagai bulatan merah di menu **Tugas Saya** pada sidebar.
- Gunakan ikon pensil untuk mengedit dan ikon tempat sampah untuk menghapus.

### Catatan
- Buka menu **Catatan** di sidebar, lalu klik **Tambah Catatan**.
- Tulis isi catatan; **baris pertama otomatis menjadi judul** yang tampil di daftar.
- Tidak ada tombol simpan: setiap perubahan langsung tersimpan otomatis.
- Tutup editor dengan **Selesai**; catatan tetap tersimpan dan bisa dibuka lagi kapan saja.
- Catatan yang dibiarkan kosong akan dihapus otomatis saat editor ditutup.
- Catatan ikut tersimpan di cadangan JSON dan ikut terhapus saat **Hapus semua data**.

### Cetak lembar kerja
1. Klik **Cetak Lembar Kerja**.
2. Isi **Progress**, **Kendala**, **Target**, **Nama 1–3**, dan **Tanggal**.
3. Pilih **Ukuran teks lembar kerja**: Ringkas, Nyaman (disarankan), atau Besar.
4. Pratinjau lembar kerja muncul (rasio 16:9, desain seperti slide).
5. Panel kiri bawah menumpuk **gambar proyek** (kartu putih) di atas dan **baris mockup perangkat transparan** di bawah, tanpa bingkai. Jika gambar proyek belum diisi, bagian atas memakai placeholder inisial proyek.
6. Pilih salah satu:
   - **Unduh PNG (HD)** — file 4800 × 2700 px (3× resolusi).
   - **Cetak / PDF** — pada dialog cetak pilih *Save as PDF*. Aktifkan **Background graphics** agar warna ikut tercetak.
   - **Ubah isian** — kembali ke form.

Isian lembar kerja tersimpan per proyek. Step tanpa tanggal akan tampil kosong (tanpa keterangan "tanpa tanggal") pada lembar kerja.

### Pengaturan (ikon roda gigi di kiri bawah)
- Nama tim (dipakai di judul lembar kerja).
- Logo tim tambahan (opsional) untuk pojok kanan atas lembar kerja. Logo Danantara Indonesia dan Asuransi Jasindo sudah otomatis tampil di sana.
- Nama anggota bawaan agar form cetak otomatis terisi.
- Cadangan data: unduh/pulihkan file JSON (proyek, tugas, dan catatan), atau hapus semua data.

## Penyimpanan data

- Media: `localStorage` browser (per alamat/file).
- Tidak ada data yang dikirim ke internet.
- Gambar otomatis diperkecil agar hemat ruang.
- Jika penyimpanan penuh, gunakan cadangan JSON lalu hapus proyek lama.

## Struktur file

```
dashboard-tim/
├─ index.html        Halaman utama
├─ styles.css        Tampilan aplikasi
├─ report.css        Desain lembar kerja 1600 × 900
├─ core.js           Data, format tanggal, penyimpanan
├─ render.js         Render sidebar & timeline
├─ modals.js         Modal proyek, step, konfirmasi
├─ forms.js          Form lembar kerja & pengaturan
├─ logos.js          Logo perusahaan (data URI ter-embed, ikut ekspor PNG/PDF)
├─ cover.js          Mockup perangkat transparan (data URI, ikut ekspor PNG/PDF)
├─ report.js         Render laporan, unduh PNG, cetak PDF
├─ tasks.js          Menu Tugas Saya
├─ notes.js          Menu Catatan (autosave)
├─ events.js         Aksi tombol, drag & drop, keyboard
├─ boot.js           Inisialisasi aplikasi
├─ assets/           Berkas sumber logo, gambar mockup, dan ilustrasi perangkat
└─ vendor/
   └─ html2canvas.min.js   Pustaka render PNG (offline)
```

## Pintasan

- `Esc` — tutup dialog / batal geser / tutup sidebar.
- `Enter` — kirim form yang sedang terbuka. Di editor catatan, `Enter` membuat baris baru.
- Scroll di area timeline — menggeser timeline ke samping.
- Klik dua kali kartu step — edit step.

## Deploy ke Vercel

Aplikasi ini bisa langsung di-deploy sebagai situs statis. Panduan lengkap ada di
[`DEPLOY-VERCEL.md`](DEPLOY-VERCEL.md).
