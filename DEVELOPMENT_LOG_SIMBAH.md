# Development Log SIMBAH
> Sistem Informasi Masyarakat Bale Harian Ngemplak
> Dusun Ngemplak, Desa Samping, Kecamatan Kemiri, Kabupaten Purworejo, Jawa Tengah
> Dikelola: Zen | Dibangun: Claude (Anthropic)
> Terakhir diperbarui: 27 Juni 2026

---

## Tentang Dokumen Ini

Dokumen ini mencatat perjalanan pembangunan SIMBAH — dari brief pertama sampai kondisi live sekarang, dan rencana ke depan yang belum dieksekusi. Bukan dokumentasi teknis. Bukan tutorial. Ini catatan jujur: apa yang dikerjakan, apa yang diputuskan, apa yang ditolak, dan kenapa.

---

## A. ASAL USUL

### A.1 — Latar Belakang

SIMBAH lahir dari satu kebutuhan sederhana: Dusun Ngemplak butuh kehadiran digital yang bisa dirawat oleh orang biasa, bukan programmer, dengan biaya Rp0, dan bisa bertahan 5 tahun ke depan.

Referensi awal: **polaman.id** — diambil strukturnya, bukan warnanya. Target: "Polaman.id versi lebih modern, lebih minimalis, lebih bersih, dan lebih relevan untuk Dusun Ngemplak."

### A.2 — Nama & Identitas

| Elemen | Nilai |
|---|---|
| Nama brand | SIMBAH |
| Kepanjangan | Sistem Informasi Masyarakat Bale Harian Ngemplak |
| Tagline | Balai Dusun Digital untuk Warga Ngemplak |
| Logo | "N" abstrak hijau-emas (final, tidak direvisi) |
| Warna utama | Ivory `--iv`, Forest Green `--gr`, Bronze `--br` |
| Proporsi warna | Ivory 70% · Hijau 20% · Emas 10% |
| Karakter visual | Hangat, agraris, tenang, modern-tradisional |

### A.3 — Keputusan Awal yang Paling Penting

Brief awal menyebut **WordPress + Elementor**. Setelah evaluasi, keputusan dibalik total:

> **WordPress → Vanilla HTML/CSS/JS murni.**

Alasan: WordPress butuh hosting berbayar, plugin butuh update rutin, satu orang non-programmer tidak bisa merawatnya jangka panjang. Vanilla HTML bisa di-host gratis di GitHub Pages + Vercel, tidak butuh server, tidak butuh update otomatis, bisa diedit dengan drag-drop.

Ini keputusan paling krusial dalam seluruh proyek.

---

## B. FONDASI & ARSITEKTUR

### B.1 — Stack Final (Locked)

```
HTML + CSS + JS vanilla murni
Hosting  : GitHub Pages (primary) + Vercel mirror
Data     : data/umkm.json — sumber kebenaran tunggal UMKM
Navigasi : Single Page App — semua section di 1 index.html
Deploy   : drag-drop file ke GitHub repo → rebuild otomatis
```

**Tidak ada:** backend, database, login, node_modules, build tool, CI/CD, framework apapun.

### B.2 — Struktur File

```
(root)
├── index.html          ← satu-satunya halaman utama
├── 404.html            ← auto-redirect ke beranda
├── sitemap.xml         ← 1 beranda + 19 URL UMKM + image per UMKM
├── robots.txt
├── manifest.json
├── vercel.json         ← cache headers
├── css/style.css       ← semua styling
├── js/script.js        ← semua logika + data (AGENDA, INVENTARIS, KAS)
├── data/umkm.json      ← 19 UMKM
└── img/
    ├── branding/       ← logo, favicon, icon PWA
    ├── backgrounds/    ← hero-bg.webp
    └── umkm/           ← cover.webp + gallery per UMKM
```

### B.3 — Mekanisme Kunci

| Mekanisme | Cara kerja |
|---|---|
| `{{WA}}` inject | Script akhir `index.html` ganti semua placeholder dengan nomor WA utama |
| UMKM fetch | `muatDataUMKM()` baca `umkm.json` via `fetch()` |
| Navigasi | `nav('nama-section')` toggle class `.active` |
| Footer | `templateFooter()` + `FOOTER_SLOTS` — edit sekali, berlaku semua |
| SEO per-UMKM | `updateMetaUMKM()` update title/desc/canonical/OG/Schema dinamis |
| Slug | `slugify(name)` — konsisten antara path foto, sitemap, dan URL |

