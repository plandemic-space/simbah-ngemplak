# SIMBAH — Audit & Next Step

> Diperbarui: 27 Juni 2026 — audit komprehensif seluruh file aktual. Temuan baru: 4 bug aktif, 3 risiko teknis, 5 optimasi kecil ditambahkan dari AUDIT_SIMBAH_27Juni2026.md.
> Cara pakai: kerjakan dari atas ke bawah. Coret kalau sudah deploy & dicek live.

---

## ✅ SUDAH SELESAI

- [x] Domain canonical → `simbahngemplak.vercel.app` (OG, Twitter, Schema, sitemap, robots)
- [x] Sitemap — 19 URL UMKM individual `?umkm=slug`, lastmod 2026-06-26, semua slug match `slugify()`
- [x] Heading semantik, preconnect, aria-label, loading lazy/eager
- [x] SEO per-UMKM — title, desc, OG, Twitter, canonical, Schema `LocalBusiness` + `FAQPage` dinamis
- [x] Schema `GovernmentOrganization` + `WebSite` statis di `<head>`
- [x] Schema `LocalBusiness` field `image` — path diperbaiki ke `img/branding/logo.png`
- [x] Shuffle berbobot Beranda — semua kategori terwakili
- [x] Jam operasional — "Buka 24 jam" → "Hubungi untuk jam buka" / Plandemic → "Setiap hari, hubungi WA"
- [x] Deskripsi 19 UMKM — ditulis ulang per karakter usaha
- [x] Filter chip `data-filter`
- [x] Data dari katalog v2, v3, Excel — produk spesifik, koreksi karakter & kategori
- [x] Rahman Grosir Bibit masuk `id=3`
- [x] Samuji & PRIMATANI — produk dilengkapi
- [x] FAQ per UMKM — field `faq`, render accordion, Schema `FAQPage`. Semua 19 UMKM sudah ditulis ulang, tidak ada lagi jawaban "Ya." generik
- [x] seoTitle & seoDesc per UMKM — `updateMetaUMKM()`, semua dalam batas karakter Google (title ≤70, desc ≤160)
- [x] Area layanan per UMKM — field `area`, tampil di info operasional, Schema `areaServed`
- [x] Isron Furniture — deskripsi diperbaiki
- [x] Disclaimer Agenda & Kas — tampil di Beranda & halaman masing-masing
- [x] Foto UMKM — 19/19 sudah `cover.webp` + gallery (3–4 foto), path `img/umkm/...`
- [x] Internal linking Usaha Terkait — field `terkait` semua 19 UMKM, render list vertikal compact (`terkait-list`, `terkait-item`)
- [x] Hapus section Testimoni Warga — dari `index.html`, `script.js`, CSS `.rv*`
- [x] Card Produk & Jasa — field `k` (keterangan) ditambah semua produk, label "Hubungi WA" per produk dihapus
- [x] Produk grid 2 kolom — render `script.js` (sudah benar dari awal) + styling `.prow`/`.pcard` di `style.css` diganti dari scroll horizontal jadi grid 2 kolom (badge emoji 32px + nama + keterangan, tanpa kotak besar/box-shadow)
- [x] Nomor kontak Pemerintahan Desa — format `08xx-xxxx-xxxx` diganti "Nomor belum tersedia"
- [x] Komentar galeri foto di `script.js` diperbarui — bukan lagi "emoji placeholder"
- [x] Orphan code Testimoni dihapus dari `script.js`
- [x] `README.md` — struktur folder, status foto, jumlah UMKM diperbarui akurat
- [x] **[BUG-03]** Twitter Card `summary` → `summary_large_image` di `index.html` — og-image 1200×630 sekarang tampil besar
- [x] **[BUG-04]** Hapus `setTimeout` 50ms di `goToUMKM()` (`js/script.js`) — panggil `showUMKM(id)` langsung, sinkron dengan `nav()`, tidak ada lagi risiko race condition di HP lama
- [x] **[BUG-01]** Filter chip direset ke "Semua" saat `goBack()` ke halaman UMKM dan saat masuk halaman UMKM lewat `nav('umkm')` — tidak ada lagi chip lama (mis. "Pertukangan") yang masih kelihatan aktif padahal grid sudah tampil semua
- [x] **[BUG-02]** Variable `history` diganti jadi `navHistory` di seluruh `js/script.js` (deklarasi, `nav()`, `goBack()`, `goHome()`, `popstate` listener) — `window.history.pushState` bawaan browser tidak disentuh, tetap utuh di 3 lokasi

