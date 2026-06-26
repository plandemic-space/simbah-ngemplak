# SIMBAH — Portal Digital Dusun Ngemplak

Website profil & layanan digital untuk Dusun Ngemplak, Desa Samping, Kecamatan
Kemiri, Kabupaten Purworejo, Jawa Tengah. Dibangun pakai HTML + CSS + JavaScript
murni (tanpa framework, tanpa build tool), hosting gratis via GitHub Pages.

**Live:** https://simbahngemplak.vercel.app/
(Domain Vercel = domain utama/resmi yang diindex Google. Repo yang sama juga
auto-deploy ke https://samxngemplak-arch.github.io/ tapi itu bukan yang didaftarkan
ke search engine — lihat `<link rel="canonical">` di `index.html`.)

> Status: pengembangan bertahap — fitur inti sudah jalan, sedang mengisi data
> lapangan (foto UMKM, nomor kontak, nama pengurus). Belum pindah ke domain
> berbayar — rencana migrasi setelah dianggap matang oleh perangkat dusun
> (lihat bagian "Migrasi ke Domain Sendiri" di bawah).

---

## 📁 Struktur File

```
(root repo)
├── index.html          ← satu-satunya halaman HTML. Semua section
│                           (Beranda, Agenda, UMKM, UMKM Detail, Kas,
│                           Inventaris, Nyuwun Tulung, Tentang) ada di
│                           file ini, ditampilkan/disembunyikan lewat JS
│                           (lihat nav() di js/script.js)
├── 404.html            ← halaman error custom, auto-redirect ke Beranda
│                           setelah 5 detik
├── sitemap.xml         ← daftar URL untuk Google (SEO) — 1 beranda +
│                           18 URL UMKM individual (?umkm=slug-nama)
├── robots.txt          ← izin crawl untuk search engine
├── favicon.ico + img/favicon-*.png, icon-*.png, apple-touch-icon.png
│                           ← ikon tab browser & home screen HP
├── css/
│   └── style.css       ← SEMUA styling, 1 file. Pakai CSS variables
│                           di :root (warna, radius, dll) — jangan
│                           hardcode hex baru, tambah variable kalau perlu
├── js/
│   └── script.js       ← SEMUA logika & data dinamis (AGENDA, INVENTARIS,
│                           KAS, footer, navigasi, render UMKM, dll)
├── data/
│   └── umkm.json       ← data UMKM/usaha warga (19 UMKM), dibaca
│                           oleh script.js via fetch()
└── img/
    ├── branding/        ← logo, favicon, icon PWA (final, jangan ganti
    │                        kecuali memang mau rebranding)
    ├── backgrounds/
    │   └── hero-bg.webp ← foto/ilustrasi background hero di Beranda
    │                         (bisa diganti foto asli Ngemplak kapan saja)
    ├── about/           ← foto pendukung halaman Tentang Dusun
    └── umkm/            ← foto asli tiap UMKM, 1 subfolder per usaha
                              (cover.webp + gallery-01.webp dst)
```

> Foto asli 19/19 UMKM sudah lengkap di `img/umkm/<slug-nama-usaha>/`
> (`cover.webp` + 3–4 foto galeri), dirujuk lewat field `cover` & `galeri`
> di `umkm.json`. Bukan emoji lagi — lihat Status Saat Ini di bawah.

---

## 🧩 Cara Kerja Website (Single Page, bukan multi-halaman)

Ini bukan website multi-halaman biasa. Semua section ada di **1 file
`index.html`**, masing-masing dibungkus `<div class="page" id="p-NAMA">`.
JavaScript (`nav('nama-section')`) yang mengatur section mana yang
tampil/sembunyi.

Untuk link share UMKM, URL berubah jadi `?umkm=slug-nama-usaha` — ini
yang membuat tiap UMKM bisa muncul satu-satu di Google Search.

Cara cari section tertentu di `index.html`: cari komentar seperti
`<!-- ======= UMKM ======= -->` atau cari `id="p-umkm"`, `id="p-agenda"`, dll.

---

## ✏️ Data yang Bisa Diedit (TANPA perlu paham JS)

Semua data yang sering berubah sudah dipisahkan ke variabel/file khusus.
Edit di sini saja — **tidak perlu** sentuh bagian lain dari kode.

### 1. UMKM — `data/umkm.json`

- Tambah usaha baru: copy salah satu blok `{ ... }`, paste sebelum `]`
  penutup, ganti isinya. Lihat field `_petunjuk` di baris paling atas
  file untuk detail tiap kolom.
- Jumlah UMKM di Hero & statistik dusun **otomatis bertambah** saat
  UMKM baru ditambahkan — tidak perlu update manual di `index.html`.
- Tombol WA otomatis tersembunyi kalau field `phone` kosong
  (diganti badge "📍 Lihat Maps").