---

## C. PERJALANAN PENGEMBANGAN

### C.1 — Fase Konten & Data UMKM

**Yang dikerjakan:**
- Inventarisasi dan entry 19 UMKM ke `umkm.json`
- Penulisan ulang deskripsi 19 UMKM per karakter usaha (bukan generik)
- Penulisan `seoTitle` & `seoDesc` per UMKM — dalam batas karakter Google (title ≤70, desc ≤160)
- Penulisan `tagline` per UMKM
- Penulisan FAQ per UMKM — accordion, semua spesifik (tidak ada "Ya." generik)
- Pengumpulan dan upload foto: 19/19 UMKM sudah punya `cover.webp` + galeri (3–4 foto, 62 total)
- Internal linking `terkait` antar UMKM — 53 referensi, semua ID valid

**Keputusan konten penting:**
- Jam buka UMKM bibit → `"Fleksibel, hubungi WA"` (bukan jam kaku — kenyataan di lapangan: muat malam, kirim subuh)
- Kategori bibit → "Perkebunan" bukan "Pertanian" (bibit buah/keras/penghijauan = komoditas perkebunan)
- Data kosong → em dash `—`, bukan teks karangan
- Testimoni warga → **dihapus permanen** (tidak realistis kumpulkan 19 testimoni asli; kosong/generik menurunkan kredibilitas)

### C.2 — Fase SEO & Schema

**Yang dikerjakan:**
- `sitemap.xml` — 19 URL UMKM individual `?umkm=slug`, lastmod sinkron data live
- `sitemap.xml` — tambah `<image:image>` per UMKM (cover + title)
- Schema `LocalBusiness` + `FAQPage` dinamis per UMKM
- Schema `GovernmentOrganization` + `WebSite` statis di `<head>`
- Meta title, description, OG, Twitter Card per halaman dan per UMKM
- Twitter Card diupgrade dari `summary` → `summary_large_image`
- Heading semantik, preconnect, aria-label, loading lazy/eager
- Canonical domain → `simbahngemplak.vercel.app`
- Sitemap disubmit ke Google Search Console

### C.3 — Fase UI & Visual

**Yang dikerjakan:**
- Filter chip UMKM per kategori + active state
- Shuffle berbobot beranda — semua kategori terwakili
- Card UMKM — grid produk 2 kolom, field keterangan
- Hero beranda — padding dikompres, min-height 420px, ticker visible in-fold
- Trust strip beranda — rata-rata rating + total ulasan, kalkulasi otomatis dari `umkm.json`
- Trust strip desktop — masuk ke dalam hero (`div.hero-trust`), tersembunyi di mobile
- Mini card border — diperjelas (`1px solid #DDD7C8` + box-shadow)
- Banner CTA UMKM — "Usahamu belum ada di sini?" + tombol daftar via WA
- Footer — watermark SVG vektor, border-top emas, logo & teks proporsional
- Inventaris disclaimer — "data ilustrasi awal, belum real"

### C.4 — Fase Audit & Hardening (27 Juni 2026)

Audit total dilakukan — kode, SEO, aksesibilitas, keamanan. Hasilnya: 27 temuan (1 Critical, 4 High, 9 Medium, 8 Low, 5 Info). Setiap temuan dicek manual ke kode aktual sebelum dieksekusi — beberapa klaim audit ternyata sudah usang (auditor melihat versi kode sebelum fix).

**Yang dikerjakan:**

