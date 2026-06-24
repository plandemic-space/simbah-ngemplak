# SIMBAH — Portal Digital Dusun Ngemplak

Website profil & layanan digital untuk Dusun Ngemplak, Desa Samping, Kecamatan
Kemiri, Kabupaten Purworejo, Jawa Tengah. Dibangun pakai HTML + CSS + JavaScript
murni (tanpa framework, tanpa build tool), hosting gratis via GitHub Pages.

**Live:** https://samxngemplak-arch.github.io/

> Status: tahap belajar & pengembangan bertahap. Belum pindah ke domain
> berbayar — rencana migrasi setelah dianggap matang oleh perangkat dusun
> (lihat bagian "Migrasi ke Domain Sendiri" di bawah).

---

## 📁 Struktur File

```
(root repo)
├── index.html         <- satu-satunya halaman HTML. Semua section
│                          (Beranda, UMKM, Agenda, Kas, Inventaris,
│                          Nyuwun Tulung, Tentang) ada di file ini,
│                          ditampilkan/disembunyikan lewat JS (lihat nav())
├── 404.html            <- halaman error custom, auto-redirect ke Beranda
├── sitemap.xml         <- daftar URL untuk Google (SEO)
├── robots.txt          <- izin crawl untuk search engine
├── favicon.ico + img/favicon-*.png, icon-*.png, apple-touch-icon.png
│                          <- ikon tab browser & home screen HP
├── css/
│   └── style.css      <- SEMUA styling, 1 file. Pakai CSS variables
│                          di :root (warna, radius, dst) — jangan
│                          hardcode hex baru, tambah variable kalau perlu
├── js/
│   └── script.js      <- SEMUA logic & data dinamis (lihat bagian
│                          "Data yang Bisa Diedit" di bawah)
├── data/
│   └── umkm.json       <- data UMKM/usaha warga, dibaca oleh script.js
└── img/
    ├── logo.png         <- logo resmi Dusun Ngemplak (final, jangan ganti
    │                        kecuali memang mau rebranding)
    └── hero-bg.jpg       <- foto/ilustrasi background hero di Beranda
```

Tidak ada folder `img/umkm/` atau `img/dusun/` — UMKM masih pakai emoji
sebagai ikon (belum ada foto asli usaha warga yang diupload).

---

## 🧩 Cara Kerja Website (Single Page, bukan multi-halaman)

Ini bukan website multi-halaman biasa. Semua section (Beranda, UMKM, Agenda,
dst) ada di **1 file `index.html`**, masing-masing dibungkus
`<div class="page" id="p-NAMA">`. JavaScript (`nav('nama-halaman')`) yang
mengatur section mana yang tampil/sembunyi — jadi URL-nya gak berubah-ubah
per halaman seperti website biasa (kecuali untuk link share UMKM, lihat di
bawah).

Kalau mau cari section tertentu di `index.html`, cari komentar header
seperti `<!-- ======= UMKM ======= -->` atau cari `id="p-umkm"`,
`id="p-agenda"`, dst.

---

## ✏️ Data yang Bisa Diedit (TANPA perlu paham JS)

Semua data yang sering berubah sudah dipisahkan ke variabel/file khusus —
edit di sini, **tidak perlu** sentuh bagian lain dari kode.

### 1. UMKM — `data/umkm.json`
- Tambah usaha baru: copy salah satu blok `{ ... }`, paste sebelum `]`
  penutup, ganti isinya (nama, kategori, nomor WA, dll). Lihat field
  `_petunjuk` di baris paling atas file untuk detail tiap kolom.
- Jumlah UMKM di Hero & section "Kenali Ngemplak" **otomatis ikut
  bertambah** — tidak perlu update manual di `index.html` lagi
  (lihat `renderStatUMKM()` di `script.js`).

### 2. Agenda Dusun — `const AGENDA` di `js/script.js`
- Cari `const AGENDA = [` di `script.js`.
- Copy salah satu blok `{ ... }`, ganti tanggal (format wajib
  `YYYY-MM-DD`), judul, jam, lokasi, dan tag.
- Event yang tanggalnya sudah lewat otomatis hilang dari tampilan
  (Beranda, halaman Agenda, ticker pengumuman) — tidak perlu dihapus
  manual.
- **Catatan kebijakan:** ini khusus untuk event besar yang layak
  diketahui orang luar dusun (festival, sedekah bumi, HUT dusun, dst).
  Agenda rutin RT (kerja bakti, posyandu, pengajian) cukup di grup WA
  warga, tidak usah dimasukkan ke sini — biar halaman Agenda tetap
  ringkas.

### 3. Inventaris Dusun — `const INVENTARIS` di `js/script.js`
- Cari `const INVENTARIS = [` di `script.js`.
- Tambah barang baru dengan copy salah satu blok `{ ... }`. Field
  `kelompok` menentukan barang itu masuk section mana (otomatis
  dikelompokkan, tidak perlu bikin section HTML baru).

### 4. Transparansi Kas — `const KAS_UPDATE` & `KAS_TOTAL` di `js/script.js`
- Saldo per komunitas (RT 01, RT 02, Karang Taruna, PKK) masih ditulis
  manual langsung di `index.html` (cari `kaskom-saldo`).