- Sitemap.xml — saat tambah UMKM baru, **wajib tambahkan** juga 1 blok
  `<url>` baru di `sitemap.xml`. Cara dapat slug yang benar: nama usaha
  → huruf kecil → spasi jadi `-` → hapus tanda baca.
  Contoh: "Toko Kelontong Bu Siti" → `toko-kelontong-bu-siti`
- `fetch()` UMKM hanya berjalan kalau dibuka lewat server
  (Laragon/localhost atau GitHub Pages) — **tidak bisa** dibuka
  langsung klik dua kali dari File Explorer.

### 2. Agenda Dusun — `const AGENDA` di `js/script.js`

- Cari `const AGENDA = [` di `script.js`.
- Copy salah satu blok `{ ... }`, ganti tanggal (format wajib
  `YYYY-MM-DD`), judul, jam, lokasi, dan tag.
- Event yang tanggalnya sudah lewat otomatis hilang dari tampilan —
  tidak perlu dihapus manual.
- Ticker pengumuman di Beranda juga otomatis ikut agenda ini.
- **Catatan kebijakan:** khusus event besar yang layak diketahui
  orang luar dusun (festival, sedekah bumi, HUT dusun, dll). Agenda
  rutin RT (kerja bakti, posyandu, pengajian) cukup di grup WA warga.

### 3. Inventaris Dusun — `const INVENTARIS` di `js/script.js`

- Cari `const INVENTARIS = [` di `script.js`.
- Tambah barang baru dengan copy salah satu blok `{ ... }`. Field
  `kelompok` menentukan barang masuk section mana (otomatis
  dikelompokkan, tidak perlu buat section HTML baru).

### 4. Transparansi Kas — `const KAS_UPDATE` & `KAS_TOTAL` di `js/script.js`

- `KAS_TOTAL` : total gabungan semua kas (string, misal `'Rp 905.000'`)
- `KAS_UPDATE` : tanggal update terakhir (misal `'23 Juni 2026'`)
- Saldo per komunitas (RT 01, RT 02, Karang Taruna, PKK) diisi langsung
  di `index.html` — cari `kaskom-saldo`.
- **PENTING:** angka di website TIDAK live-sync dengan Google Sheets.
  Update angka di kode setiap ada perubahan saldo yang signifikan.

### 5. Nomor WhatsApp Utama — `const WA_UTAMA` di `js/script.js`

- 1 variabel ini dipakai di SEMUA tombol WA di seluruh halaman.
- Ganti di sini saja — tidak perlu cari satu-satu di `index.html`.

### 6. Footer — `templateFooter()` di `js/script.js`

- Footer dirender dari 1 fungsi `templateFooter()`, otomatis ditempel
  ke semua id yang terdaftar di array `FOOTER_SLOTS`.
- Edit alamat, kontak, sosmed di `templateFooter()` satu kali —
  semua halaman yang pakai footer ikut berubah.

### 7. Ganti Logo / Foto Hero

- **Logo**: `img/branding/logo.png` (+ `logo.svg`) — sudah final, jangan
  diganti tanpa alasan kuat (ini identitas visual yang sudah disepakati).
- **Foto background hero**: `img/backgrounds/hero-bg.webp` — saat ini
  pakai foto ilustratif, bisa diganti foto asli Ngemplak kapan saja.
  Cukup replace file dengan nama yang sama (format boleh `.jpg`/`.png`,
  sesuaikan nama di CSS kalau diganti format).

### 8. Foto Asli UMKM — `img/umkm/<slug>/`

Sudah selesai untuk 19/19 UMKM, struktur per usaha:

```
img/umkm/<slug-nama-usaha>/
├── cover.webp        ← foto sampul, dipakai di kartu grid & cover detail
├── gallery-01.webp
├── gallery-02.webp
└── gallery-03.webp   (boleh sampai gallery-04.webp)
```

Path-nya dirujuk di `umkm.json` lewat field `cover` (string) & `galeri`
(array path). Slug harus identik dengan hasil fungsi `slugify()` di
`script.js` (nama usaha → huruf kecil → spasi jadi `-` → hapus tanda baca),
supaya konsisten dengan URL share `?umkm=slug`.

Cara tambah UMKM baru dengan foto: buat folder baru di `img/umkm/`
sesuai slug nama usaha, isi `cover.webp` + foto galeri, lalu isi field
`cover`/`galeri` di `umkm.json` dengan path-nya.

### 9. Kontak Penting (Nyuwun Tulung) & Struktur Pengurus

- Kontak yang belum ada nomor aslinya sudah **nonaktif** (abu-abu,
  tidak bisa diklik) — tidak ada warga yang salah sambung.
- Untuk mengaktifkan: cari kontak di `index.html`, isi `href` dengan
  nomor asli (`https://wa.me/628xxx`), hapus atribut `data-kontak-publik`.
- Nama pengurus yang masih `—`: buka `index.html`, Ctrl+F cari
  jabatannya, ganti `—` di baris itu dengan nama asli.

---

## 🎨 Sistem Desain (jangan dilanggar tanpa diskusi)

