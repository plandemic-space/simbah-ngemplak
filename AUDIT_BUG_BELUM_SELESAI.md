# SIMBAH — Audit & Next Step

> Diperbarui: **27 Juni 2026 (malam, sesi 2)** — gabungan checklist lama + hasil Audit Total (kode, SEO, a11y, security).
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

---

## 🔴 BARU — DARI AUDIT TOTAL (27 Juni 2026, malam) — KERJAKAN DULUAN

### Perbaikan kode — prioritas tinggi
- [x] **[A11Y-01]** Kontras teks kecil gagal standar baca — `--tx3` (#7A8E82) cuma 2.85–3.08 rasio kontras
      (butuh 4.5). Dipakai di label bottom nav, label "Alamat/Telepon", tanggal update kas, dll (29 tempat).
      → Fix: ganti `--tx3` di `:root` jadi warna lebih gelap (±`#5C6F64`), otomatis berlaku semua halaman.
- [ ] **[A11Y-02]** 6 kartu "Layanan Warga" di Beranda (UMKM/Agenda/Nyuwun Tulung/Kas/Inventaris/Tentang)
      tidak bisa diakses keyboard — `<div onclick>` tanpa `tabindex`/`role="button"`.
      → Fix: tambah `tabindex="0" role="button" aria-label="..."` + handler Enter/Space, atau ganti ke `<button>`.
- [ ] **[NAV-01]** Tombol back FISIK browser (bukan tombol "← Kembali" SIMBAH) kadang melempar user balik
      ke Beranda alih-alih halaman sebelumnya yang benar. Reproduksi: Beranda → Agenda → klik hasil
      search UMKM → tekan back browser → harusnya balik ke Agenda, malah ke Beranda.
      → Lokasi: `js/script.js` listener `popstate` (~baris 1893).

### Perbaikan kode — prioritas sedang
- [x] **[A11Y-03]** Tidak ada style `:focus-visible` custom di seluruh CSS — keyboard user sulit lihat
      posisi fokusnya. Fix: tambah 1 rule global `:focus-visible { outline: 2px solid var(--gr2); outline-offset:2px; }`.
- [ ] **[SEC-02]** `vercel.json` belum punya header keamanan standar (X-Frame-Options, CSP, Referrer-Policy,
      HSTS) — cuma ada `X-Content-Type-Options`. *Catatan: ini HANYA bisa diperbaiki di sisi Vercel,
      GitHub Pages tidak mendukung custom header sama sekali (sudah dicek dokumentasinya).*
- [x] **[XSS-01]** Kotak pencarian: kalau hasil "tidak ditemukan", teks ketikan user disisip mentah ke
      `innerHTML` tanpa escaping (`js/script.js` ~baris 1762). Saat ini cuma berdampak ke diri sendiri
      (self-XSS, tidak ada jalur share via link), tapi murah untuk diperbaiki sekarang.
- [ ] **[SEC-03] (opsional, bukan wajib lagi)** — Setelah SEC-01 terkonfirmasi aman, boleh tetap ganti
      link `/edit?gid=` jadi format view-only (`&rm=minimal` atau Publish-to-web) sebagai pengaman
      tambahan kosmetik — tapi permission Google-nya sendiri sudah mengunci, jadi ini hanya rapi-rapi,
      tidak mendesak.

### Perbaikan kode — boleh nanti (low priority)
- [x] **[DOC-01]** Komentar di `js/script.js` baris ~1031 ada kalimat yang nggak selesai ditulis (sudah
      dicek pakai `node -c`, TIDAK bikin error, cuma typo dokumentasi). Selesaikan atau hapus saja.
- [ ] **[DOC-02]** Komentar & README masih nyebut "fetch butuh Laragon/localhost" — sebagian usang karena
      sekarang udah live di GitHub Pages/Vercel. Update jadi: "butuh server HTTP, sudah otomatis terpenuhi
      di hosting; testing lokal pakai `python -m http.server`, bukan klik dua kali file."
- [ ] **[PERF-01]** Tag `<img>` (statis & JS-generated) belum ada atribut `width`/`height` eksplisit.
      Dampak kecil karena semua container sudah fixed-size di CSS, tapi tetap best practice ditambah.
- [ ] **[UX-01]** Halaman 404 auto-redirect 5 detik tanpa indikator countdown visual. Opsional, dampak kecil.

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
Item coding outstanding: 8 (lihat section 🔴 BARU di atas)
Item yang wajib dicek manual: 0 — SEC-01 sudah terverifikasi aman (27 Juni 2026)

Yang perlu dilakukan Zen:
  → Kumpulkan nomor kontak Nyuwun Tulung
  → Kumpulkan nama pengurus organisasi

Yang perlu dipantau:
  → GSC indexing report (~4 minggu dari submit sitemap, deadline ~25 Juli 2026)
```