---

## 🔴 KERJAKAN BERIKUTNYA

### [RISIKO-01] Tidak ada `<link rel="preload">` untuk hero background
**File:** `index.html` — `<head>`
**Masalah:** `hero-bg.webp` adalah gambar terbesar, browser baru tahu perlu download setelah parsing CSS → LCP lambat.
**Fix (1 baris, tambah sebelum tag CSS):**
```html
<link rel="preload" as="image" href="img/backgrounds/hero-bg.webp" fetchpriority="high">
```

---

### [RISIKO-02] Tidak ada `manifest.json` — "Add to Home Screen" tidak optimal
**File:** buat `manifest.json` baru di root + tambah 2 baris di `index.html`
**Masalah:** Ikon 192/512 sudah ada di `img/branding/`, tapi tanpa manifest Chrome Android tidak tampilkan banner install, nama/warna splash screen tidak terdefinisi.
**Fix:** Buat file `manifest.json`:
```json
{
  "name": "SIMBAH Ngemplak",
  "short_name": "SIMBAH",
  "description": "Portal digital Dusun Ngemplak, Kemiri, Purworejo",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5F0E8",
  "theme_color": "#2D5A3D",
  "icons": [
    { "src": "img/branding/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "img/branding/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```
Lalu tambah di `index.html` `<head>`:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#2D5A3D">
```

---

### [RISIKO-03] Tidak ada Cache-Control untuk static assets di `vercel.json`
**File:** `vercel.json`
**Masalah:** Tanpa aturan cache, Vercel pakai default pendek → warga re-download semua gambar tiap kunjungan.
**Fix:** Tambah ke array `headers` di `vercel.json` (header lama tetap ada):
```json
{ "source": "/img/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
{ "source": "/css/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400" }] },
{ "source": "/js/(.*)",  "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400" }] }
```
`img` pakai `immutable` (1 tahun) karena nama file tidak berubah. `css`/`js` pakai 1 hari supaya update langsung kelihatan.

---

### [KONTEN-01] Tagline per UMKM
**Masalah:** Above the fold langsung ke deskripsi panjang — tidak ada hook singkat yang menjawab "ini usaha apa" dalam 1 kalimat.
**Data:** Sudah ada di `Katalog_UMKM_Dusun_Ngemplak_FINAL.docx` field "Tagline" per UMKM.
**Yang perlu dikerjakan:**
- Tambah field `tagline` ke semua 19 UMKM di `umkm.json`
- Render 1 baris di bawah nama usaha di halaman detail (`script.js` + sedikit CSS)
- File: `umkm.json`, `script.js`, `style.css`

---

### [KONTEN-02] Teks tombol Maps
**Masalah:** Pengunjung tidak tahu bisa cari review di Google Maps — Google tidak izinkan deep link langsung ke tab Review.
**Fix sederhana:** Ubah teks tombol dari "Buka Maps" → "Lihat Maps & Ulasan"
- File: `index.html` (1 kata)

---

## 🟢 OPTIMASI KECIL — Kapanpun

### [OPT-01] Stat UMKM hardcode `18` bisa flash sebelum JS update
**File:** `index.html` baris 201 & 307
Angka `18` hardcode di HTML, JS update ke `19` setelah fetch (~200–500ms) → warga lihat angka salah sebentar.
**Fix:** Ganti `18` → `19` dan `18+` → `19+` di HTML. Atau ganti dengan `—` supaya tidak ada flash nilai salah (JS `renderStatUMKM()` akan isi nilai benar saat siap).

---

### [OPT-02] `position: relative` tidak ada di `.uimg`
**File:** `css/style.css`
`.uimg img` pakai `position: absolute` tapi parent `.uimg` tidak punya `position: relative`. Secara teknis tidak benar meski di sebagian besar browser aman.
**Fix (1 baris):**
```css
.uimg {
  position: relative; /* tambah ini */
  height: 88px;
  ...
}
```
Cek juga `.ug-img` yang punya child `.ug-badge { position: absolute }`.

---

### [OPT-03] Konfirmasi kategori `Pertanian` ke Zen
**File:** `data/umkm.json`
Dari 19 UMKM hanya ada 4 kategori: `Jasa`, `Perkebunan`, `Pertukangan`, `Peternakan`. Tidak ada `Pertanian`. Kemungkinan sengaja (semua usaha tani masuk Perkebunan), tapi perlu dikonfirmasi ke Zen apakah ada UMKM yang salah kategori.
**Aksi:** Tanya Zen, bukan tugas coding langsung.

---

### [OPT-04] `sitemap.xml` belum punya `<image:image>` untuk foto UMKM
**File:** `sitemap.xml`
19 UMKM punya `cover.webp` asli yang bisa diindex Google Images. Menambahkan `<image:image>` per URL bisa mendatangkan traffic tambahan dari Image Search.
**Prioritas:** Rendah, kerjakan setelah bug utama selesai.

---

## 🟡 MENUNGGU DATA LAPANGAN (tugas Zen)

- [ ] **Nomor kontak** Nyuwun Tulung (Kades, RW, RT, Bidan, Babinsa) — cara aktifkan: isi `href` di `index.html`, hapus atribut `data-kontak-publik`
- [ ] **Nama pengurus** organisasi (BPD, Takmir, PKK, Posyandu, Karang Taruna) — Ctrl+F nama jabatan di `index.html`, ganti `—` dengan nama asli
- [ ] **Jam buka asli** tiap UMKM — update field `jam` per UMKM di `umkm.json` (14/19 UMKM masih "Hubungi untuk jam buka")
- [ ] **Luas wilayah** & KK/penduduk terverifikasi — update di `index.html` section Data Wilayah
- [ ] **Foto hero beranda** — ganti `img/backgrounds/hero-bg.webp` dengan foto asli Ngemplak

---

## 🔵 GOOGLE SEARCH CONSOLE — sudah disubmit, masih nunggu

- [x] Sitemap sudah disubmit ke GSC
- [ ] **Belum terindeks** — normal untuk domain baru (4 hari–4 minggu). Tidak ada tindakan coding diperlukan.
  - Kalau belum ada setelah ~4 minggu: buka URL Inspection Tool → Request Indexing (sekali saja)
  - Kalau setelah 4 minggu masih nol: cek robots.txt dan noindex

---

## 🔵 WISHLIST — Nanti

- **Halaman Sentra Bibit** — butuh halaman terpisah, keluar dari SPA, butuh diskusi arsitektur dulu
- **Schema `BreadcrumbList`** di homepage
- **Domain `.id`** — keputusan Zen & perangkat dusun
- **Backlink lokal** — dari website Desa Samping, Kec. Kemiri, Kab. Purworejo

---

## 📌 URUTAN KERJA BERIKUTNYA

```
PRIORITAS 1 — Bug aktif — ✅ SEMUA SELESAI
  BUG-01  → Reset chip filter saat goBack()       ✅ Selesai
  BUG-02  → Ganti let history → navHistory        ✅ Selesai
  BUG-03  → Twitter Card summary_large_image      ✅ Selesai
  BUG-04  → Hapus setTimeout di goToUMKM()        ✅ Selesai

