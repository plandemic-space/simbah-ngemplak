# SIMBAH — Audit & Next Step

> Diperbarui: 25 Juni 2026 — audit total setelah baca semua dokumen (katalog v2, v3, profil sentra, panduan SEO, Excel data UMKM)
> Cara pakai: kerjakan dari atas ke bawah. Coret kalau sudah deploy & dicek live.

---

## ✅ SUDAH SELESAI

- [x] Domain canonical → `simbahngemplak.vercel.app` (OG, Twitter, Schema, sitemap, robots)
- [x] Sitemap — URL `?page=...` dihapus, 19 URL UMKM individual `?umkm=slug` ditambahkan
- [x] Heading semantik — `<div>` judul → `<h1>`/`<h2>`/`<h3>`
- [x] `preconnect` Google Fonts, `aria-label` tombol ikon, `loading="lazy/eager"` logo
- [x] SEO per-UMKM — title, desc, OG, Twitter, canonical, Schema `LocalBusiness` dinamis per UMKM
- [x] Schema `GovernmentOrganization` statis di `<head>` untuk profil dusun
- [x] Shuffle berbobot Beranda — semua kategori terwakili, tidak lagi 8 bibit pertama terus
- [x] Jam operasional — ganti "Buka 24 jam" → "Hubungi untuk jam buka" (kecuali yang memang ada jam asli)
- [x] Deskripsi 19 UMKM — ditulis ulang per karakter usaha, tidak lagi template generik
- [x] Filter chip `data-filter` — tidak lagi bergantung pada teks tombol
- [x] Data dari katalog PDF, v2, v3, Excel — produk spesifik, koreksi karakter & kategori per UMKM
- [x] Rahman Grosir Bibit masuk `id=3`, sitemap diupdate, slug bersih
- [x] Samuji & PRIMATANI — produk dilengkapi dari 1 → 4 item
- [x] FAQ per UMKM — field `faq` di `umkm.json`, render accordion di halaman detail, Schema `FAQPage`
- [x] `seoTitle` & `seoDesc` per UMKM — `updateMetaUMKM()` pakai field khusus, fallback ke format lama
- [x] Area layanan per UMKM — field `area` di `umkm.json`, tampil di info operasional, Schema `areaServed` spesifik per UMKM
- [x] Isron Furniture — deskripsi diperbaiki (sebelumnya < 200 karakter)
- [x] Meta `google-site-verification` dijaga — tidak boleh hilang saat update `index.html`

---

## 🔴 KERJAKAN BERIKUTNYA

### 1. Internal linking "UMKM Terkait"
**Kenapa penting:** Memperkuat SEO internal + UX — pengunjung halaman Heri Bibit bisa langsung loncat ke Khanza Bibit atau Trijaya Bibit tanpa balik ke daftar.
**Data:** Sudah ada di katalog v3 per UMKM (field "UMKM Terkait"), tinggal dipindahkan.
**Yang perlu dikerjakan:**
- Tambah field `terkait` (array of id) di `umkm.json`
- Render section "Usaha Terkait" di halaman detail UMKM (`script.js` + `index.html`)
- Styling card terkait di `style.css`

### 2. Sitemap — perlu dicek ulang setelah semua perubahan
**Catatan:** Setelah banyak perubahan data UMKM (koreksi slug, tambah Rahman id=3), perlu verifikasi semua 19 slug di sitemap cocok dengan slug yang dihasilkan fungsi `slugify()` di `script.js`. Kalau ada yang tidak cocok, link share UMKM itu tidak akan terbuka otomatis.
**Yang perlu dikerjakan:**
- Jalankan `slugify()` untuk semua 19 nama UMKM
- Bandingkan dengan yang ada di `sitemap.xml`
- Perbaiki yang tidak cocok

---

## 🟡 MENUNGGU DATA LAPANGAN (tugas Zen)

- [ ] **Foto asli** UMKM & dusun — sedang disiapkan *(begitu siap, ganti emoji galeri → `<img>` + `loading="lazy"` di `script.js`)*
- [ ] **Nomor kontak** Nyuwun Tulung (Kades, RW, RT, Bidan, Babinsa)
- [ ] **Nama pengurus** organisasi (BPD, Takmir, PKK, Posyandu, Karang Taruna)
- [ ] **Jam buka asli** tiap UMKM — sementara "Hubungi untuk jam buka"
- [ ] **Luas wilayah** & KK/penduduk terverifikasi

---

## 🔵 WISHLIST — Nanti setelah yang di atas beres

- **Halaman Sentra Bibit** — identitas terkuat Ngemplak, butuh halaman terpisah (keluar dari SPA)
- **Halaman kategori** (`/kategori/bibit-buah`, dst) — butuh arsitektur multi-halaman
- **Schema `WebSite` + `BreadcrumbList`** di homepage
- **Google Search Console** — submit sitemap, pantau keyword (tugas Zen, bukan coding)
- **Domain `.id`** — keputusan Zen & perangkat dusun
- **Backlink lokal** — dari website Desa Samping, Kec. Kemiri, Kab. Purworejo

---

## 📌 URUTAN KERJA BERIKUTNYA

```
1 → Cek & fix sitemap slug (cepat, ~10 menit)
2 → Internal linking UMKM Terkait (data sudah siap di katalog v3)
--- setelah foto dari Zen tiba ---
3 → Ganti emoji galeri → <img> asli + loading="lazy" di script.js
--- setelah nomor kontak dari Zen ---
4 → Aktifkan tombol Nyuwun Tulung di index.html
```
