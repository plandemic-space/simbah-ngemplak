# SIMBAH — Audit & Next Step

> Diperbarui: **27 Juni 2026 (sesi 6 — Audit Profesional baru, sebagian sudah dikerjakan)** — gabungan checklist lama + hasil Audit Total (kode, SEO, a11y, security) + hasil cross-check `AUDIT_SIMBAH_PROFESSIONAL.md`.
> Cara pakai: kerjakan dari atas ke bawah per section. Coret kalau sudah deploy & dicek live.

---

## 📊 SKOR KONDISI SAAT INI (hanya kategori yang relevan untuk SIMBAH)

| Aspek | Skor | Catatan singkat |
|---|---|---|
| SEO | 95 | Sangat matang — Schema dinamis, sitemap 100% sinkron data live |
| Maintainability | 90 | 1 sumber data per fitur, komentar jelas, workflow drag-drop terdokumentasi |
| Performance | 88 | Lazy-load benar, WebP, container CSS sudah fixed-size (CLS rendah) |
| UI Konsistensi | 85 | Sistem warna/spacing rapi, kurang di state focus |
| UX Navigasi | 82 | Jelas, tapi ada 1 bug nyata di tombol back browser |
| Accessibility | 70 | Kontras teks kecil & keyboard access masih ada gap nyata |
| Security (sesuai konteks: statis, tanpa backend) | 88 | Google Sheets Kas sudah dicek & terkonfirmasi Viewer-only (27 Juni 2026) |

**Rata-rata: 85/100.** Skor ini sudah dipangkas dari kategori yang nggak relevan (database, backend, login, build-tool) — itu sengaja nggak ada sesuai Roadmap, jadi nggak dihitung sebagai "kekurangan". Jalur realistis ke 90+ ada di section paling bawah.

---

## ✅ SUDAH SELESAI

- [x] Domain canonical → `simbahngemplak.vercel.app`
- [x] Sitemap — 19 URL UMKM individual `?umkm=slug`, lastmod 2026-06-26
- [x] **[OPT-04]** `sitemap.xml` — tambah `<image:image>` per 19 UMKM (cover.webp + title), lastmod 2026-06-27
- [x] Heading semantik, preconnect, aria-label, loading lazy/eager
- [x] SEO per-UMKM — title, desc, OG, Twitter, canonical, Schema `LocalBusiness` + `FAQPage` dinamis
- [x] Schema `GovernmentOrganization` + `WebSite` statis di `<head>`
- [x] Schema `LocalBusiness` field `image` → `img/branding/logo.png`
- [x] Shuffle berbobot Beranda — semua kategori terwakili
- [x] Jam operasional — display "Fleksibel, hubungi WA" untuk UMKM bibit (buka subuh/malam), bukan jam kaku
- [x] Deskripsi 19 UMKM ditulis ulang per karakter usaha
- [x] Filter chip `data-filter` + active state
- [x] Data produk spesifik, koreksi karakter & kategori
- [x] Rahman Grosir Bibit masuk `id=3`
- [x] FAQ per UMKM — accordion, Schema `FAQPage`, semua ditulis ulang (tidak ada "Ya." generik)
- [x] seoTitle & seoDesc per UMKM — dalam batas karakter Google (title ≤70, desc ≤160)
- [x] Area layanan per UMKM — field `area`, tampil di info operasional, Schema `areaServed`
- [x] Disclaimer Agenda & Kas
- [x] Foto UMKM — 19/19 sudah `cover.webp` + gallery (3–4 foto, 62 total)
- [x] Internal linking Usaha Terkait — field `terkait` (53 referensi, semua ID valid)
- [x] Hapus section Testimoni Warga
- [x] Card Produk & Jasa — grid 2 kolom, field `keterangan`, label WA per produk dihapus
- [x] Nomor kontak belum ada → "Nomor belum tersedia" (tidak fallback ke Zen)
- [x] **[BUG-01]** Filter chip reset ke "Semua" saat `goBack()` & `nav('umkm')`
- [x] **[BUG-02]** Variable `history` → `navHistory`
- [x] **[BUG-03]** Twitter Card `summary` → `summary_large_image`
- [x] **[BUG-04]** Hapus `setTimeout` 50ms di `goToUMKM()`
- [x] **[RISIKO-01]** Preload `hero-bg.webp`
- [x] **[RISIKO-02]** `manifest.json` + theme-color
- [x] **[RISIKO-03]** Cache-Control img/css/js di `vercel.json`
- [x] **[KONTEN-01]** Tagline 19 UMKM — field `tagline`, render `#ud-tagline`
- [x] **[KONTEN-02]** Teks tombol Maps → "📍 Lihat Maps & Ulasan"
- [x] **[OPT-01]** Stat hardcode `18` → `19`
- [x] **[OPT-02]** `.uimg` & `.ug-img` sudah punya `position: relative`
- [x] **[OPT-03]** Kategori "Pertanian" → tidak perlu ditambah (semua UMKM bibit masuk "Perkebunan", keputusan final)

