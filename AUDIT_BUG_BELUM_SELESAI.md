# SIMBAH — Catatan Kerja & Status

> Diperbarui: **28 Juni 2026 (sesi 8 — Audit Kedua, semua temuan valid sudah dikerjakan)**
> Cara pakai: kerjakan dari atas ke bawah. Coret kalau sudah deploy & dicek live.

---

## 📊 SKOR KONDISI SAAT INI

| Aspek | Skor | Catatan singkat |
|---|---|---|
| SEO | 93/100 | Schema dinamis matang, sitemap sinkron, heading hierarchy sudah diperbaiki, title disinkronkan |
| Accessibility | 82/100 | Kontras & keyboard sudah diperbaiki. Gap minor: CSS monolitik |
| Performance | 86/100 | WebP, lazy-load, defer, preload, cache /data/ sudah dikonfigurasi |
| Best Practices | 90/100 | escapeHtml, noscript, DEBUG=false, defer inline sudah diperbaiki |
| Security | 92/100 | Header Vercel lengkap, X-Frame-Options duplikat sudah dihapus |
| UI/UX | 88/100 | Konsisten, tipografi bersih, komponen profesional |
| Maintainability | 91/100 | 1 sumber data per fitur, komentar sangat baik, WA_UTAMA terpusat |

**Rata-rata estimasi: ~89/100.**

---

## ✅ SUDAH SELESAI — Semua Sesi Sebelumnya

- [x] Domain canonical → `simbahngemplak.vercel.app`
- [x] Sitemap — 19 URL UMKM individual, `<image:image>` per UMKM
- [x] SEO per-UMKM — title, desc, OG, Twitter, canonical, Schema `LocalBusiness` + `FAQPage` dinamis
- [x] Schema `GovernmentOrganization` + `WebSite` statis di `<head>`
- [x] Shuffle berbobot Beranda — semua kategori terwakili
- [x] Deskripsi & FAQ 19 UMKM ditulis ulang
- [x] Filter chip UMKM + active state
- [x] Foto UMKM — 19/19 cover.webp + gallery (62 total)
- [x] Internal linking Usaha Terkait (53 referensi, semua ID valid)
- [x] Card Produk & Jasa — grid 2 kolom
- [x] Trust strip beranda — kalkulasi otomatis rating & ulasan dari `umkm.json`
- [x] Footer watermark SVG vektor + border emas
- [x] Banner CTA UMKM — "Usahamu belum ada di sini?"
- [x] Nomor kontak belum ada → "Nomor belum tersedia" (tidak fallback ke Zen)
- [x] `escapeHtml()` di semua titik render data UMKM
- [x] `defer` pada `<script src="js/script.js">`
- [x] `<noscript>` fallback
- [x] `DEBUG = false` untuk production
- [x] Google Fonts `index.html` → `preload + onload` non-blocking
- [x] `:focus-visible` global di CSS
- [x] Kontras `--tx3: #5C6F64` diperbaiki
- [x] 6 tombol Layanan Warga → `<button>` dengan `aria-label` + keyboard handler
- [x] `<h1>` untuk judul semua halaman dalam
- [x] Cache: img (1 tahun), css/js (1 hari) di `vercel.json`
- [x] Security headers lengkap di `vercel.json`
- [x] Google Sheets Kas — terkonfirmasi Viewer-only (dicek 3 kondisi, 27 Juni 2026)
- [x] Validasi ID duplikat di `muatDataUMKM()`
- [x] Tombol back browser (`popstate`) sudah ditangani
- [x] Fisher-Yates shuffle berbobot — implementasi lengkap
- [x] Field `testimoni` dan `p` (harga) dihapus dari `umkm.json`
- [x] UI-01/02/03: ukuran tombol back/share/chip dikembalikan ke natural (keputusan Zen)

### Sesi 28 Juni 2026 (Audit Kedua — semua dikerjakan sekaligus)