| Kode | Temuan | Fix |
|---|---|---|
| C-01 | XSS — `escapeHtml()` belum dipasang di render data UMKM | Dipasang di 12 titik render |
| H-02 | `<script>` tanpa `defer` — render-blocking | Tambah `defer` di script utama + inline |
| H-03 | Tidak ada `<noscript>` fallback | Tambah pesan fallback dengan warna brand |
| H-04 | `console.log` aktif di production | Tambah `const DEBUG = false`, semua log dibungkus |
| M-01 | 6 halaman dalam tidak punya `<h1>` — semantik salah | 6 heading diubah ke `<h1>` |
| M-02 | Google Fonts render-blocking ~300–800ms di 3G | Ganti ke `preload` non-blocking + noscript fallback |
| A11Y-01 | `--tx3` kontras 2.85 (butuh 4.5) — 29 tempat | Ganti ke `#5C6F64` di `:root` |
| A11Y-02 | 6 kartu Layanan Warga tidak bisa diakses keyboard | Tambah `tabindex`, `role`, handler Enter/Space |
| A11Y-03 | Tidak ada `:focus-visible` custom | Tambah 1 rule global |
| NAV-01 | Tombol back browser kadang lempar ke Beranda salah | Fix listener `popstate` |
| SEC-02 | `vercel.json` belum punya header keamanan standar | Tambah X-Frame-Options, CSP, dll |
| XSS-01 | Hasil pencarian "tidak ditemukan" sisip teks mentah ke innerHTML | Fix escaping |
| L-01 | Field `p` (harga) tidak pernah dirender — 75 entry | Dihapus dari `umkm.json` |
| L-02 | Field `testimoni: []` sisa fitur yang dihapus | Dihapus dari 19 UMKM |
| I-03 | Tidak ada validasi ID duplikat UMKM | Tambah cek otomatis di `muatDataUMKM()` |
| SEC-01 | Google Sheets Kas — verifikasi akses | **Terkonfirmasi Viewer-only** (login, guest, incognito — semua aman) |

**Sengaja tidak dieksekusi (bukan lupa):**
- L-03: Maskable icon — butuh redesain logo dengan safe-zone 40%, bukan sekadar edit JSON
- I-02: Ganti `alert()` ke toast — trade-off tidak sepadan untuk edge case jarang terjadi
- I-04: Disallow GitHub Pages di robots.txt — tidak bisa secara teknis (file sama di-deploy ke dua domain; canonical sudah menangani)

### C.5 — Fase Bug Visual Mobile (Sesi 7, 27 Juni 2026)

Zen lapor tampilan "jelek" di HP fisik setelah eksperimen menerapkan standar touch-target 44px.

| Kode | Temuan | Keputusan |
|---|---|---|
| UI-01 | `.ud-back` (40px) vs `.ud-share` (32px) — beda ukuran tidak disengaja | Fix: disamakan 36px, posisi simetris |
| UI-02 | `.nt-wa` ada `min-height: 44px`, `.nt-telp` tidak — 2 tombol beda tinggi | Kembalikan keduanya ke ukuran natural (padding-based) |
| UI-03 | `.fchip` dinaikkan ke `min-height: 44px` — kegedean di HP | Kembalikan ke `padding: 8px 12px` tanpa height dipaksa |

**Keputusan final Zen:** standar 44px touch-target **tidak diterapkan ketat** di elemen kecil (chip, tombol kontak) — keputusan sadar demi visual ramping. Bukan bug kalau ditemukan audit berikutnya.

---

## D. KONDISI SEKARANG

### D.1 — Skor Kondisi (27 Juni 2026)

| Aspek | Skor | Catatan |
|---|---|---|
| SEO | 95 | Schema dinamis, sitemap 100% sinkron data live |
| Maintainability | 90 | 1 sumber data per fitur, komentar jelas, workflow drag-drop terdokumentasi |
| Performance | 88 | Lazy-load benar, WebP, container CSS fixed-size (CLS rendah) |
| UI Konsistensi | 85 | Sistem warna/spacing rapi |
| UX Navigasi | 82 | Jelas, 1 bug popstate sudah difix |
| Accessibility | ~85 | Kontras + keyboard + focus sudah difix |
| Security | ~92 | Sheets Viewer-only terkonfirmasi, header Vercel ditambah |
| **Rata-rata** | **~88** | |

### D.2 — Status Item