### Sesi 27 Juni 2026 (pagi)
- [x] SEO `index.html` — `<title>`, meta description, OG/Twitter desc, Schema description disinkronkan
- [x] Footer watermark — SVG vektor bersih, opacity 13%, rotate -15°
- [x] Footer border-top emas tipis, ukuran logo & teks dinaikkan sedikit
- [x] Banner CTA UMKM — "Usahamu belum ada di sini?" + tombol "Daftar via WA →"
- [x] Inventaris disclaimer — "data ilustrasi awal, belum real"

### Sesi 27 Juni 2026 (sore)
- [x] Trust strip beranda — kalkulasi otomatis rata-rata rating & total ulasan dari `umkm.json`
- [x] Trust strip warna — angka hijau, bintang & plus emas
- [x] Desktop trust strip — pindah masuk ke dalam hero
- [x] Hero desktop padding dikompres
- [x] Mini card border diperjelas

### Sesi 27 Juni 2026 (malam) — Audit Total
- [x] **[SEC-01]** Cek sharing setting 4 Google Sheets Kas — **terkonfirmasi Viewer-only**.
      Dicek 3 kondisi: login sendiri (View only), belum login/Guest (Hanya lihat), dan mode
      Incognito (Hanya lihat) — ketiganya konsisten tidak bisa edit. Tidak ada tindakan lanjutan
      di sisi Google Drive. SEC-03 (ganti bentuk URL) jadi opsional, bukan wajib lagi.

### Sesi 27 Juni 2026 (sesi 6) — Cross-check `AUDIT_SIMBAH_PROFESSIONAL.md`
> Zen upload audit baru dari sumber independen (27 temuan: 1 Critical, 4 High, 9 Medium, 8 Low,
> 5 Info). Setiap temuan dicek manual ke kode aktual di zip sebelum dieksekusi — beberapa klaim
> audit ternyata **sudah usang** (auditor melihat versi kode sebelum sesi 5): H-01 (CSP/security
> headers), M-06 (button semantik), M-07 (focus-visible), L-06 (width/height img) semuanya
> **sudah benar di kode**, bukan bug nyata. Yang benar-benar valid dan sudah dikerjakan sesi ini:

- [x] **[C-01]** XSS — `escapeHtml()` sudah ada (dipakai di search query sejak XSS-01) tapi belum
      dipasang di render data UMKM dari `umkm.json`: card grid, card beranda, cover detail, rating
      pill, FAQ, galeri, produk, usaha terkait, dan hasil search untuk data UMKM/agenda/inventaris.
      → Fix: `escapeHtml()` dipasang di semua titik render `umkm.json` di atas (12 lokasi).