- [x] **[BUG-01]** WA PSC 119 (`6281126531190` → `628112653119`) di 2 tempat — nomor ambulans darurat
- [x] **[A11Y-01]** Search pill: tambah keydown handler Enter/Space di `script.js`
- [x] **[SEO-01]** Heading h1→h3 diperbaiki → h1→h2 (14 heading di Kas, Nyuwun Tulung, Tentang, Inventaris)
- [x] **[SEO-03]** `TITLE_DEFAULT` di `script.js` disinkronkan dengan `<title>` di `index.html`
- [x] **[PERF-01]** Cache header `/data/` ditambah di `vercel.json` (`max-age=3600`)
- [x] **[SEC-01]** `X-Frame-Options: SAMEORIGIN` dihapus dari `vercel.json` (sudah ditangani `frame-ancestors 'none'` di CSP)
- [x] **[JS-01]** `defer` dihapus dari inline script `index.html` (defer tidak berlaku untuk inline script)
- [x] **[A11Y-02]** Google Fonts `404.html` → pola non-blocking (preload + onload + noscript)
- [x] **[MANIFEST-01]** `scope`, `lang: "id"`, `orientation` ditambah ke `manifest.json`
- [x] **[MAINT-01]** Komentar "GitHub Pages" di `404.html` diperbarui
- [x] **[INFO-02]** `rating: "0"` → `rating: null` di 6 UMKM; kondisi JS disederhanakan (cukup `u.rating`)
- [x] **[INFO-03]** `loading="lazy"` ditambah ke footer logo di `templateFooter()`

**Ditinjau, sengaja tidak dikerjakan:**
- **[SEO-02]** postalCode `55751` vs `54262` — **menunggu verifikasi Pak Zen** dulu (lihat bagian Menunggu Data)
- **[PERF-02]** Critical CSS inline — pekerjaan besar, gain kecil di koneksi normal. Tunda ke nanti
- **[L-03]** Maskable icon — butuh aset logo dengan safe-zone 40%. Menunggu Zen siapkan logo versi baru

---

## 🟡 MENUNGGU DATA LAPANGAN (tugas Pak Zen)

- [ ] **[SEO-02] Verifikasi postalCode Kemiri**
  Schema.org di `index.html` pakai `"55751"`, tapi `umkm.json` (alamat Plandemic Space) pakai `"54262"`.
  → Cek kode pos resmi Desa Samping, Kec. Kemiri, Kab. Purworejo (bisa lewat situs pos.id atau tanya ke kelurahan).
  → Kalau `54262` benar: update baris 72 `index.html` (`"postalCode": "55751"` → `"54262"`).

- [ ] **Nomor kontak** Nyuwun Tulung (Kades, RW, RT 01, RT 02, Bidan, Babinsa)
  → Cara aktifkan: isi `href` di `index.html`, hapus atribut `data-kontak-publik` dari tombol itu

- [ ] **Nama pengurus** organisasi (BPD, Takmir, PKK, Posyandu, Karang Taruna)
  → Ctrl+F nama jabatan di `index.html`, ganti `—` dengan nama asli

- [ ] **Logo maskable** — versi dengan margin/safe-zone 40% untuk PWA launcher Android
  → Logo "N" saat ini mengisi hampir penuh kanvas, akan terpotong kalau langsung di-set maskable

---

## 🔵 GOOGLE SEARCH CONSOLE — pantau terus

- [x] Sitemap sudah disubmit ke GSC
- [ ] Indexing masih proses (normal 4 hari–4 minggu)
  → Kalau setelah 4 minggu nol: buka URL Inspection Tool → Request Indexing
  → Deadline pantau: ~25 Juli 2026

---

## 🔵 WISHLIST — Nanti (tidak ada urgensi sekarang)

| Item | Catatan |
|---|---|
| Schema `BreadcrumbList` | Revisit kalau ada domain `.id` + SSR/prerender |
| Domain `.id` | Keputusan Zen & perangkat dusun |
| Backlink lokal | Koordinasi dengan web Desa Samping / Kec. Kemiri / Kab. Purworejo |
| Halaman Sentra Bibit | Butuh diskusi arsitektur, keluar dari SPA |
| Critical CSS inline | Gain kecil di koneksi normal, pekerjaan besar — tunda |

---

## 📌 KEPUTUSAN PERMANEN (tidak perlu didiskusikan ulang)

- **44px touch-target** tidak diterapkan ketat untuk chip/tombol kontak — keputusan Zen, bukan bug
- **`alert()` error UMKM tidak ditemukan** — dibiarkan, edge case jarang, trade-off tidak sepadan
- **robots.txt tidak disallow GitHub Pages** — keterbatasan arsitektur statis, canonical sudah menangani
- **Harga UMKM** — field `p` dihapus permanen, harga disampaikan via WA bukan website
- **Section Testimoni** — dihapus permanen
- **44px touch-target chip filter** — dikembalikan ke natural padding, keputusan visual Zen

---

```
Status coding: 0 item outstanding ✅
Menunggu keputusan/data Zen: 4 item (postalCode, kontak, pengurus, maskable icon)
Pantau: GSC indexing (~25 Juli 2026)
```