- **PENTING:** angka yang tampil di website TIDAK live-sync dengan
  Google Sheets. Tiap bendahara update Sheets masing-masing, tapi
  Zen tetap harus update angka di kode secara manual kalau ada
  perubahan saldo yang signifikan.

### 5. Nomor WhatsApp utama — `const WA_UTAMA` di `js/script.js`
- 1 variabel ini dipakai di SEMUA tombol WA di seluruh halaman
  (termasuk footer). Ganti di sini saja, tidak perlu cari satu-satu
  di `index.html`.

### 6. Footer — `templateFooter()` di `js/script.js`
- Footer (logo, alamat, kontak, sosmed) sekarang **1 sumber saja**,
  ditulis di fungsi `templateFooter()`, dan otomatis ditempel ke semua
  halaman yang butuh footer (saat ini: Beranda & Tentang).
- Dulu footer ini di-copy manual 2x di `index.html` — itu yang
  menyebabkan risiko gampang gak sinkron kalau salah satu lupa
  diupdate. Sekarang cukup edit `templateFooter()` 1 kali.
- Kalau nanti ada halaman baru yang butuh footer juga: tambah
  `<div class="footer-slot" id="footer-NAMA-BARU"></div>` di
  `index.html`, lalu daftarkan id-nya ke array `FOOTER_SLOTS` di
  `script.js` — tidak perlu copy HTML footer lagi.

### 7. Ganti logo / foto hero
- Logo resmi: `img/logo.png` (sudah final, jangan diganti tanpa alasan
  kuat — ini identitas visual yang sudah disepakati).
- Foto background hero Beranda: `img/hero-bg.jpg`. Saat ini pakai foto
  ilustratif suasana desa (bukan foto asli lokasi Ngemplak) — bisa
  diganti foto asli kapan saja, tinggal replace file dengan nama sama.

### 8. Kontak Penting (Nyuwun Tulung) & Struktur Pengurus
- Masih banyak yang berstatus placeholder ("nama menyusul", "Segera
  diperbarui") — cari langsung teks itu di `index.html` untuk
  menggantinya begitu data resmi ada.

---

## 🎨 Sistem Desain (jangan dilanggar tanpa diskusi dulu)

- **Warna:** semua lewat CSS variable di `:root` (`css/style.css`,
  bagian paling atas) — `--iv` (ivory/krem, dasar), `--gr` (hijau,
  aksen utama), `--br` (emas/bronze, detail halus). Proporsi target
  Ivory 70% : Hijau 20% : Emas 10%. Jangan tulis hex color baru
  langsung di selector; tambah variable baru kalau memang perlu warna
  baru.
- **Bukan mockup HP lagi.** Versi awal didesain sebagai bingkai phone
  mockup (status bar palsu, dst) — itu sudah dihapus total. Sekarang
  `.phone` adalah container biasa (max-width 480px di mobile, full
  width di desktop ≥1024px lewat media query).
- **Mobile-first, tapi sudah full-responsive.** Ada breakpoint
  `@media (min-width: 1024px)` di akhir `style.css` untuk varian
  desktop (nav atas, grid 2-kolom di Beranda, dst).

---

## 🚀 Cara Update Website (workflow Zen: edit lalu upload manual)

Repo ini **tidak punya CI/CD otomatis**. Setiap ada perubahan file
(dari Claude atau edit manual sendiri), caranya:

1. Download/siapkan file yang sudah diubah
2. Buka repo `samxngemplak-arch.github.io` di GitHub
3. Drag & drop file yang diubah ke folder yang sesuai (replace file lama)
4. Klik **Commit changes**
5. Tunggu 1-2 menit, GitHub Pages otomatis build ulang

GitHub Pages sudah aktif di repo ini sejak awal setup (kemungkinan
branch `main`, folder root `/` — cek di Settings → Pages kalau mau
pastikan). Tidak perlu setting ulang kecuali pindah domain (lihat
bagian bawah).

---

## 🔄 Migrasi ke Domain Sendiri (Nanti)

Kalau sudah dianggap matang dan mau pakai domain sendiri (misal
`dusunngemplak.id`):

1. Beli domain (Cloudflare/Niagahoster/dst, ±Rp 30-150rb/tahun
   tergantung ekstensi)
2. Di GitHub repo → **Settings → Pages → Custom domain**, isi domain
   baru
3. Di pengelola DNS domain, tambah CNAME record mengarah ke
   `samxngemplak-arch.github.io`
4. Tunggu propagasi DNS (~5-30 menit, kadang sampai 24 jam)
5. Selesai — konten & kode tidak perlu diubah sama sekali, cuma
   alamatnya yang baru

---

## ⚠️ Batasan yang Disengaja (jangan ditambahkan tanpa diskusi)

Sesuai roadmap produk, SIMBAH sengaja **tidak** punya: login warga,
dashboard admin, forum/chat warga, sistem surat-menyurat, booking
inventaris, atau backend/database apapun. Semua data tersimpan sebagai
file statis (JSON + JS array) dan diedit manual oleh pengelola. Ini
keputusan sadar demi kemudahan maintenance jangka panjang oleh 1-2
orang tanpa tim IT khusus — bukan keterbatasan yang harus "diperbaiki".