- [x] **[H-02]** `<script src="js/script.js">` tanpa `defer` — render-blocking.
      → Fix: tambah `defer` di script utama DAN inline script `{{WA}}` (supaya urutan eksekusi
      tetap terjaga — `defer` menjamin urutan dokumen tetap dipatuhi).
- [x] **[H-03]** Tidak ada `<noscript>` fallback kalau JS diblokir browser.
      → Fix: tambah pesan fallback pakai warna brand (`#F5F0E8` / `#1A2E23`) tepat setelah `<body>`.
- [x] **[H-04]** `console.log`/`console.warn` aktif di production, bocorkan struktur ID/elemen internal.
      → Fix: tambah `const DEBUG = false` di atas, semua `log`/`warn` debug dibungkus `if (DEBUG)`.
      `console.error` untuk error fetch kritikal TETAP aktif (bukan info disclosure berbahaya).
- [x] **[M-01]** `<h2 class="pttl">` jadi judul utama 5 halaman dalam (Agenda, Lapak Warga, Kas,
      Inventaris, Nyuwun Tulung) + `<h2 class="tentang-name">` di Tentang — tidak ada `<h1>` sendiri.
      → Fix: 6 heading judul halaman diubah ke `<h1>` (class CSS tidak berubah, cuma tag semantik).
- [x] **[M-02]** Google Fonts `<link rel="stylesheet">` langsung — render-blocking ~300–800ms di 3G.
      → Fix: ganti jadi `rel="preload" as="style" onload="this.rel='stylesheet'"` + `<noscript>`
      fallback. Sekalian **[I-01]**: weight `600` Lora dihapus dari URL (dicek via Python — cuma
      weight `700` yang benar-benar dipakai di seluruh `style.css`).
- [x] **[L-01]** Field `p` (harga, isinya selalu `"Hubungi WA"`, tidak pernah dirender) dihapus dari
      75 entry produk di `umkm.json`.
- [x] **[L-02]** Field `testimoni: []` (sisa dari section yang sudah dihapus permanen) dihapus dari
      19 UMKM di `umkm.json`.
- [x] **[I-03]** Tidak ada validasi ID duplikat — kalau Zen tambah UMKM baru dengan id yang sudah
      dipakai, akan tabrakan diam-diam. → Fix: tambah cek otomatis di `muatDataUMKM()`, kalau ada
      ID duplikat langsung `console.error` jelas (bukan diam-diam gagal).

**Ditinjau tapi SENGAJA TIDAK dieksekusi (bukan lupa):**
- **[L-03]** Manifest tanpa `purpose: maskable` icon — **butuh aset gambar baru** dengan safe-zone
      40%, logo "N" saat ini mengisi hampir penuh kanvas tanpa margin. Menandai icon yang ada sebagai
      `maskable` tanpa redesain ulang akan membuat logo terpotong parah di launcher Android — lebih
      buruk dari kondisi sekarang. **Menunggu Zen siapkan versi logo dengan margin aman**, baru di-apply.
- **[I-02]** `alert()` untuk error "UMKM tidak ditemukan" — audit sendiri menandai prioritas Info/edge
      case jarang terjadi. Ganti ke toast notification butuh komponen UI baru untuk dampak yang kecil.
      Trade-off tidak sepadan, dibiarkan sesuai filter "simplicity over completeness".
- **[I-04]** `robots.txt` tidak disallow domain GitHub Pages — secara teknis **tidak bisa** dilakukan
      karena file yang sama di-deploy ke kedua domain (Vercel + GH Pages); disallow per-domain butuh
      server-side logic yang keluar dari arsitektur static SPA. Canonical tag sudah menangani ini dengan
      benar — bukan bug, ini limitasi arsitektur yang sudah dimitigasi.
- **M-03, M-04, M-05, M-08, M-09** — semuanya trade-off arsitektur yang sudah disadari & didokumentasikan
      di Roadmap (SPA crawlability, JSON scraping, cache-busting foto, inline onclick untuk maintainability
      non-programmer). Tidak ada tindakan kode lebih lanjut yang masuk akal sekarang.