- **Warna:** semua lewat CSS variable di `:root` (`css/style.css`, paling
  atas) — `--iv` (ivory/krem, dasar), `--gr` (hijau, aksen utama), `--br`
  (emas/bronze, detail halus). Proporsi target: Ivory 70% : Hijau 20% : Emas 10%.
  Jangan tulis hex color baru langsung di selector.
- **Mobile-first, full-responsive.** Breakpoint `@media (min-width: 1024px)`
  di akhir `css/style.css` untuk varian desktop (nav atas, grid 2-kolom
  di Beranda, dll).
- **Karakter visual:** hangat, agraris, tenang, sederhana, modern-tradisional.
  Hindari gaya startup/fintech/SaaS.

---

## 🚀 Cara Update Website (workflow: edit → drag-drop GitHub)

Repo ini tidak punya CI/CD otomatis. Setiap ada perubahan file:

1. Siapkan file yang sudah diubah
2. Buka repo `samxngemplak-arch.github.io` di GitHub
3. Drag & drop file ke folder yang sesuai (replace file lama)
4. Klik **Commit changes**
5. Tunggu 1–2 menit → GitHub Pages otomatis rebuild

Website juga otomatis deploy ke Vercel (domain resmi) dari repo yang sama.

---

## 🔄 Migrasi ke Domain Sendiri (Nanti)

Kalau sudah matang dan mau pakai domain sendiri (misal `dusunngemplak.id`):

1. Beli domain (Cloudflare/Niagahoster, ±Rp 30–150rb/tahun)
2. GitHub repo → **Settings → Pages → Custom domain**, isi domain baru
3. Di pengelola DNS, tambah CNAME record ke `samxngemplak-arch.github.io`
4. Tunggu propagasi DNS (5–30 menit, kadang hingga 24 jam)
5. **Wajib update** semua `simbahngemplak.vercel.app` di:
   - `index.html` (canonical, OG, Twitter, Schema.org, catatan domain)
   - `sitemap.xml` (semua `<loc>`)
   - `robots.txt` (URL Sitemap)
6. Selesai — konten & logika tidak perlu diubah sama sekali

---

## ⚠️ Batasan yang Disengaja (jangan ditambahkan tanpa diskusi)

SIMBAH sengaja **tidak** punya: login warga, dashboard admin, forum/chat
warga, sistem surat-menyurat, booking inventaris, WA Gateway/notifikasi
otomatis, atau backend/database apapun.

Semua data tersimpan sebagai file statis (JSON + JS array) dan diedit manual
oleh pengelola. Ini keputusan sadar demi kemudahan maintenance jangka panjang
oleh 1–2 orang tanpa tim IT — bukan keterbatasan yang perlu "diperbaiki".

Alasan detail dan daftar fitur yang ditolak permanen ada di
`ROADMAP___MASTER_SIMBAH.md`.

---

## 📊 Status Saat Ini (27 Juni 2026)

| Komponen | Status |
|---|---|
| Halaman Beranda | ✅ Lengkap |
| Lapak UMKM (19 usaha) | ✅ Data dari katalog, produk spesifik |
| Halaman Detail UMKM | ✅ SEO dinamis per UMKM |
| Agenda Dusun | ✅ 4 event Juli–September 2026 |
| Transparansi Kas | ✅ 4 komunitas + link Google Sheets |
| Inventaris Dusun | ✅ 27 item, 4 kelompok |
| Nyuwun Tulung | ✅ Kontak aktif (darurat/medis), kontak dusun nonaktif menunggu nomor asli |
| Tentang Dusun | ✅ 4 sub-tab (Profil, Visi & Misi, Sejarah Accordion, Pengurus) |
| SEO Dasar | ✅ Meta, OG, Schema.org (`GovernmentOrganization` + `WebSite`), Sitemap, Robots, 404 custom |
| SEO per-UMKM | ✅ Title/desc/canonical/`LocalBusiness`/`FAQPage` dinamis |
| Foto UMKM | ✅ 19/19 sudah foto asli (`img/umkm/<slug>/`), bukan emoji lagi |
| Google Search Console | ✅ Sitemap sudah disubmit, menunggu proses indexing Google (wajar, normalnya 4 hari–4 minggu) |
| Nomor kontak dusun | ⏳ Menunggu data lapangan (nama pejabat sudah asli, nomor belum) |
| Nama pengurus organisasi | ⏳ Menunggu data lapangan |
| Foto hero beranda | ⏳ Masih ilustratif, menunggu foto asli Ngemplak |
| Bug aktif (27 Juni) | 🔴 4 bug ditemukan audit — filter chip, variable `history`, Twitter Card, setTimeout UMKM. Lihat `AUDIT_BUG_BELUM_SELESAI.md` |
| Risiko teknis (27 Juni) | 🟠 3 risiko — tidak ada preload hero, tidak ada manifest.json, tidak ada Cache-Control Vercel. Lihat `AUDIT_BUG_BELUM_SELESAI.md` |
