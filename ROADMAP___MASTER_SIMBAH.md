# SIMBAH — Prinsip & Keputusan Permanen

> Dokumen ini berisi **prinsip yang tidak pernah berubah** selama proyek hidup.
> Bukan to-do, bukan history — murni pagar acuan.
>
> Untuk status pekerjaan & checklist teknis → lihat `AUDIT_BUG_BELUM_SELESAI.md`
> Diperbarui: **6 Juli 2026** (revisi arsitektur: halaman statis per-UMKM dipermanenkan)

---

## 1. Definisi Produk

**SIMBAH ADALAH**: etalase UMKM + identitas dusun + informasi publik sederhana ("Balai Digital Warga").

**SIMBAH BUKAN**: aplikasi administrasi desa, sistem pemerintahan, portal berita, media sosial, aplikasi warga, sistem backend kompleks, super app desa.

---

## 2. Filter Wajib untuk Fitur Baru

Setiap ada usul fitur baru — dari Zen, dari Claude, dari siapapun — cek 4 pertanyaan ini dulu:

1. Apakah meningkatkan visibilitas UMKM **atau** memperkuat identitas Ngemplak?
2. Apakah bisa dirawat tanpa backend, oleh 1–2 orang non-programmer?
3. Apakah **tidak** bisa diselesaikan cukup lewat WhatsApp/IG/FB?
4. Apakah warga akan benar-benar pakai, bahkan 5 tahun lagi?

> Kalau ada 1 jawaban "tidak" → fitur ditolak atau ditunda.

---

## 3. Stack & Arsitektur (FINAL, locked)

- **HTML + CSS + JS vanilla murni** — tanpa framework, tanpa build tool, tanpa transpiler
- **Hosting**: GitHub Pages (primary) + Vercel mirror (`simbahngemplak.vercel.app`)
- **Data**: `data/umkm.json` (UMKM), `const AGENDA` / `INVENTARIS` / `KAS_TOTAL` di `js/script.js`
- **TANPA**: backend, database, login, API kompleks, node_modules, CI/CD
- **Single Page App**: semua section (Beranda, Agenda, Kas, Inventaris, Nyuwun Tulung, Tentang) di 1 `index.html`, navigasi via `nav()` di JS
- **Halaman UMKM: hybrid SPA + statis (permanen, sejak 5 Juli 2026)** — detail UMKM bisa dibuka 2 cara:
  1. `index.html?umkm=slug` (SPA, dipakai link lama yang sudah tersebar di WA/medsos — tetap didukung selamanya)
  2. `/umkm/slug.html` (file HTML statis, hasil generate — ini yang didaftarkan ke sitemap & jadi target crawler Google)
  Alasan: Google Search Console sempat menandai halaman UMKM "Crawled — currently not indexed" karena konten baru muncul setelah JS jalan. File statis menaruh konten penuh + meta SEO langsung di HTML awal.
  **Ini bukan pelanggaran prinsip "no build tool"** — `generate-static-umkm.js` bukan build step yang wajib jalan tiap deploy, tapi utility sekali-jalan (`node generate-static-umkm.js`) yang dipanggil manual oleh Zen hanya saat data UMKM berubah. Tidak ada CI/CD, tidak ada dependency baru, output-nya file HTML statis biasa yang di-drag-drop seperti file lain.
  - Sumber tunggal tetap `data/umkm.json` — file statis **tidak pernah diedit tangan**, selalu re-generate dari situ
  - `updateMetaUMKM()` di `script.js` mengarahkan `<link rel="canonical">` versi SPA ke URL statis yang sesuai, supaya Google tidak melihat 2 URL sebagai konten duplikat
  - Detail lengkap cara pakai generator: lihat `README_GENERATOR.md`

---

## 3a. Revisi Keputusan: Halaman Statis Per-UMKM

Versi awal proyek ini menolak ide "halaman HTML statis per UMKM" (disebut juga "Level 3") dengan alasan tidak scalable untuk 1 orang non-programmer — kalau harus ditulis/diedit tangan untuk 19+ usaha, itu benar tidak realistis.

**Keputusan itu direvisi**, bukan dibatalkan diam-diam: masalah "tidak scalable"-nya sudah tidak berlaku begitu generator otomatis (`generate-static-umkm.js`) dibuat. Zen tidak pernah menulis HTML manual — cukup edit `umkm.json` seperti biasa, lalu jalankan 1 command, semua file `/umkm/*.html` + `sitemap.xml` ter-update otomatis. Beban kerja Zen tidak bertambah dibanding sebelumnya.

---

## 4. Identitas Visual (FINAL, locked)

- **Logo**: "N" abstrak hijau-emas — tidak boleh diusulkan rebranding
- **Warna**: CSS variable di `:root` — `--iv` (ivory/krem), `--gr` (hijau), `--br` (emas/bronze)
- **Proporsi**: Ivory 70% : Hijau 20% : Emas 10%
- **Karakter**: hangat, agraris, tenang, sederhana, modern-tradisional
- **Hindari**: neon, gradient berlebihan, warna mencolok, slider/video otomatis, gaya startup/SaaS

---

## 5. Fitur yang Ditolak Permanen

Jangan diusulkan ulang — sudah diputuskan dan alasannya konsisten:

| Fitur | Alasan |
|---|---|
| Login warga / dashboard admin / RBAC | Butuh backend, tidak bisa dirawat 1 orang |
| Forum warga / chat warga | Butuh moderasi, WA sudah cukup |
| WA Gateway / notifikasi WA otomatis | API berbayar, risiko banned |
| Sistem surat-menyurat / pelaporan kompleks | Di luar scope, domain aplikasi desa resmi |
| Booking inventaris | WA ke PJ lebih cepat |
| Galeri foto section terpisah | Digantikan IG aktif (@ktoppenlestari, @lensangemplak) |
| Video / slider otomatis | Berat, tidak sesuai karakter visual |
| Kalender bulanan interaktif | Over-engineering untuk 1 event/bulan |
| Pengumuman darurat di website | Warga buka WA tiap menit, bukan website |
| PWA penuh + Service Worker | Risiko cache basi, kompleksitas tidak worth it saat ini |

---

## 6. Keputusan Konten & Data

- **Testimoni warga**: dihapus permanen — tidak realistis kumpulkan 19 testimoni asli, kosong/generik justru menurunkan kredibilitas
- **Jam buka UMKM bibit**: `"Fleksibel, hubungi WA"` — karena kenyataannya ada yang muat bibit malam, kirim subuh; jam kaku menyesatkan pembeli
- **Hero beranda**: tetap ilustrasi — tidak perlu foto asli, ganti hanya kalau ada foto asli Ngemplak yang jauh lebih bagus
- **Kategori "Pertanian"**: tidak perlu ditambah — semua UMKM bibit masuk "Perkebunan" (bibit buah/keras/penghijauan = komoditas perkebunan; "Pertanian" identik sawah/padi yang tidak ada di Ngemplak)
- **Em dash (`—`)**: dipakai untuk data yang belum terisi, bukan placeholder teks karangan
- **Foto UMKM**: selalu merge ke base zip Zen saat ada perubahan — jangan overwrite path `cover`/`galeri` yang sudah ada

---

## 7. Mekanisme Kunci (jangan diubah tanpa alasan kuat)

- **`{{WA}}` inject**: script di akhir `index.html` ganti semua `{{WA}}` dengan `WA_UTAMA`. Link `[data-kontak-publik]` → dinonaktifkan (bukan fallback ke Zen). Link lain (footer, sejarah) → inject `WA_UTAMA`.
- **UMKM fetch**: `muatDataUMKM()` ambil `data/umkm.json` via `fetch()`. Tombol WA otomatis hilang kalau `phone` kosong.
- **Navigasi**: `nav('nama-section')` toggle class `.active` di `<div class="page" id="p-NAMA">`.
- **Footer**: satu fungsi `templateFooter()` + array `FOOTER_SLOTS` — edit sekali, berlaku semua halaman.
- **SEO per-UMKM**: `updateMetaUMKM()` update title/desc/canonical/OG/Schema dinamis saat buka detail UMKM.
- **Slug**: `slugify(name)` — nama usaha → huruf kecil → spasi jadi `-` → hapus tanda baca. Harus konsisten antara `cover` path, `sitemap.xml`, `/umkm/slug.html`, dan URL `?umkm=slug`.
- **Generator statis**: `generate-static-umkm.js` (Node.js, jalan manual di komputer Zen, bukan di server) — baca `umkm.json`, tulis ulang semua `/umkm/*.html` + `umkm/index.html` + `sitemap.xml`. Wajib dijalankan ulang setiap kali `umkm.json` berubah (UMKM baru, edit data, ganti foto cover). Field `seoTitle`/`seoDesc` di `umkm.json` opsional — kalau kosong, generator fallback ke `desc` yang dipotong 155 karakter. **Isi manual `seoDesc` yang unik per UMKM**, jangan copy-paste dari UMKM lain (pernah kejadian 2 UMKM bibit punya `seoDesc` identik, kena flag duplicate meta description di Search Console).

---

## 8. Definisi Keberhasilan

SIMBAH berhasil kalau: orang cari "Ngemplak" ketemu SIMBAH di Google, UMKM dapat trafik/pelanggan nyata, warga tahu agenda, warga percaya data kas, info mudah ditemukan, warga bangga.

**Tidak diukur dari**: jumlah halaman, fitur, animasi, atau akun login.

---

## 9. Konteks Proyek

- **Pengelola**: Zen (1 orang, non-programmer, update via drag-drop GitHub)
- **Workflow**: edit file → drag-drop ke GitHub repo → commit → Pages rebuild otomatis (~1–2 menit)
- **Constraint permanen**: Rp0, bisa dikelola 1–2 orang tanpa SDM IT
- **Domain sekarang**: `simbahngemplak.vercel.app` (canonical) + `samxngemplak-arch.github.io`
- **Migrasi domain**: nanti ke `dusunngemplak.id` atau sejenis, kalau sudah matang

---

## 10. Wishlist Masa Depan

Bukan ditolak — ditunda sampai ada kebutuhan riil atau SDM:

| Item | Syarat sebelum dipertimbangkan |
|---|---|
| Domain `.id` berbayar | Keputusan Zen & perangkat dusun |
| Schema `BreadcrumbList` | Ada struktur multi-level / domain `.id` + SSR/prerender |
| Backlink lokal | Koordinasi dengan web Desa Samping / Kec. Kemiri / Kab. Purworejo |
| Halaman Sentra Bibit | Diskusi arsitektur dulu (keluar dari SPA) |
| Histori transaksi kas | Kalau Google Sheets sudah tidak cukup |
| Integrasi Pengaduan ke Nyuwun Tulung | Harus ada kejelasan siapa yang baca & follow-up |