---

## 🔴 BARU — DARI AUDIT TOTAL (27 Juni 2026, malam) — KERJAKAN DULUAN

### Perbaikan kode — prioritas tinggi
- [x] **[A11Y-01]** Kontras teks kecil gagal standar baca — `--tx3` (#7A8E82) cuma 2.85–3.08 rasio kontras
      (butuh 4.5). Dipakai di label bottom nav, label "Alamat/Telepon", tanggal update kas, dll (29 tempat).
      → Fix: ganti `--tx3` di `:root` jadi warna lebih gelap (±`#5C6F64`), otomatis berlaku semua halaman.
- [x] **[A11Y-02]** 6 kartu "Layanan Warga" di Beranda (UMKM/Agenda/Nyuwun Tulung/Kas/Inventaris/Tentang)
      tidak bisa diakses keyboard — `<div onclick>` tanpa `tabindex`/`role="button"`.
      → Fix: tambah `tabindex="0" role="button" aria-label="..."` + handler Enter/Space, atau ganti ke `<button>`.
- [x] **[NAV-01]** Tombol back FISIK browser (bukan tombol "← Kembali" SIMBAH) kadang melempar user balik
      ke Beranda alih-alih halaman sebelumnya yang benar. Reproduksi: Beranda → Agenda → klik hasil
      search UMKM → tekan back browser → harusnya balik ke Agenda, malah ke Beranda.
      → Lokasi: `js/script.js` listener `popstate` (~baris 1893).

### Perbaikan kode — prioritas sedang
- [x] **[A11Y-03]** Tidak ada style `:focus-visible` custom di seluruh CSS — keyboard user sulit lihat
      posisi fokusnya. Fix: tambah 1 rule global `:focus-visible { outline: 2px solid var(--gr2); outline-offset:2px; }`.
- [x] **[SEC-02]** `vercel.json` belum punya header keamanan standar (X-Frame-Options, CSP, Referrer-Policy,
      HSTS) — cuma ada `X-Content-Type-Options`. *Catatan: ini HANYA bisa diperbaiki di sisi Vercel,
      GitHub Pages tidak mendukung custom header sama sekali (sudah dicek dokumentasinya).*
- [x] **[XSS-01]** Kotak pencarian: kalau hasil "tidak ditemukan", teks ketikan user disisip mentah ke
      `innerHTML` tanpa escaping (`js/script.js` ~baris 1762). Saat ini cuma berdampak ke diri sendiri
      (self-XSS, tidak ada jalur share via link), tapi murah untuk diperbaiki sekarang.
- [x] **[SEC-03] (opsional, bukan wajib lagi)** — Setelah SEC-01 terkonfirmasi aman, boleh tetap ganti
      link `/edit?gid=` jadi format view-only (`&rm=minimal` atau Publish-to-web) sebagai pengaman
      tambahan kosmetik — tapi permission Google-nya sendiri sudah mengunci, jadi ini hanya rapi-rapi,
      tidak mendesak.

### Perbaikan kode — boleh nanti (low priority)
- [x] **[DOC-01]** Komentar di `js/script.js` baris ~1031 ada kalimat yang nggak selesai ditulis (sudah
      dicek pakai `node -c`, TIDAK bikin error, cuma typo dokumentasi). Selesaikan atau hapus saja.
- [x] **[DOC-02]** Komentar & README masih nyebut "fetch butuh Laragon/localhost" — sebagian usang karena
      sekarang udah live di GitHub Pages/Vercel. Update jadi: "butuh server HTTP, sudah otomatis terpenuhi
      di hosting; testing lokal pakai `python -m http.server`, bukan klik dua kali file."
- [x] **[PERF-01]** Tag `<img>` (statis & JS-generated) belum ada atribut `width`/`height` eksplisit.
      Dampak kecil karena semua container sudah fixed-size di CSS, tapi tetap best practice ditambah.
- [x] **[UX-01]** Halaman 404 auto-redirect 5 detik tanpa indikator countdown visual. Opsional, dampak kecil.

---

## 🟡 MENUNGGU DATA LAPANGAN (tugas Zen)

- [ ] **Nomor kontak** Nyuwun Tulung (Kades, RW, RT 01, RT 02, Bidan, Babinsa)
      → cara aktifkan: isi `href` di `index.html`, hapus atribut `data-kontak-publik`
- [ ] **Nama pengurus** organisasi (BPD, Takmir, PKK, Posyandu, Karang Taruna)
      → Ctrl+F nama jabatan di `index.html`, ganti `—` dengan nama asli
- [ ] **Foto hero beranda** → keputusan: tetap ilustrasi; ganti hanya kalau ada foto asli Ngemplak yang jauh lebih bagus

---

## 🔵 GOOGLE SEARCH CONSOLE — pantau terus

- [x] Sitemap sudah disubmit ke GSC
- [ ] Indexing masih proses (normal 4 hari–4 minggu)
      → kalau setelah 4 minggu nol: buka URL Inspection Tool → Request Indexing

---

## 🔵 WISHLIST — Nanti (tidak ada urgensi sekarang)

| Item | Catatan |
|---|---|
| Schema `BreadcrumbList` | Revisit kalau ada domain `.id` + SSR/prerender |
| Domain `.id` | Keputusan Zen & perangkat dusun |
| Backlink lokal | Koordinasi dengan web Desa Samping / Kec. Kemiri / Kab. Purworejo |
| Halaman Sentra Bibit | Butuh diskusi arsitektur, keluar dari SPA |

---

## 🎯 JALUR REALISTIS KE SKOR 90+ (bukan 100 — sebagian nggak relevan untuk arsitektur statis ini)

Kalau semua item 🔴 di atas (A11Y-01 s/d XSS-01) selesai dikerjakan & dicek:

| Aspek | Sekarang | Setelah fix |
|---|---|---|
| Accessibility | 70 | ~88 (kontras + keyboard + focus = 3 perbaikan murah, dampak besar) |
| Security | 88 | ~92 (tinggal tambah header Vercel, risiko terbesar sudah aman) |
| UX Navigasi | 82 | ~90 (setelah bug popstate selesai) |

Yang **TIDAK** akan pernah dapat nilai sempurna walau dikerjakan sebaik mungkin — bukan karena kurang usaha, tapi karena ini keterbatasan platform/keputusan sadar proyek:
- Header security penuh di domain GitHub Pages → platform-nya nggak support, titik.
- Skor "Backend/Database/Build-tool" → nggak relevan dihitung karena memang sengaja nggak ada (Roadmap §3, §5).

Jadi target yang sehat: **±90 di kategori yang benar-benar bisa dikontrol dari kode**, bukan 100 di semua kategori generik yang sebagian nggak nyambung ke proyek statis 1 file ini.

---

## 📌 STATUS SEKARANG

```
Item coding outstanding: 0 ✅ (semua temuan valid dari AUDIT_SIMBAH_PROFESSIONAL.md sudah dikerjakan)
Item yang menunggu KEPUTUSAN/ASET dari Zen: 1
  → L-03: maskable icon — butuh logo versi safe-zone 40%, bukan sekadar edit JSON

Item yang wajib dicek manual: 0 — SEC-01 sudah terverifikasi aman (27 Juni 2026)

Yang perlu dilakukan Zen:
  → Kumpulkan nomor kontak Nyuwun Tulung
  → Kumpulkan nama pengurus organisasi
  → (opsional) siapkan versi logo dengan margin aman untuk maskable icon PWA

Yang perlu dipantau:
  → GSC indexing report (~4 minggu dari submit sitemap, deadline ~25 Juli 2026)
```