PRIORITAS 2 — Risiko teknis (minggu ini)
  RISIKO-01 → preload hero-bg.webp               (index.html — 1 baris)
  RISIKO-02 → buat manifest.json                 (file baru + index.html)
  RISIKO-03 → Cache-Control di vercel.json        (vercel.json)

PRIORITAS 3 — Konten UMKM
  KONTEN-01 → Tagline 19 UMKM                    (umkm.json + script.js + style.css)
  KONTEN-02 → Teks tombol Maps                   (index.html — 1 kata, 5 menit)

PRIORITAS 4 — Optimasi kecil (kapanpun)
  OPT-01  → Update stat hardcode 18 → 19         (index.html)
  OPT-02  → position: relative ke .uimg          (style.css)
  OPT-03  → Konfirmasi kategori Pertanian         (tanya Zen dulu)
  OPT-04  → <image:image> di sitemap.xml          (sitemap.xml)

--- menunggu data dari Zen ---
  D-01  → Nomor kontak → aktifkan tombol Nyuwun Tulung
  D-02  → Nama pengurus → isi tanda — di tab Pengurus
  D-03  → Jam buka asli 14 UMKM
  D-04  → Foto hero beranda → replace hero-bg.webp

--- pasif, tidak ada coding ---
  → Pantau GSC Page Indexing report
```
