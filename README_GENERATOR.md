# 📘 SIMBAH Static UMKM Generator - Panduan Penggunaan

## 🎯 Tujuan

Script `generate-static-umkm.js` dibuat untuk mengatasi masalah SEO dimana Google crawler kesulitan mengindex halaman UMKM yang di-render via JavaScript. Script ini menghasilkan file HTML statis yang:

- ✅ Konten lengkap sudah ada di HTML (tidak perlu tunggu JavaScript)
- ✅ Meta tags SEO lengkap (title, description, keywords, canonical)
- ✅ Schema.org LocalBusiness + FAQPage untuk rich snippets
- ✅ Open Graph & Twitter Card untuk social sharing
- ✅ Sitemap.xml otomatis ter-update dengan URL baru

---

## 🚀 Cara Pakai

### 1. Jalankan Script

```bash
node generate-static-umkm.js
```

Script akan:
- Membaca `data/umkm.json`
- Generate 19 file HTML di folder `/umkm/`
- Update `sitemap.xml` otomatis

### 2. Review Hasil

Cek folder `/umkm/` - setiap UMKM punya file sendiri dengan nama slug:
- `plandemic-space.html`
- `heri-bibit.html`
- `bibit-tanaman-buah-terdekat.html`
- dll (19 file total)

### 3. Upload ke GitHub

```bash
git add umkm/ sitemap.xml
git commit -m "Generate static HTML pages untuk SEO"
git push origin main
```

Vercel akan auto-deploy dan halaman langsung live.

---

## 🔗 URL Structure

### URL Lama (JavaScript Render)
```
https://simbahngemplak.vercel.app/?umkm=plandemic-space
```
**Masalah:** Konten baru muncul setelah JavaScript execute & fetch data.

### URL Baru (Static HTML)
```
https://simbahngemplak.vercel.app/umkm/plandemic-space.html
```
**Solusi:** Konten sudah ada di HTML, crawler langsung bisa index.

---

## 📝 Kapan Harus Generate Ulang?

Jalankan script setiap kali:
1. **Menambah UMKM baru** di `umkm.json`
2. **Update data UMKM** (nama, deskripsi, produk, FAQ, dll)
3. **Ganti gambar cover** atau galeri
4. **Update kontak** (nomor WA, link Maps, sosmed)

Script akan:
- ✅ Overwrite file HTML yang sudah ada
- ✅ Generate file baru untuk UMKM baru
- ✅ Update sitemap.xml otomatis

---

## 🔧 Workflow Maintenance

```
1. Edit data/umkm.json
2. Run: node generate-static-umkm.js
3. Review perubahan di folder /umkm/
4. Git commit & push
5. Vercel auto-deploy
6. Test URL: /umkm/[slug].html
```

---

## 🧪 Testing

### Test di Local
Buka file langsung di browser:
```
file:///D:/00%20PROJECT%20SIMBAH/00%20WEB%20SIMBAH/simbahngemplak/umkm/plandemic-space.html
```

### Test di Production
```
https://simbahngemplak.vercel.app/umkm/plandemic-space.html
```

### Test SEO
1. **Google Search Console**: Submit sitemap.xml yang baru
2. **Rich Results Test**: https://search.google.com/test/rich-results
3. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
4. **Twitter Card Validator**: https://cards-dev.twitter.com/validator

---

## ✅ Checklist Post-Generate

- [ ] Semua 19 file HTML ter-generate tanpa error
- [ ] Sitemap.xml sudah ter-update dengan URL baru
- [ ] Test buka 2-3 file HTML di browser (cek layout & konten)
- [ ] Git commit & push ke GitHub
- [ ] Vercel deployment sukses
- [ ] Test URL production: `/umkm/[slug].html`
- [ ] Submit sitemap.xml baru ke Google Search Console

---

## 🔄 Backward Compatibility

URL lama `?umkm=slug` **tetap berfungsi** untuk kompatibilitas dengan link yang sudah tersebar di WhatsApp/medsos. Fungsi `bukaUMKMdariURL()` di `script.js` tidak diubah.

**Strategi forward:**
- Sitemap.xml → gunakan URL baru `/umkm/[slug].html`
- Link internal baru → gunakan URL baru
- Link lama yang sudah tersebar → tetap bisa diakses via `?umkm=slug`

---

## 📊 Expected SEO Impact

### Sebelum (JavaScript Render)
- ❌ Google: "Crawled - currently not indexed"
- ❌ Konten kosong saat initial HTML load
- ❌ Meta tags diupdate setelah JS execute
- ❌ Crawler snapshot HTML placeholder

### Sesudah (Static HTML)
- ✅ Konten lengkap di initial HTML
- ✅ Meta tags lengkap di `<head>`
- ✅ Schema.org LocalBusiness + FAQPage
- ✅ Crawler dapat konten penuh langsung
- ✅ Rich snippets di Google Search

**Estimasi waktu:** 2-4 minggu setelah submit sitemap baru untuk melihat improvement di Search Console.

---

## 🐛 Troubleshooting

### Error: `Cannot find module 'fs'`
**Solusi:** Pastikan pakai Node.js, bukan browser.

### Error: `ENOENT: no such file or directory, open './data/umkm.json'`
**Solusi:** Jalankan script dari root folder project (`d:\00 PROJECT SIMBAH\00 WEB SIMBAH\simbahngemplak`).

### HTML Kosong atau Broken
**Solusi:** Cek console error saat generate. Biasanya ada karakter special di `umkm.json` yang belum di-escape.

### Sitemap Tidak Ter-update
**Solusi:** Cek permission file `sitemap.xml`. Script butuh write access.

---

## 📞 Support

Ada masalah atau pertanyaan? Hubungi developer via:
- WhatsApp: +6282241439784
- Email: (belum ada)

---

**Last Updated:** 5 Juli 2026