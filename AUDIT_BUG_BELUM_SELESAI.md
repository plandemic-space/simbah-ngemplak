# SIMBAH — Audit & Next Step

> Diperbarui: 26 Juni 2026 (revisi 5) — perbaikan tampilan nomor kontak Pemerintahan Desa yang masih format "xxxx"
> Cara pakai: kerjakan dari atas ke bawah. Coret kalau sudah deploy & dicek live.

---

## ✅ SUDAH SELESAI

- [x] Domain canonical → `simbahngemplak.vercel.app` (OG, Twitter, Schema, sitemap, robots)
- [x] Sitemap — URL `?page=...` dihapus, 19 URL UMKM individual `?umkm=slug` ditambahkan
- [x] Sitemap slug — dicek ulang, semua 19 slug 100% match dengan output `slugify()` di `script.js`
- [x] Sitemap lastmod — diupdate ke 2026-06-26 di semua URL
- [x] Heading semantik — `<div>` judul → `<h1>`/`<h2>`/`<h3>`
- [x] `preconnect` Google Fonts, `aria-label` tombol ikon, `loading="lazy/eager"` logo
- [x] SEO per-UMKM — title, desc, OG, Twitter, canonical, Schema `LocalBusiness` dinamis per UMKM
- [x] Schema `GovernmentOrganization` statis di `<head>` untuk profil dusun
- [x] Schema `WebSite` statis di `<head>` — sinyal ke Google bahwa ini website resmi. Tidak pakai `potentialAction: SearchAction` karena search box SIMBAH murni JS sisi klien, tidak punya endpoint pencarian via URL — menambahkannya tanpa endpoint nyata akan jadi structured data yang salah.
- [x] Shuffle berbobot Beranda — semua kategori terwakili, tidak lagi 8 bibit pertama terus
- [x] Jam operasional — ganti "Buka 24 jam" → "Hubungi untuk jam buka" (kecuali yang ada jam asli)
- [x] Plandemic Space jam — diperbarui ke "Setiap hari, hubungi WA untuk ketersediaan"
- [x] Deskripsi 19 UMKM — ditulis ulang per karakter usaha, tidak lagi template generik
- [x] Filter chip `data-filter` — tidak lagi bergantung pada teks tombol
- [x] Data dari katalog PDF, v2, v3, Excel — produk spesifik, koreksi karakter & kategori per UMKM
- [x] Rahman Grosir Bibit masuk `id=3`, sitemap diupdate, slug bersih
- [x] Samuji & PRIMATANI — produk dilengkapi dari 1 → 4 item
- [x] FAQ per UMKM — field `faq` di `umkm.json`, render accordion di halaman detail, Schema `FAQPage`
- [x] FAQ 19 UMKM — ditulis ulang semua, tidak ada lagi jawaban "Ya." generik. Fokus ke pertanyaan yang menjawab keraguan calon pembeli (harga, waktu, cara pesan, kondisi barang, perbedaan antar usaha serupa)
- [x] `seoTitle` & `seoDesc` per UMKM — `updateMetaUMKM()` pakai field khusus, fallback ke format lama
- [x] `seoTitle` & `seoDesc` Plandemic Space — **dicek ulang ke `umkm.json`, sebelumnya masih versi lama** ("Servis Laptop, Komputer dan Printer" tanpa mention jual-beli second) **walau sudah sempat tercatat selesai**. Sudah dibenarkan sekarang: seoTitle jadi "Plandemic Space | Servis & Jual Beli HP, Laptop, Printer di Kemiri Purworejo", seoDesc menambahkan "jual beli HP & laptop second" — konsisten dengan field `desc` dan daftar produk yang sudah ada.
- [x] Area layanan per UMKM — field `area` di `umkm.json`, tampil di info operasional, Schema `areaServed` spesifik per UMKM
- [x] Isron Furniture — deskripsi diperbaiki (sebelumnya < 200 karakter)
- [x] Meta `google-site-verification` dijaga — tidak boleh hilang saat update `index.html`
- [x] Disclaimer Agenda — label "contoh ilustrasi" tampil di Beranda & halaman Agenda penuh
- [x] Disclaimer Kas — label "ilustrasi sementara" tampil di Beranda & halaman Kas penuh
- [x] Foto UMKM — 19/19 UMKM sudah punya `cover.webp` + gallery (3–4 foto), field `cover` & `galeri` di `umkm.json` sudah pakai path `img/umkm/...`
- [x] Internal linking "Usaha Terkait" — field `terkait` (array of id) ditambah ke semua 19 UMKM
- [x] Usaha Terkait — diganti dari card scroll horizontal ke list vertikal compact tanpa foto (`script.js` + `style.css`). Class baru: `.terkait-list`, `.terkait-item`, `.terkait-ico`, dll
- [x] Hapus section Testimoni Warga — dihapus dari `index.html` & `script.js`. Field `testimoni` di `umkm.json` dibiarkan ada (tidak dirender)
- [x] Card Produk & Jasa — redesign total ke grid 2 kolom, field `k` (keterangan) ditambah ke semua produk, label "Hubungi WA" per produk dihapus
- [x] Plandemic Space — Giling Tepung diganti Jual Beli HP/Laptop Second (`📲`)
- [x] Bibit Cabai Alip Sihmanto — emoji Cabai Merah (`🌱`) dan Cabai Keriting (`🌿`) dirapikan, tidak duplikat
- [x] Urutan konten halaman detail UMKM — Tombol WA bawah dipindah ke tepat setelah FAQ, Usaha Terkait dipindah ke paling bawah (`index.html`)
- [x] **Nomor kontak Pemerintahan Desa (Nyuwun Tulung) — format `0822-xxxx-xxxx` diganti jadi teks "Nomor belum tersedia"**. Sebelumnya 5 kontak (Kades, Kadus, RW, RT 01, RT 02) menampilkan nama asli + nomor berformat setengah-jadi (`08xx-xxxx-xxxx`) sebagai teks statis biasa — tombol WA/Telp-nya memang sudah benar dinonaktifkan lewat `data-kontak-publik`, tapi teks nomor di sampingnya tidak ikut disamarkan dan berpotensi terlihat seperti nomor asli yang formatnya aneh. Dikonfirmasi ke Zen: nama-nama tersebut **asli**, hanya nomornya yang belum ada — jadi nama dipertahankan, hanya teks nomor yang diganti. Catatan kaki di bagian bawah section juga diperbarui agar tidak menyebut "xxxx" lagi.
- [x] **`README.md` — dokumentasi usang dibenahi total**, ditemukan saat audit menyeluruh (bukan sekadar baca AUDIT lama, tapi cek tiap file satu per satu). Yang dibenarkan:
  - Struktur folder `img/` di README masih versi lama (`img/logo.png`, `img/hero-bg.webp` langsung di root) — sudah diupdate ke struktur aktual (`img/branding/`, `img/backgrounds/`, `img/about/`, `img/umkm/`)
  - Klaim "Belum ada folder `img/umkm/` — UMKM masih pakai emoji" — **sudah tidak benar sejak beberapa sesi lalu**, foto 19/19 sudah lengkap dan live. Section ini diganti jadi dokumentasi struktur foto yang sudah ada, bukan panduan "nanti kalau sudah siap"
  - Tabel "Status Saat Ini" tanggalnya `25 Juni` (kemarin), jumlah UMKM masih `18`, baris "Foto UMKM ⏳ Masih emoji" kontradiksi langsung dengan kode aktual — semua diperbarui + ditambah baris status GSC

