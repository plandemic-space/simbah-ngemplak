# CATATAN PROJECT SIMBAH

Dokumen ini berisi catatan kronologis pengembangan dan maintenance website SIMBAH Ngemplak.

---

## Sesi 5 Juli 2026 - Perbaikan SEO Indexing

**Masalah awal:**
Google Search Console menandai halaman UMKM (?umkm=slug) sebagai "Crawled - currently not indexed" karena konten di-render 100% via client-side JavaScript, sehingga Google kesulitan membaca konten saat crawl.

**Solusi yang diimplementasikan:**
Membuat script generator (generate-static-umkm.js) yang menghasilkan halaman HTML statis untuk setiap UMKM, dengan konten sudah ter-embed langsung di HTML (tidak perlu fetch JSON/JavaScript untuk render).

**File baru yang ditambahkan:**
- `generate-static-umkm.js` — script Node.js untuk generate halaman statis
- folder `umkm/` — berisi 19 halaman detail UMKM (`umkm/[slug].html`) + 1 halaman index (`umkm/index.html`) sebagai katalog
- `README_GENERATOR.md` — dokumentasi cara pakai script generator

**Perubahan pada file existing:**
- `sitemap.xml` — updated dengan 19 URL baru `/umkm/[slug].html`

**Perbaikan teknis yang dilakukan:**
1. **Konten statis** — semua 19 UMKM cards + detail ter-embed di HTML saat build time
2. **Hapus script.js** — file static tidak load script.js yang fetch JSON (menghindari 404 errors)
3. **CSS loading optimization** — pindahkan stylesheet ke baris 8 (setelah viewport meta) untuk mengurangi FOUC
4. **Back button navigation** — tombol back di halaman detail mengarah ke `/umkm/` (katalog), bukan homepage
5. **Navigation styling** — tambahkan `text-decoration:none` inline untuk menghilangkan underline pada anchor tag navigation menu

**Maintenance workflow ke depan:**
Setiap kali `data/umkm.json` diupdate (UMKM baru/edit info), jalankan:
```bash
node generate-static-umkm.js
```
Lalu upload ulang folder `umkm/` ke GitHub.

**Backward compatibility:**
URL lama (`/?umkm=slug`) tetap berfungsi sebagai fallback, tidak dihapus.

**Status submit sitemap:**
Sitemap.xml resubmit ke Google Search Console pada 5/7/2026

**Next check:**
Cek kembali Google Search Console menu "Pages" sekitar 2 minggu dari tanggal submit (~19 Juli 2026) untuk melihat apakah status "Crawled - not indexed" sudah berubah menjadi "Indexed" untuk halaman `/umkm/[slug].html`.

---

*Format catatan selanjutnya: tambahkan entry baru di atas dengan header ## Sesi [Tanggal] - [Judul], jangan hapus catatan lama.*