| Status | Item |
|---|---|
| ✅ Selesai | Semua item coding — 0 outstanding |
| ⏳ Menunggu Zen | Nomor kontak Nyuwun Tulung (Kades, RW, RT 01, RT 02, Bidan, Babinsa) |
| ⏳ Menunggu Zen | Nama pengurus organisasi (BPD, Takmir, PKK, Posyandu, Karang Taruna) |
| ⏳ Menunggu Zen | Logo versi safe-zone 40% untuk maskable icon PWA (L-03, tidak mendesak) |
| 🔍 Dipantau | GSC indexing — checkpoint ~25 Juli 2026 |

### D.3 — Fitur yang Ditolak Permanen

Sudah diputuskan, tidak perlu diusulkan ulang:

| Fitur | Alasan |
|---|---|
| Login warga / dashboard admin | Butuh backend, tidak bisa dirawat 1 orang |
| Forum / chat warga | Butuh moderasi — WA sudah cukup |
| WA Gateway / notifikasi otomatis | API berbayar, risiko banned |
| Sistem surat-menyurat | Di luar scope |
| Booking inventaris | WA ke PJ lebih cepat |
| Galeri foto section terpisah | Sudah ada @ktoppenlestari, @lensangemplak di IG |
| Video / slider otomatis | Berat, tidak sesuai karakter visual |
| Kalender bulanan interaktif | Over-engineering untuk 1 event/bulan |
| Pengumuman darurat di website | Warga buka WA tiap menit, bukan website |
| PWA penuh + Service Worker | Risiko cache basi, kompleksitas tidak worth it |

---

## E. HORIZON — RENCANA BELUM DIEKSEKUSI

*Bukan ditolak — ditunda sampai ada kebutuhan riil atau kondisi yang mendukung.*

### E.1 — Segera (Menunggu Data Lapangan)

| Item | Syarat |
|---|---|
| Aktifkan nomor Nyuwun Tulung | Zen kumpulkan nomor → isi `href` di `index.html`, hapus `data-kontak-publik` |
| Isi nama pengurus organisasi | Zen kumpulkan nama → Ctrl+F jabatan di `index.html`, ganti `—` |

### E.2 — Jangka Menengah (Ada Kebutuhan, Belum Mendesak)

| Item | Catatan |
|---|---|
| Backlink lokal | Koordinasi dengan web Desa Samping / Kec. Kemiri / Kab. Purworejo — butuh outreach, bukan coding |
| Domain `.id` berbayar | Keputusan Zen & perangkat dusun — kandidat: `dusunngemplak.id` |
| Maskable icon PWA (L-03) | Butuh logo versi safe-zone 40%, bukan sekadar edit JSON |

### E.3 — Jangka Panjang (Revisit Kalau Ada SDM / Kebutuhan Riil)

| Item | Syarat sebelum dipertimbangkan |
|---|---|
| Schema `BreadcrumbList` | Ada struktur multi-level / domain `.id` + SSR/prerender |
| Halaman Sentra Bibit | Diskusi arsitektur — keluar dari SPA |
| Histori transaksi kas | Kalau Google Sheets sudah tidak cukup |
| Integrasi Pengaduan ke Nyuwun Tulung | Harus ada kejelasan siapa yang baca & follow-up |

---

## F. PRINSIP YANG TIDAK BOLEH DILUPAKAN

1. **SIMBAH adalah**: etalase UMKM + identitas dusun + informasi publik sederhana.
2. **SIMBAH bukan**: aplikasi administrasi, sistem pemerintahan, portal berita, super app.
3. **Filter fitur baru** — tolak kalau ada 1 jawaban "tidak":
   - Meningkatkan visibilitas UMKM atau memperkuat identitas Ngemplak?
   - Bisa dirawat tanpa backend, oleh 1–2 orang non-programmer?
   - Tidak bisa diselesaikan cukup lewat WhatsApp/IG/FB?
   - Warga akan benar-benar pakai, bahkan 5 tahun lagi?
4. **Definisi berhasil**: orang cari "Ngemplak" → ketemu SIMBAH di Google. UMKM dapat trafik nyata. Warga tahu agenda, percaya data kas, bangga dengan websitenya.
5. **Tidak diukur dari**: jumlah fitur, animasi, atau halaman.

---

*"2 minggu dari brief → web live, 19 UMKM terdaftar, skor 88/100. Vibecoding yang produktif."*
