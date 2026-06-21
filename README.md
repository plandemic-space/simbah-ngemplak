# SIMBAH — Balai Dusun Digital (Dusun Ngemplak)

Website profil & layanan digital Dusun Ngemplak. Tahap belajar, hosting gratis dulu via GitHub Pages.

## 📁 Struktur File
```
simbah/
├── index.html       <- halaman utama (semua section ada di sini)
├── css/style.css    <- semua styling
├── js/script.js     <- semua interaksi/logic
├── data/umkm.json   <- data UMKM (edit di sini untuk tambah/ubah usaha)
└── img/
    ├── logo.svg      <- logo sementara (placeholder, ganti kapan saja)
    ├── umkm/         <- taruh foto UMKM di sini
    └── dusun/        <- taruh foto kegiatan dusun di sini
```

## 🚀 Cara Deploy ke GitHub Pages (GRATIS, 0 Rupiah)

### 1. Buat akun GitHub (kalau belum punya)
- Buka https://github.com → Sign Up

### 2. Buat repository baru
- Klik tombol **"New"** (hijau, pojok kiri atas)
- Nama repo: `simbah-ngemplak` (atau nama lain)
- Pilih **Public**
- Klik **Create repository**

### 3. Upload file
- Di halaman repo yang baru dibuat, klik **"uploading an existing file"**
- Drag & drop SEMUA isi folder `simbah/` (index.html, css/, js/, data/, img/)
- Klik **Commit changes**

### 4. Aktifkan GitHub Pages
- Masuk ke tab **Settings** (di repo Anda)
- Klik **Pages** di sidebar kiri
- Di "Branch", pilih **main** → folder **/ (root)** → **Save**
- Tunggu 1-2 menit

### 5. Selesai!
Website akan online di:
```
https://USERNAME.github.io/simbah-ngemplak/
```
(ganti USERNAME dengan username GitHub Anda)

## ✏️ Cara Edit Konten

**Tambah UMKM baru:**
1. Edit file `data/umkm.json`
2. Copy salah satu blok `{ ... }`, paste sebelum tanda `]` penutup
3. Ganti id, name, phone, dll sesuai usaha baru
4. Jangan lupa koma `,` setelah `}` kecuali itu yang paling akhir

**Ganti logo:**
- Ganti file `img/logo.svg` dengan logo asli (format svg/png, ukuran kecil ±200x200px sudah cukup)

**Edit nomor WhatsApp, alamat, dll:**
- Cari teks terkait langsung di `index.html`

## 🔄 Migrasi ke Domain Sendiri (Nanti)

Kalau sudah oke dan mau pakai domain pro (misal `dusunngemplak.id`):
1. Beli domain di Cloudflare (~Rp 30-50rb/tahun)
2. Di GitHub repo → Settings → Pages → isi "Custom domain"
3. Di Cloudflare DNS, tambah CNAME record mengarah ke `USERNAME.github.io`
4. Tunggu propagasi DNS (~5-30 menit)
5. Selesai, tidak perlu setup ulang apapun — konten & kode tetap sama!