---

## 🔵 REDESIGN VISUAL UMKM — Perlu Brief Tersendiri

Sudah disepakati untuk dikerjakan, tapi butuh keputusan visual dulu sebelum eksekusi. Cakupan yang akan dibahas:

- **Grid halaman UMKM** — kartu lebih besar, foto lebih dominan, info lebih readable
- **Halaman detail UMKM** — layout cover foto, strip info, section produk

> Diskusikan di sesi tersendiri sebelum mulai coding. Belum dimulai.

---

## 🟡 MENUNGGU DATA LAPANGAN (tugas Zen)

- [ ] **Nomor kontak** Nyuwun Tulung (Kades, RW, RT, Bidan, Babinsa) — cara aktifkan: isi `href` di `index.html` dengan nomor asli, hapus atribut `data-kontak-publik`
- [ ] **Nama pengurus** organisasi (BPD, Takmir, PKK, Posyandu, Karang Taruna) — cara isi: Ctrl+F nama jabatan di `index.html`, ganti `—` dengan nama asli
- [ ] **Jam buka asli** tiap UMKM — update field `jam` per UMKM di `umkm.json` (14 UMKM masih "Hubungi untuk jam buka")
- [ ] **Luas wilayah** & KK/penduduk terverifikasi — update di `index.html` section Data Wilayah
- [ ] **Foto hero beranda** — masih ilustratif, ganti dengan foto asli Ngemplak (replace `img/backgrounds/hero-bg.webp`)

---

## 🔵 GOOGLE SEARCH CONSOLE — sudah disubmit, masih nunggu

- [x] Sitemap `https://simbahngemplak.vercel.app/sitemap.xml` sudah disubmit ke GSC.
- [ ] **Belum terindeks** — ini masih dalam rentang waktu normal. Domain baru biasanya butuh 4 hari–4 minggu untuk mulai diindeks tanpa bantuan backlink eksternal; submit sitemap tidak menjamin proses jadi instan, bahkan request crawl manual pun tidak instan.
  - Cek status di GSC → **Page Indexing report** → kalau ada baris "Discovered – currently not indexed", itu cuma soal antrean/crawl budget, bukan error.
  - Boleh bantu sedikit: buka **URL Inspection Tool**, masukkan URL homepage, klik **Request Indexing** sekali. Jangan diulang-ulang di URL yang sama — Google mencatat permintaan pertama dan mengabaikan duplikat dalam siklus crawl yang sama, kuota harian juga terbatas.
  - Kalau setelah ~4 minggu masih nol sama sekali, baru perlu dicek ulang teknis (robots.txt, noindex, server). Sejauh ini tidak ditemukan blokir di kode.

---

## 🔵 WISHLIST — Nanti setelah yang di atas beres

- **Halaman Sentra Bibit** — identitas terkuat Ngemplak, butuh halaman terpisah (keluar dari SPA), butuh diskusi arsitektur
- **Halaman kategori** (`/kategori/bibit-buah`, dst) — butuh arsitektur multi-halaman
- **Schema `BreadcrumbList`** di homepage
- **Domain `.id`** — keputusan Zen & perangkat dusun
- **Backlink lokal** — dari website Desa Samping, Kec. Kemiri, Kab. Purworejo

---

## 📌 URUTAN KERJA BERIKUTNYA

```
1 → Brief & eksekusi redesign visual UMKM (index.html + script.js + style.css)

--- menunggu data dari Zen ---
2 → Nomor kontak → aktifkan tombol Nyuwun Tulung di index.html
3 → Nama pengurus → isi tanda — di index.html tab Pengurus
4 → Foto hero beranda → replace img/backgrounds/hero-bg.webp

--- menunggu Google (pasif, tidak ada tindakan coding) ---
5 → Pantau Page Indexing report di GSC, sitemap sudah disubmit
```
