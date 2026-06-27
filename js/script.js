/* ================================================
   SIMBAH — Sistem Informasi Masyarakat
            Bale Harian Ngemplak
   ================================================
   File  : script.js
   Isi   : Semua logika interaksi website SIMBAH
   Urutan:
     1. Data UMKM
     2. State (kondisi aplikasi)
     3. Navigasi Halaman
     4. Menu Bottom Sheet
     5. UMKM — Render Grid & Detail
     6. Filter UMKM
     7. Inisialisasi (jalankan saat halaman dimuat)
   ================================================ */


/* ================================================
   0. KONSTANTA GLOBAL
   ------------------------------------------------
   Nomor WA utama dipakai di seluruh file — kalau
   ganti nomor, cukup ubah di SINI, semua tombol
   WA di halaman otomatis ikut benar.
   Format: internasional tanpa + (62xxx...)
   ================================================ */
const WA_UTAMA = '6282241439784';

/* ================================================
   FLAG DEBUG — production logging
   ------------------------------------------------
   false = console.log/warn yang sifatnya debug
   internal (nama elemen, ID, jumlah data) tidak
   muncul di browser publik. Set true sementara
   kalau perlu trace error pas develop lokal.
   ================================================ */
const DEBUG = false;

/* ================================================
   KONSTANTA SEO — JUDUL & DESKRIPSI DEFAULT
   ------------------------------------------------
   Dipakai oleh updateMetaUMKM() & resetMetaDefault() di bawah,
   supaya saat membuka halaman detail UMKM, document.title dan
   meta description browser berubah otomatis jadi spesifik per
   UMKM — bukan ikut judul SIMBAH umum terus-terusan. Ini PENTING
   untuk SEO: Google butuh title/description BERBEDA per halaman
   supaya tiap UMKM bisa muncul sendiri-sendiri di hasil pencarian,
   bukan semua UMKM dianggap "1 halaman yang sama".

   DOMAIN_SIMBAH dipakai untuk generate URL canonical & Open Graph
   dinamis. Domain resmi = simbahngemplak.vercel.app (lihat catatan
   domain di index.html). Kalau nanti pindah ke domain custom,
   ganti di SINI SAJA — semua fungsi SEO dinamis di bawah otomatis
   ikut benar.
   ================================================ */
const DOMAIN_SIMBAH = 'https://simbahngemplak.vercel.app';
const TITLE_DEFAULT = 'SIMBAH — Portal Digital Dusun Ngemplak | Kemiri, Purworejo';
const DESC_DEFAULT  = 'Dusun Ngemplak, Desa Samping, Kemiri, Purworejo — sejarah panjang, tradisi terjaga, dan puluhan UMKM yang terus bergerak maju bersama. Portal digital resmi warga Ngemplak.';

/**
 * Update document.title + meta description + Open Graph + canonical
 * + Schema.org LocalBusiness supaya SPESIFIK untuk 1 UMKM yang
 * sedang dibuka. Dipanggil dari showUMKM().
 *
 * CATATAN: ini tidak mengubah URL address bar (itu sudah ditangani
 * terpisah oleh pushState di showUMKM()) — ini KHUSUS metadata yang
 * dibaca Google/browser tab, supaya hasil pencarian & link preview
 * (WA/FB share) menampilkan info usaha yang benar, bukan info SIMBAH
 * secara umum.
 */
function updateMetaUMKM(u) {
  const slug = slugify(u.name);
  const url = DOMAIN_SIMBAH + '/?umkm=' + slug;
  /* Pakai seoTitle kalau ada, fallback ke format generik */
  const judul = u.seoTitle || (u.name + ' — ' + u.cat + ' di Dusun Ngemplak | SIMBAH');

  /* Pakai seoDesc kalau ada (keyword-rich, ringkas), fallback ke desc dipotong 155 karakter */
  const deskripsiMentah = u.seoDesc || u.desc || ('Usaha ' + u.cat + ' warga Dusun Ngemplak, Desa Samping, Kemiri, Purworejo.');
  const deskripsi = deskripsiMentah.length > 155 ? deskripsiMentah.slice(0, 152) + '...' : deskripsiMentah;

  document.title = judul;

  function setMeta(selector, attr, nilai) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, nilai);
  }

  setMeta('meta[name="description"]', 'content', deskripsi);
  setMeta('link[rel="canonical"]', 'href', url);
  setMeta('meta[property="og:title"]', 'content', judul);
  setMeta('meta[property="og:description"]', 'content', deskripsi);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[name="twitter:title"]', 'content', judul);
  setMeta('meta[name="twitter:description"]', 'content', deskripsi);
  if (u.keywords) setMeta('meta[name="keywords"]', 'content', u.keywords);

  /* ── Schema.org LocalBusiness — dinamis per UMKM ──
     Beda dari Schema.org GovernmentOrganization yang statis di
     <head> (itu untuk profil Dusun secara umum). Ini KHUSUS untuk
     1 usaha warga yang sedang dibuka, supaya Google paham ini
     adalah bisnis lokal nyata dengan alamat & kontak jelas — sinyal
     SEO lokal yang jauh lebih kuat daripada teks biasa.
     Pakai <script> dengan id unik supaya bisa dihapus/diganti tanpa
     numpuk banyak <script type="application/ld+json"> tiap ganti UMKM. */
  let ldScript = document.getElementById('ld-json-umkm');
  if (!ldScript) {
    ldScript = document.createElement('script');
    ldScript.type = 'application/ld+json';
    ldScript.id = 'ld-json-umkm';
    document.head.appendChild(ldScript);
  }
  const adaMaps = u.maps && u.maps !== '#' && u.maps.trim() !== '';
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': u.name,
    'description': deskripsiMentah,
    'url': url,
    'image': DOMAIN_SIMBAH + '/img/branding/logo.png',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': u.alamat || 'Dusun Ngemplak, Desa Samping',
      'addressLocality': 'Kecamatan Kemiri',
      'addressRegion': 'Purworejo, Jawa Tengah',
      'addressCountry': 'ID'
    },
    'areaServed': u.area || 'Desa Samping, Kemiri, Purworejo'
  };
  if (u.phone) { schemaData.telephone = '+' + u.phone; }
  if (adaMaps) { schemaData.hasMap = u.maps; }
  if (u.rating && u.rating !== '0' && u.ulasan) {
    schemaData.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': u.rating,
      'reviewCount': u.ulasan
    };
  }
  ldScript.textContent = JSON.stringify(schemaData);

  /* ── Schema.org FAQPage — dipasang terpisah dari LocalBusiness
     supaya tidak konflik. Hanya dipasang kalau UMKM punya field faq.
     Google bisa tampilkan FAQ langsung di hasil pencarian (rich snippet). */
  let faqScript = document.getElementById('ld-json-faq');
  if (u.faq && u.faq.length) {
    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.id = 'ld-json-faq';
      document.head.appendChild(faqScript);
    }
    faqScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': u.faq.map(function(f) {
        return {
          '@type': 'Question',
          'name': f.q,
          'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
        };
      })
    });
  } else if (faqScript) {
    faqScript.remove();
  }
}

/**
 * Kembalikan document.title + meta description + Open Graph +
 * canonical ke nilai default SIMBAH (bukan UMKM tertentu). Dipanggil
 * dari nav() setiap kali pindah ke halaman SELAIN detail UMKM.
 */
function resetMetaDefault() {
  document.title = TITLE_DEFAULT;

  function setMeta(selector, attr, nilai) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, nilai);
  }

  setMeta('meta[name="description"]', 'content', DESC_DEFAULT);
  setMeta('link[rel="canonical"]', 'href', DOMAIN_SIMBAH + '/');
  setMeta('meta[property="og:title"]', 'content', 'SIMBAH — Dusun Ngemplak, Kemiri Purworejo');
  setMeta('meta[property="og:description"]', 'content', DESC_DEFAULT);
  setMeta('meta[property="og:url"]', 'content', DOMAIN_SIMBAH + '/');
  setMeta('meta[name="twitter:title"]', 'content', 'SIMBAH — Dusun Ngemplak, Kemiri Purworejo');
  setMeta('meta[name="twitter:description"]', 'content', DESC_DEFAULT);

  /* Hapus Schema.org LocalBusiness kalau ada — supaya halaman
     non-UMKM tidak ikut bawa data bisnis usaha terakhir yang dibuka */
  const ldScript = document.getElementById('ld-json-umkm');
  if (ldScript) { ldScript.remove(); }
}

/* ================================================
   KONSTANTA KAS — UPDATE DI SINI KALAU ADA PERUBAHAN
   ------------------------------------------------
   KAS_UPDATE : tanggal terakhir saldo diperbarui
                (format bebas, contoh: "23 Juni 2026")
   KAS_TOTAL  : total gabungan semua kas (string Rupiah)
   ================================================ */
const KAS_UPDATE = '23 Juni 2026';
const KAS_TOTAL  = 'Rp 905.000';


/* ================================================
   1. DATA UMKM
   Semua data UMKM disimpan di sini sebagai array.
   Nanti kalau sudah pakai PHP+MySQL, data ini
   dipindah ke database — tapi untuk sekarang
   disimpan di sini dulu.

   Setiap UMKM punya properti:
   - id       : nomor urut (mulai dari 0)
   - name     : nama usaha
   - cat      : kategori usaha
   - emoji    : ikon/gambar sementara
   - desc     : deskripsi usaha
   - phone    : nomor WA (format internasional, tanpa +)
   - rating   : nilai bintang
   - alamat   : alamat lengkap
   - jam      : jam operasional
   - maps     : link Google Maps
   - ig/fb/tt/yt/sp/tp : link sosmed & marketplace
   - galeri   : array emoji foto produk
   - products : array produk/jasa yang dijual
   ================================================ */
/* ================================================
   1. DATA UMKM
   ------------------------------------------------
   PENTING — Data TIDAK lagi ditulis manual di sini!
   Sekarang diambil otomatis dari file:

       data/umkm.json

   Kenapa dipindah ke sini?
   Karena rencananya UMKM bisa sampai 50+, kalau semua
   ditulis manual di file JS ini akan sangat panjang
   dan gampang salah edit. Dengan JSON terpisah, nambah
   UMKM baru cukup edit 1 file data — file script.js
   ini tidak perlu disentuh sama sekali.

   CATATAN PENTING:
   fetch() HANYA bisa jalan kalau dibuka lewat server HTTP.
   Di hosting (GitHub Pages / Vercel) sudah otomatis terpenuhi.
   Untuk testing lokal, jalankan: python -m http.server 8000
   lalu buka http://localhost:8000/ di browser.
   JANGAN buka index.html dengan klik dua kali dari File Explorer —
   fetch() akan GAGAL karena browser memblokirnya (CORS policy).
   ================================================ */

/* Array kosong dulu — diisi otomatis oleh muatDataUMKM() */
let UMKM = [];

/**
 * Ambil data UMKM dari file data/umkm.json
 * Pakai async/await supaya urutan baca kodenya
 * tetap dari atas ke bawah, mudah dipahami.
 */
async function muatDataUMKM() {
  try {
    const response = await fetch('data/umkm.json');

    /* Kalau file tidak ketemu / server error (404, 500, dll) */
    if (!response.ok) {
      throw new Error('File data/umkm.json tidak ditemukan (status: ' + response.status + ')');
    }

    const hasil = await response.json();

    /* Validasi struktur data sebelum dipakai —
       supaya kalau ada typo di JSON, errornya jelas
       bukan sekadar "undefined" yang membingungkan */
    if (!hasil.umkm || !Array.isArray(hasil.umkm)) {
      throw new Error('Format data/umkm.json salah — harus ada key "umkm" berisi array');
    }

    UMKM = hasil.umkm;
    if (DEBUG) console.log('✓ Data UMKM berhasil dimuat:', UMKM.length, 'usaha');

    /* Cek ID duplikat — kalau Zen tambah UMKM baru tapi lupa
       ganti "id", 2 UMKM bisa diam-diam tabrakan (yang satu
       "menutupi" yang lain saat dicari pakai .find()). Ini
       cuma peringatan di console, tidak menghentikan website,
       supaya warga tetap bisa lihat halaman seperti biasa
       sambil Zen perbaiki id yang konflik. */
    const _idTerpakai = UMKM.map(function(u) { return u.id; });
    const _idDuplikat = _idTerpakai.filter(function(id, i) { return _idTerpakai.indexOf(id) !== i; });
    if (_idDuplikat.length) {
      console.error('⚠️ ID UMKM duplikat ditemukan di data/umkm.json:', _idDuplikat.join(', '), '— periksa field "id" supaya setiap UMKM punya angka unik.');
    }

    /* Generate chip filter dinamis dari kategori yang ada di data */
    renderFilterChips();

    /* Render grid (halaman UMKM) + card unggulan (Beranda) setelah data siap */
    renderGrid('');
    renderUMKMBeranda();

    /* Update angka "UMKM Aktif" di Hero & section Kenali Ngemplak
       supaya otomatis ikut jumlah riil di umkm.json — tidak perlu
       lagi diingat-ingat untuk update manual tiap nambah UMKM baru.
       Kalau fetch gagal (lihat blok catch di bawah), angka HARDCODE
       yang sudah ada di index.html tetap tampil sebagai fallback. */
    renderStatUMKM();
    renderTrustStrip();

    /* Cek apakah halaman ini dibuka lewat link share UMKM
       (contoh: ?umkm=plandemic-space) — kalau iya, langsung
       buka detail UMKM itu tanpa perlu klik apa-apa. */
    bukaUMKMdariURL();

  } catch (error) {
    /* Kalau gagal — JANGAN biarkan halaman kosong putih.
       Tampilkan pesan yang jelas supaya gampang dicari
       penyebabnya, tidak perlu bongkar ulang dari nol. */
    console.error('✗ Gagal memuat data UMKM:', error.message);

    const grid = document.getElementById('umkm-grid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:30px 16px; color:#7A8E82">
          <div style="font-size:32px; margin-bottom:8px">⚠️</div>
          <div style="font-size:13px; font-weight:600; margin-bottom:4px; color:#1A2E23">Data UMKM gagal dimuat</div>
          <div style="font-size:11px; line-height:1.5">Website sudah live di hosting — kalau error ini muncul, coba refresh.<br>Testing lokal: jalankan <code>python -m http.server</code>, bukan klik file langsung.</div>
        </div>`;
    }

    const beranda = document.getElementById('umkm-beranda-list');
    if (beranda) {
      beranda.innerHTML = `<div style="font-size:11px; color:#7A8E82; padding:8px 0">⚠️ Data UMKM gagal dimuat.</div>`;
    }
  }
}


/* ================================================
   2. STATE — Kondisi Aplikasi
   Variabel yang menyimpan "kondisi saat ini"
   - currentPage : halaman yang sedang aktif
   - navHistory  : tumpukan halaman sebelumnya
                   (untuk tombol kembali)
   - menuOpen    : apakah menu sheet terbuka?
   ================================================ */
let currentPage = 'beranda';
let navHistory  = [];
let menuOpen    = false;
let currentUMKM = null; /* UMKM yang sedang dibuka di halaman detail — dipakai shareUMKM() */

/* Peta nama halaman → id elemen HTML
   Contoh: 'agenda' → cari elemen id="p-agenda" */
const pageMap = {
  'beranda':     'p-beranda',
  'agenda':      'p-agenda',
  'umkm':        'p-umkm',
  'umkm-detail': 'p-umkm-detail',
  'kas':         'p-kas',
  'inventaris':  'p-inventaris',
  'nyuwun':      'p-nyuwun',
  'tentang':     'p-tentang'
};

/* Peta nama halaman → daftar id elemen navigasi yang
   harus ikut aktif/nonaktif saat pindah halaman.
   Satu halaman bisa punya LEBIH DARI SATU elemen nav
   karena ada 2 versi tampilan:
   - bn-xxx = tombol di bottom nav (mobile)
   - dn-xxx = tombol di menu atas (desktop)
   Kalau elemennya tidak ada (mis. 'kas' tidak ada
   bn-kas karena cuma ada di menu sheet), tidak masalah
   — nanti dicek pakai optional chaining (?.) */
const navMap = {
  'beranda':    ['bn-beranda', 'dn-beranda'],
  'umkm':       ['bn-umkm', 'dn-umkm'],
  'agenda':     ['bn-agenda', 'dn-agenda'],
  'nyuwun':     ['bn-nyuwun', 'dn-nyuwun'],
  'kas':        ['dn-kas'],
  'inventaris': ['dn-inventaris'],
  'tentang':    ['dn-tentang']
};

/* Kumpulan SEMUA id navigasi (digabung jadi 1 array
   datar) — dipakai untuk "matikan semua dulu" sebelum
   mengaktifkan yang baru */
const semuaIdNav = Object.values(navMap).flat();


/* ================================================
   3. NAVIGASI HALAMAN
   Fungsi untuk berpindah antar halaman
   ================================================ */

/**
 * Pindah ke halaman tertentu
 * @param {string} key - nama halaman (lihat pageMap)
 */
function nav(key) {
  closeMenu();

  /* Sembunyikan halaman yang sekarang aktif */
  document.getElementById(pageMap[currentPage])?.classList.remove('active');

  /* Nonaktifkan SEMUA tombol nav (bottom nav & menu desktop) */
  semuaIdNav.forEach(function(id) {
    document.getElementById(id)?.classList.remove('active');
  });

  /* Tutup tombol menu tengah (mobile) */
  document.getElementById('bn-menu')?.classList.remove('open');

  /* Simpan halaman sekarang ke navHistory (untuk tombol kembali) */
  navHistory.push(currentPage);

  /* Pindah ke halaman baru */
  currentPage = key;
  const el = document.getElementById(pageMap[key]);
  if (el) {
    el.classList.add('active');
    el.scrollTop = 0; /* scroll ke atas saat pindah halaman */
  }

  /* Aktifkan SEMUA tombol nav yang sesuai (bisa lebih dari 1) */
  (navMap[key] || []).forEach(function(id) {
    document.getElementById(id)?.classList.add('active');
  });

  /* Kalau pindah ke halaman UMKM, render grid dulu + reset chip filter
     ke "Semua" — supaya tidak ada chip lama yang masih kelihatan aktif
     dari sesi sebelumnya saat pengunjung masuk lagi ke halaman UMKM */
  if (key === 'umkm') {
    renderGrid('');
    const row = document.getElementById('filter-row');
    if (row) {
      row.querySelectorAll('.fchip').forEach(function(x) { x.classList.remove('active'); });
      const semuaChip = row.querySelector('[data-filter=""]');
      if (semuaChip) semuaChip.classList.add('active');
    }
  }

  /* Kalau pindah ke halaman Agenda, render daftar lengkap dulu */
  if (key === 'agenda') {
    renderAgendaPage();
  }

  /* Kalau pindah ke halaman Inventaris, render daftar lengkap dulu */
  if (key === 'inventaris') {
    renderInventarisPage();
  }

  /* Kalau pindah ke halaman Tentang, reset ke tab Profil —
     supaya konsisten, tidak nyangkut di tab terakhir yang
     pernah dibuka sebelumnya. */
  if (key === 'tentang') {
    tentangTab('profil');
  }

  /* Bersihkan parameter ?umkm=... dari URL kalau pindah ke halaman
     LAIN (bukan detail UMKM) — supaya URL gak nyangkut nunjuk UMKM
     lama padahal sudah pindah halaman lain. Sekalian kembalikan
     title/meta/Schema.org ke default SIMBAH (bukan UMKM tertentu). */
  if (key !== 'umkm-detail' && window.location.search) {
    window.history.pushState({ page: key }, '', window.location.pathname);
  }
  if (key !== 'umkm-detail') {
    resetMetaDefault();
  }
}

/**
 * Kembali ke halaman sebelumnya
 * Dipakai oleh tombol "← Kembali" di halaman dalam
 */
function goBack() {
  if (!navHistory.length) return; /* tidak ada navHistory, tidak jadi kembali */

  /* Sembunyikan halaman sekarang */
  document.getElementById(pageMap[currentPage])?.classList.remove('active');

  /* Nonaktifkan SEMUA tombol nav */
  semuaIdNav.forEach(function(id) {
    document.getElementById(id)?.classList.remove('active');
  });

  /* Ambil halaman sebelumnya dari tumpukan navHistory */
  currentPage = navHistory.pop();
  const el = document.getElementById(pageMap[currentPage]);
  if (el) {
    el.classList.add('active');
    el.scrollTop = 0;
  }

  /* Aktifkan SEMUA tombol nav yang sesuai */
  (navMap[currentPage] || []).forEach(function(id) {
    document.getElementById(id)?.classList.add('active');
  });

  /* Kalau kembali ke halaman UMKM, render grid lagi + reset chip filter
     ke "Semua" supaya tidak ada chip lama (mis. "Pertukangan") yang
     masih kelihatan aktif padahal grid sudah menampilkan semua UMKM */
  if (currentPage === 'umkm') {
    renderGrid('');
    const row = document.getElementById('filter-row');
    if (row) {
      row.querySelectorAll('.fchip').forEach(function(x) { x.classList.remove('active'); });
      const semuaChip = row.querySelector('[data-filter=""]');
      if (semuaChip) semuaChip.classList.add('active');
    }
  }

  /* Kalau kembali ke halaman Agenda, render daftar lengkap lagi */
  if (currentPage === 'agenda') {
    renderAgendaPage();
  }

  /* Kalau kembali ke halaman Inventaris, render daftar lengkap lagi */
  if (currentPage === 'inventaris') {
    renderInventarisPage();
  }

  /* Bersihkan parameter ?umkm=... dari URL kalau yang dituju
     bukan halaman detail UMKM (sama seperti di nav() di atas).
     Sekalian kembalikan title/meta/Schema.org ke default. */
  if (currentPage !== 'umkm-detail' && window.location.search) {
    window.history.pushState({ page: currentPage }, '', window.location.pathname);
  }
  if (currentPage !== 'umkm-detail') {
    resetMetaDefault();
  }
}

/**
 * Langsung kembali ke beranda
 * Dipakai oleh klik logo di header
 */
function goHome() {
  navHistory = []; /* kosongkan navHistory */
  nav('beranda');
}


/* ================================================
   3B. DROPDOWN "LAINNYA" — Nav Desktop
   ------------------------------------------------
   Kas & Inventaris tidak lagi sejajar di menu desktop
   utama (sesuai Product Roadmap SIMBAH: fokus utama
   UMKM+Agenda+Identitas) — dipindah ke dropdown ini.
   Klik tombol "Lainnya" untuk buka/tutup, klik di luar
   dropdown untuk menutup otomatis.
   ================================================ */

/** Buka/tutup dropdown "Lainnya" */
function toggleDnDropdown(e) {
  e.stopPropagation(); /* supaya tidak langsung ke-trigger listener "klik di luar" di bawah */
  const menu = document.getElementById('dn-dropdown-menu');
  const btn = document.getElementById('dn-lainnya-btn');
  menu?.classList.toggle('open');
  btn?.classList.toggle('open');
}

/** Tutup dropdown "Lainnya" (dipakai listener klik di luar & setelah pilih item) */
function closeDnDropdown() {
  document.getElementById('dn-dropdown-menu')?.classList.remove('open');
  document.getElementById('dn-lainnya-btn')?.classList.remove('open');
}

/** Navigasi dari dalam dropdown "Lainnya" — tutup dropdown dulu, baru pindah halaman */
function navFromDropdown(key) {
  closeDnDropdown();
  nav(key);
}

/* Klik di mana saja di luar dropdown akan menutupnya otomatis */
document.addEventListener('click', function(e) {
  const wrap = document.querySelector('.dn-dropdown-wrap');
  if (wrap && !wrap.contains(e.target)) {
    closeDnDropdown();
  }
});


/* ================================================
   4. MENU BOTTOM SHEET
   Menu laci yang muncul dari bawah saat klik
   tombol tengah di bottom nav
   ================================================ */

/** Buka atau tutup menu (toggle) */
function toggleMenu() {
  menuOpen ? closeMenu() : openMenu();
}

/** Buka menu */
function openMenu() {
  menuOpen = true;
  document.getElementById('overlay').classList.add('show');
  document.getElementById('sheet').classList.add('show');
  document.getElementById('bn-menu').classList.add('open');
}

/** Tutup menu */
function closeMenu() {
  menuOpen = false;
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('sheet').classList.remove('show');
  document.getElementById('bn-menu').classList.remove('open');
}

/**
 * Navigasi dari dalam menu sheet
 * Tutup menu dulu, baru pindah halaman
 * @param {string} key - nama halaman tujuan
 */
function menuNav(key) {
  closeMenu();
  nav(key);
}


/* ================================================
   5. UMKM — Render Grid & Detail
   ================================================ */

/**
 * Render grid kartu UMKM
 * @param {string} filter - nama kategori untuk filter
 *                          kosong ('') = tampilkan semua
 */
function renderGrid(filter) {
  const grid = document.getElementById('umkm-grid');
  if (!grid) return; /* elemen tidak ada di halaman ini — aman, berhenti saja */

  /* Kalau data belum sempat dimuat (masih proses fetch) */
  if (!UMKM.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:30px 16px; color:#7A8E82; font-size:12px">
        Memuat data UMKM...
      </div>`;
    return;
  }

  /* Filter data berdasarkan kategori, atau ambil semua */
  const list = filter
    ? UMKM.filter(function(u) { return u.cat === filter; })
    : UMKM;

  /* Kalau hasil filter kosong (kategori tidak ada UMKM-nya) */
  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:30px 16px; color:#7A8E82; font-size:12px">
        Belum ada UMKM di kategori ini.
      </div>`;
    return;
  }

  /* Buat HTML kartu untuk setiap UMKM.
     CATATAN PERBAIKAN (25 Juni 2026): dulu .ug-cat dipakai untuk
     menampilkan RATING, sehingga teks KATEGORI USAHA (Jasa, Perkebunan,
     dst) hanya kelihatan sebagai badge kecil di pojok foto — tidak ada
     versi teks biasa di info card. Sekarang kategori tetap tampil
     sebagai teks di .ug-cat (sesuai nama class & styling-nya di CSS),
     rating dipindah ke baris baru .ug-rating supaya kedua info ini
     sama-sama kelihatan, tidak saling timpa. */
  grid.innerHTML = list.map(function(u) {
    var thumbHtml = u.cover
      ? '<img src="' + escapeHtml(u.cover) + '" alt="' + escapeHtml(u.name) + '" width="100%" height="100%" loading="lazy">'
      : escapeHtml(u.emoji);
    return `
      <div class="ugcard" onclick="showUMKM(${u.id})">
        <div class="ug-img">
          ${thumbHtml}
          <div class="ug-badge">${escapeHtml(u.cat)}</div>
        </div>
        <div class="ug-info">
          <div class="ug-name">${escapeHtml(u.name)}</div>
          <div class="ug-cat">${escapeHtml(u.cat)}</div>
          <div class="ug-rating">${u.rating && u.rating !== '0' ? '⭐ ' + escapeHtml(u.rating) : '<span class="ug-new">Baru</span>'}</div>
          ${u.phone ? `<a class="ug-wa" href="https://wa.me/${escapeHtml(u.phone)}" target="_blank" onclick="event.stopPropagation()">💬 Chat WA</a>` : `<span class="ug-wa-empty">📍 Lihat Maps</span>`}
        </div>
      </div>`;
  }).join('');
}

/**
 * Render beberapa card "UMKM Unggulan" di Beranda (section "Lapak Warga").
 * Diambil dari beberapa UMKM PERTAMA di data/umkm.json (urut sesuai array,
 * bukan hardcoded ID) — supaya kalau Zen ubah urutan/ID UMKM di JSON
 * (misal nanti nambah UMKM baru di awal), card ini OTOMATIS ikut benar,
 * tidak perlu sentuh index.html sama sekali.
 *
 * Dulu ini hardcoded 4 card manual dengan showUMKM(0), showUMKM(1), dst —
 * rawan nunjuk ke UMKM yang salah kalau ID berubah. Sekarang aman karena
 * render dari data langsung.
 */
function renderUMKMBeranda() {
  const el = document.getElementById('umkm-beranda-list');
  if (!el) return;

  /* ── Shuffle berbobot ─────────────────────────────────────────
     Masalah lama: slice(0, 8) selalu ambil 8 UMKM pertama di array
     (semua Bibit/Perkebunan) — Dombaku, Sapu Jagad Fruits, Isron,
     Plandemic tidak pernah muncul di Beranda padahal justru paling
     beda & menarik untuk orang luar dusun.

     Strategi fix:
     1. Kelompokkan UMKM per kategori.
     2. Ambil 1 UMKM acak per kategori sebagai "wakil" (pastikan
        variasi selalu terwakili — Peternakan, Produk Lokal, Jasa,
        Pertukangan tidak ketimpa oleh 12 Perkebunan).
     3. Tambah UMKM acak dari sisa pool sampai total 8 terpenuhi.
     4. Acak urutan akhir supaya posisi tidak membeku di layout.

     Hasilnya: setiap buka Beranda, 8 card yang tampil selalu beragam
     kategorinya, dan sisa acak dari pool supaya tidak terasa "diatur".
     Jumlah 8 tetap sama — tidak ada perubahan layout. */
  const JUMLAH_TAMPIL = 8;

  if (!UMKM.length) {
    el.innerHTML = `<div style="font-size:12px; color:var(--tx3); padding:8px 0">Belum ada UMKM terdaftar.</div>`;
    return;
  }

  /* Fisher-Yates shuffle — acak array tanpa modify aslinya */
  function acak(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* Kelompokkan per kategori */
  var perKat = {};
  UMKM.forEach(function(u) {
    if (!perKat[u.cat]) perKat[u.cat] = [];
    perKat[u.cat].push(u);
  });

  /* Pilih 1 wakil acak per kategori */
  var wakil = [];
  var idWakil = {};
  Object.keys(perKat).forEach(function(kat) {
    var pilih = acak(perKat[kat])[0];
    wakil.push(pilih);
    idWakil[pilih.id] = true;
  });

  /* Sisa UMKM yang belum jadi wakil — dipakai mengisi kuota sampai 8 */
  var sisa = acak(UMKM.filter(function(u) { return !idWakil[u.id]; }));

  /* Gabung wakil (diacak urutannya) + sisa, potong ke JUMLAH_TAMPIL */
  var list = acak(wakil).concat(sisa).slice(0, JUMLAH_TAMPIL);

  el.innerHTML = list.map(function(u) {
    var thumbHtml = u.cover
      ? '<img src="' + escapeHtml(u.cover) + '" alt="' + escapeHtml(u.name) + '" width="100%" height="100%" loading="lazy">'
      : escapeHtml(u.emoji);
    return `
      <div class="ucard" onclick="showUMKM(${u.id})">
        <div class="uimg">${thumbHtml}<div class="uwa">💬</div></div>
        <div class="uinfo"><div class="uname">${escapeHtml(u.name)}</div><div class="ucat">${escapeHtml(u.cat)}</div></div>
      </div>`;
  }).join('');
}

/**
 * Update angka "UMKM Aktif" di Hero (#stat-umkm-hero) dan section
 * Kenali Ngemplak (#stat-umkm-potensi) supaya otomatis mengikuti
 * jumlah riil di data/umkm.json — tidak perlu lagi diingat-ingat
 * untuk update manual tiap kali nambah/hapus UMKM.
 *
 * CATATAN soal tanda "+" di #stat-umkm-potensi: itu SENGAJA tetap
 * ditambahkan manual di sini (bukan cuma angka polos), karena
 * maksudnya "jumlah ini MASIH BISA bertambah" (ada potensi UMKM
 * lain yang belum terdaftar) — bukan klaim angka pasti. Hero
 * (#stat-umkm-hero) sebaliknya tidak pakai "+", karena di situ
 * fungsinya sebagai angka kredibilitas yang harus akurat 1:1
 * dengan jumlah yang benar-benar terdaftar.
 */
function renderStatUMKM() {
  const jumlah = UMKM.length;

  const heroEl = document.getElementById('stat-umkm-hero');
  if (heroEl) { heroEl.textContent = jumlah; }

  const potensiEl = document.getElementById('stat-umkm-potensi');
  if (potensiEl) { potensiEl.textContent = jumlah + '+'; }
}

/**
 * Hitung & tampilkan Trust Strip di beranda:
 * - Rata-rata rating berbobot (weighted average) dari UMKM yang punya rating > 0
 * - Total ulasan semua UMKM
 * Dipanggil setelah data UMKM berhasil dimuat oleh muatDataUMKM().
 *
 * CATATAN: UMKM tanpa rating (rating = 0 / "0") sengaja TIDAK dihitung
 * ke rata-rata supaya angka tidak turun karena data belum diisi —
 * bukan berarti ratingnya 0, tapi belum ada datanya.
 * Kalau tidak ada satu pun UMKM yang punya rating, trust strip disembunyikan
 * supaya tidak menampilkan angka kosong atau nol.
 */
function renderTrustStrip() {
  var ratingEl  = document.getElementById('trust-rating');
  var ulasanEl  = document.getElementById('trust-ulasan');
  var stripEl   = document.getElementById('trust-strip');
  /* elemen desktop di dalam hero */
  var ratingElD = document.getElementById('trust-rating-d');
  var ulasanElD = document.getElementById('trust-ulasan-d');

  if (!ratingEl || !ulasanEl || !stripEl) return;

  /* Hanya hitung UMKM yang punya rating & ulasan > 0 */
  var adaRating = UMKM.filter(function(u) {
    return parseFloat(u.rating) > 0 && parseInt(u.ulasan) > 0;
  });

  if (adaRating.length === 0) {
    stripEl.style.display = 'none'; /* sembunyikan kalau belum ada data sama sekali */
    return;
  }

  var totalUlasan  = adaRating.reduce(function(s, u) { return s + parseInt(u.ulasan); }, 0);
  var weightedSum  = adaRating.reduce(function(s, u) { return s + parseFloat(u.rating) * parseInt(u.ulasan); }, 0);
  var avgRating    = weightedSum / totalUlasan;

  /* Bulatkan 1 desimal (4.85 → 4.9, 4.94 → 4.9, dst) */
  var avgTampil = avgRating.toFixed(1);

  /* Mobile strip — inject innerHTML supaya bintang & plus bisa diberi warna emas */
  ratingEl.innerHTML = avgTampil + '<span class="ts-star">★</span>';
  ulasanEl.innerHTML = totalUlasan + '<span class="ts-sup">+</span>';

  /* Desktop hero-trust — angka putih, bintang emas (sudah di HTML, cukup update angkanya) */
  if (ratingElD) ratingElD.innerHTML = avgTampil + '<span class="ht-star">★</span>';
  if (ulasanElD) ulasanElD.innerHTML = totalUlasan + '<span class="ht-sup">+</span>';
}

/**
 * Ubah nama UMKM jadi "slug" URL yang pendek & enak dibaca.
 * Contoh: "Plandemic Space" -> "plandemic-space"
 * Dipakai supaya link share UMKM gak pakai ?umkm=6 (gak jelas),
 * tapi ?umkm=plandemic-space (jelas, enak dibaca).
 * Tidak perlu field manual baru di JSON — slug dihitung otomatis
 * dari field "name" yang sudah ada.
 */

/* [XSS-01] Escape teks user sebelum disisip ke innerHTML */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') /* hilangkan aksen kalau ada */
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Cek apakah URL halaman ini punya parameter ?umkm=slug-nama.
 * Kalau ada dan slug-nya cocok dengan salah satu UMKM, langsung
 * buka halaman detail UMKM itu — supaya link yang di-share lewat
 * tombol Share (lihat shareUMKM()) bisa langsung dibuka orang lain
 * tanpa perlu cari manual dari daftar UMKM.
 *
 * Dipanggil sekali, tepat setelah data UMKM selesai dimuat
 * (lihat akhir muatDataUMKM()).
 */
function bukaUMKMdariURL() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('umkm');
  if (!slug) return; /* tidak ada parameter umkm di URL — halaman dibuka normal */

  const cocok = UMKM.find(function(item) { return slugify(item.name) === slug; });

  if (!cocok) {
    if (DEBUG) console.warn('⚠️ Link UMKM "' + slug + '" tidak ditemukan — mungkin nama usaha sudah berubah.');
    return; /* slug tidak ketemu — biarkan saja di Beranda, tidak perlu alert mengganggu */
  }

  /* updateUrl=false karena URL sudah benar (orang ini yang
     membuka link itu), tidak perlu pushState lagi */
  showUMKM(cocok.id, false);
}

/**
 * Tampilkan halaman detail UMKM
 * Mengisi semua elemen halaman detail dengan data UMKM
 * @param {number} id - id UMKM (sesuai properti id di data)
 * @param {boolean} updateUrl - true kalau perlu update URL browser
 *                              (default true; di-set false saat
 *                              dipanggil dari baca-URL-saat-load,
 *                              supaya gak dobel-update URL yang
 *                              sudah benar)
 */
function showUMKM(id, updateUrl) {
  if (updateUrl === undefined) updateUrl = true;

  /* Cari data UMKM berdasarkan id (pakai .find supaya
     tidak bergantung urutan array — lebih aman dari
     metode UMKM[id] yang dulu bisa salah index) */
  const u = UMKM.find(function(item) { return item.id === id; });

  /* Kalau data tidak ditemukan — kasih tau jelas, jangan diam saja */
  if (!u) {
    if (DEBUG) console.warn('⚠️ UMKM dengan id', id, 'tidak ditemukan di data/umkm.json');
    alert('Maaf, data UMKM ini tidak ditemukan. Silakan kembali ke daftar UMKM.');
    return;
  }

  /* Simpan sebagai UMKM aktif — dipakai fungsi shareUMKM() */
  currentUMKM = u;

  /* Update title, meta description, Open Graph, canonical, dan
     Schema.org LocalBusiness supaya spesifik untuk UMKM ini —
     lihat fungsi updateMetaUMKM() di bagian atas file. */
  updateMetaUMKM(u);

  /* Update URL browser jadi ?umkm=slug-nama, TANPA reload halaman.
     Supaya kalau di-share, orang lain yang klik link ini langsung
     diarahkan ke detail UMKM yang sama (lihat bukaUMKMdariURL()). */
  if (updateUrl) {
    const slug = slugify(u.name);
    const urlBaru = window.location.pathname + '?umkm=' + slug;
    window.history.pushState({ umkmId: u.id }, '', urlBaru);
  }

  /**
   * Helper kecil — isi elemen HTML dengan aman.
   * Kalau elemennya tidak ada di halaman, cuma kasih
   * peringatan di console, tidak bikin semua proses
   * berhenti gara-gara 1 elemen hilang.
   */
  function isiTeks(elementId, nilai) {
    const el = document.getElementById(elementId);
    if (el) { el.textContent = nilai; }
    else if (DEBUG) { console.warn('⚠️ Elemen #' + elementId + ' tidak ditemukan di HTML'); }
  }
  function isiLink(elementId, nilai) {
    const el = document.getElementById(elementId);
    if (el) { el.href = nilai; }
    else if (DEBUG) { console.warn('⚠️ Elemen #' + elementId + ' tidak ditemukan di HTML'); }
  }

  /**
   * Khusus tombol sosmed/marketplace (IG, FB, TikTok, YouTube, Shopee,
   * Tokopedia): kalau linknya belum diisi (kosong, "#", atau memang
   * tidak ada di data), tombolnya DISEMBUNYIKAN otomatis — daripada
   * nampilin tombol yang ternyata gak ke mana-mana.
   *
   * PENTING buat Zen: ini otomatis, tidak perlu setting apa-apa.
   * Begitu link diisi link asli di umkm.json (contoh field "sp" diisi
   * link Shopee), tombolnya akan MUNCUL SENDIRI saat halaman dibuka
   * lagi. Tidak perlu sentuh HTML/CSS sama sekali.
   */
  function isiLinkSosmed(elementId, nilai) {
    const el = document.getElementById(elementId);
    if (!el) { if (DEBUG) console.warn('⚠️ Elemen #' + elementId + ' tidak ditemukan di HTML'); return; }

    const isiKosong = !nilai || nilai === '#' || nilai.trim() === '';
    if (isiKosong) {
      el.style.display = 'none';
    } else {
      el.href = nilai;
      el.style.display = ''; /* tampilkan lagi (jaga-jaga kalau sebelumnya disembunyikan UMKM lain) */
    }
  }

  /* ── Isi bagian atas (cover & nama) ── */
  const cover = document.getElementById('ud-cover');
  if (cover) {
    const backBtn = cover.querySelector('.ud-back');
    const shareBtn = cover.querySelector('.ud-share');
    if (u.cover) {
      cover.innerHTML = '<img src="' + escapeHtml(u.cover) + '" alt="' + escapeHtml(u.name) + '" width="100%" height="100%" loading="eager">';
      cover.style.background = '';
    } else {
      /* Fallback: gradien berdasarkan kategori, emoji besar di tengah */
      const gradienKat = {
        'Perkebunan':  'linear-gradient(135deg, #1a3d2b 0%, #2d6a4f 60%, #52b788 100%)',
        'Pertanian':   'linear-gradient(135deg, #2d4a1e 0%, #4a7c3f 60%, #74b560 100%)',
        'Peternakan':  'linear-gradient(135deg, #3d2b1a 0%, #7c5c3f 60%, #b58b60 100%)',
        'Pertukangan': 'linear-gradient(135deg, #2b2010 0%, #5c4a28 60%, #8b7040 100%)',
        'Jasa':        'linear-gradient(135deg, #1a2a3d 0%, #2d4a6a 60%, #5280a8 100%)',
      };
      const grad = gradienKat[u.cat] || 'linear-gradient(135deg, #1e3a2f 0%, #2d6a4f 100%)';
      cover.innerHTML = '<div class="ud-cover-fallback"><span class="ud-cover-emoji">' + escapeHtml(u.emoji) + '</span><span class="ud-cover-name">' + escapeHtml(u.name) + '</span></div>';
      cover.style.background = grad;
    }
    if (backBtn) cover.appendChild(backBtn);
    if (shareBtn) cover.appendChild(shareBtn);
  }
  isiTeks('ud-logo', u.emoji);
  isiTeks('ud-name', u.name);
  isiTeks('ud-cat', u.cat);

  /* ── Tagline — 1 baris hook antara nama & deskripsi ── */
  const taglineEl = document.getElementById('ud-tagline');
  if (taglineEl) {
    if (u.tagline) {
      taglineEl.textContent = u.tagline;
      taglineEl.style.display = '';
    } else {
      taglineEl.style.display = 'none';
    }
  }

  /* Rating pill — kalau 0 atau kosong tampilkan badge "Baru", kalau ada tampilkan bintang + jumlah ulasan */
  const ratingPill = document.getElementById('ud-rating-pill');
  const adaRating = u.rating && u.rating !== '0';
  const jumlahUlasan = u.ulasan || 0;
  if (ratingPill) {
    if (adaRating) {
      ratingPill.innerHTML = `<span>⭐</span><span class="rn">${escapeHtml(u.rating)}</span>${jumlahUlasan ? `<span class="rn-ulasan">(${escapeHtml(String(jumlahUlasan))})</span>` : ''}`;
      ratingPill.style.display = '';
    } else {
      ratingPill.innerHTML = `<span class="rn-new">Baru</span>`;
      ratingPill.style.display = '';
    }
  }

  /* Rating row di Info Operasional */
  const ratingRow = document.getElementById('ud-rating-row');
  const ratingInfo = document.getElementById('ud-rating-info');
  if (ratingRow && ratingInfo) {
    if (adaRating) {
      ratingInfo.textContent = jumlahUlasan
        ? `${u.rating} dari ${jumlahUlasan} ulasan`
        : `${u.rating} bintang`;
      ratingRow.style.display = '';
    } else {
      ratingRow.style.display = 'none';
    }
  }

  /* ── Isi deskripsi ── */
  isiTeks('ud-desc', u.desc);

  /* ── Tombol WA (dengan pesan otomatis) ── */
  /* Tombol WA — sembunyikan otomatis kalau phone kosong */
  const waBtn = document.getElementById('ud-wa-btn');
  const waBtn2 = document.getElementById('ud-wa2');
  if (u.phone) {
    if (waBtn) { waBtn.href = `https://wa.me/${u.phone}?text=Halo%20${encodeURIComponent(u.name)}%2C%20saya%20ingin%20tanya%20lebih%20lanjut`; waBtn.style.display = ''; }
    if (waBtn2) { waBtn2.href = `https://wa.me/${u.phone}`; waBtn2.style.display = ''; }
  } else {
    if (waBtn) waBtn.style.display = 'none';
    if (waBtn2) waBtn2.style.display = 'none';
  }

  /* ── Tombol Maps — sembunyikan kalau maps kosong atau belum diisi ── */
  const adaMaps = u.maps && u.maps !== '#' && u.maps.trim() !== '';
  const mapBtn = document.getElementById('ud-map-btn');
  if (mapBtn) {
    if (adaMaps) { mapBtn.href = u.maps; mapBtn.style.display = ''; }
    else { mapBtn.style.display = 'none'; }
  }

  /* ── Link "Lihat Review di Google Maps" — reuse link Maps yang sama.
     CATATAN: ini mengarahkan ke profil Maps usaha (kalau linknya sudah
     diisi di field maps). Kalau kosong, tombol Maps juga sudah disembunyikan
     di blok di atas, jadi link ini tidak pernah tampil tanpa URL yang valid. */

  /* ── Info operasional (alamat, jam, telepon) ── */
  isiTeks('ud-alamat', u.alamat);
  isiTeks('ud-jam', u.jam);
  isiTeks('ud-phone', u.phone ? '+' + u.phone : '-');
  /* Area layanan — tampil kalau ada, sembunyi kalau tidak */
  const areaRow = document.getElementById('ud-area-row');
  if (u.area) {
    isiTeks('ud-area', u.area);
    if (areaRow) areaRow.style.display = '';
  } else {
    if (areaRow) areaRow.style.display = 'none';
  }

  /* ── Link sosmed & marketplace — otomatis sembunyi kalau kosong ── */
  isiLinkSosmed('ud-ig', u.ig);
  isiLinkSosmed('ud-fb', u.fb);
  isiLinkSosmed('ud-tt', u.tt);
  isiLinkSosmed('ud-yt', u.yt);
  isiLinkSosmed('ud-sp', u.sp);
  isiLinkSosmed('ud-tp', u.tp);

  /* Kalau SEMUA link sosmed kosong, sembunyikan seluruh section-nya
     (judul + grid) — daripada nampilin judul "Media Sosial & Marketplace"
     tanpa satu pun tombol di bawahnya. */
  const semuaLinkSosmed = [u.ig, u.fb, u.tt, u.yt, u.sp, u.tp];
  const adaYangKeisi = semuaLinkSosmed.some(function(link) {
    return link && link !== '#' && link.trim() !== '';
  });
  /* ── Render FAQ — dari field faq di umkm.json ── */
  const faqEl = document.getElementById('ud-faq');
  const faqSec = document.getElementById('ud-faq-sec');
  if (faqEl && faqSec) {
    const faqList = u.faq || [];
    if (faqList.length) {
      faqEl.innerHTML = faqList.map(function(f) {
        return `<details class="faq-item">
          <summary class="faq-q">${escapeHtml(f.q)}</summary>
          <div class="faq-a">${escapeHtml(f.a)}</div>
        </details>`;
      }).join('');
      faqSec.style.display = '';
    } else {
      faqSec.style.display = 'none';
    }
  }

  const sosmedSec = document.getElementById('ud-sosmed-sec');
  if (sosmedSec) {
    sosmedSec.style.display = adaYangKeisi ? '' : 'none';
  }

  /* ── Tombol WA kedua (di bagian bawah) ── */
  isiLink('ud-wa2', `https://wa.me/${u.phone}`);

  /* ── Render galeri foto (cek dulu array-nya ada) ──
     Per 26 Juni 2026: semua 19 UMKM sudah pakai path foto asli
     (img/umkm/<slug>/gallery-NN.webp) — tidak ada lagi emoji placeholder.
     Kode di bawah sudah benar: cek e.includes('img/') untuk render <img>,
     fallback ke teks biasa kalau bukan path (tidak dipakai saat ini tapi
     aman dibiarkan untuk kompatibilitas). loading="lazy" wajib dijaga. */
  const galeriEl = document.getElementById('ud-galeri');
  if (galeriEl) {
    const fotoArr = (u.galeri || []).filter(function(e) { return e; });
    galeriEl.className = fotoArr.length >= 4 ? 'galeri galeri-banyak' : 'galeri';
    galeriEl.innerHTML = fotoArr.map(function(e) {
      if (e && e.includes('img/')) {
        return '<div class="gfoto"><img src="' + escapeHtml(e) + '" alt="' + escapeHtml(u.name) + ' - foto" width="100%" height="100%" loading="lazy"></div>';
      }
      return '<div class="gfoto">' + escapeHtml(e) + '</div>';
    }).join('');
  }

  /* ── Render daftar produk/jasa (cek dulu array-nya ada) ── */
  const produkEl = document.getElementById('ud-products');
  if (produkEl) {
    produkEl.innerHTML = (u.products || []).map(function(p) {
      var keteranganHtml = p.k
        ? '<div class="pketerangan">' + escapeHtml(p.k) + '</div>'
        : '';
      return `
        <div class="pcard">
          <div class="pimg">${escapeHtml(p.e)}</div>
          <div class="pinfo">
            <div class="pname">${escapeHtml(p.n)}</div>
            ${keteranganHtml}
          </div>
        </div>`;
    }).join('');
  }

  /* ── Render Usaha Terkait ──
     List vertikal compact tanpa foto — lebih ringan dan tidak
     mendistraksi dari konten utama. Pakai class .terkait-list /
     .terkait-item (didefinisikan di style.css).
     Section disembunyikan otomatis kalau field terkait kosong atau
     tidak ada satu pun id yang cocok di data. */
  const terkaitSec = document.getElementById('ud-terkait-sec');
  const terkaitList = document.getElementById('ud-terkait-list');
  if (terkaitSec && terkaitList) {
    const idTerkait = u.terkait || [];
    const dataTerkait = idTerkait
      .map(function(tid) { return UMKM.find(function(x) { return x.id === tid; }); })
      .filter(Boolean); /* buang kalau id tidak ketemu (data tidak konsisten) */

    if (dataTerkait.length) {
      terkaitList.innerHTML = '<div class="terkait-list">' +
        dataTerkait.map(function(t) {
          return '<div class="terkait-item" onclick="showUMKM(' + t.id + ')">' +
            '<span class="terkait-ico">' + escapeHtml(t.emoji) + '</span>' +
            '<div class="terkait-info">' +
              '<div class="terkait-name">' + escapeHtml(t.name) + '</div>' +
              '<div class="terkait-cat">' + escapeHtml(t.cat) + '</div>' +
            '</div>' +
            '<span class="terkait-arr">›</span>' +
          '</div>';
        }).join('') +
      '</div>';
      terkaitSec.style.display = '';
    } else {
      terkaitSec.style.display = 'none';
    }
  }

  /* Pindah ke halaman detail */
  nav('umkm-detail');
}

/**
 * Bagikan halaman UMKM yang sedang dibuka.
 * Pakai Web Share API native (didukung mayoritas browser HP modern —
 * Chrome Android, Safari iOS) supaya warga bisa share langsung ke
 * WhatsApp/lainnya tanpa perlu library tambahan (gratis, no dependency).
 * Kalau browser tidak mendukung (jarang, biasanya browser desktop lama),
 * fallback ke copy link ke clipboard.
 */
function shareUMKM() {
  if (!currentUMKM) return;

  /* Generate URL share secara eksplisit dari slug nama UMKM —
     tidak mengandalkan window.location.href apa adanya, supaya
     pasti benar walau ada perubahan urutan kode di masa depan. */
  const slug = slugify(currentUMKM.name);
  const urlShare = window.location.origin + window.location.pathname + '?umkm=' + slug;

  const shareData = {
    title: `${currentUMKM.name} — SIMBAH Ngemplak`,
    text: `Cek ${currentUMKM.name} (${currentUMKM.cat}) di Dusun Ngemplak`,
    url: urlShare
  };

  if (navigator.share) {
    navigator.share(shareData).catch(function() {
      /* User membatalkan share — tidak perlu tindakan apa-apa */
    });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(urlShare).then(function() {
      alert('Link halaman ini sudah disalin. Silakan tempel (paste) ke WhatsApp atau aplikasi lain.');
    }).catch(function() {
      alert('Tidak bisa menyalin link otomatis. Silakan salin alamat dari address bar browser.');
    });
  } else {
    alert('Browser ini belum mendukung fitur share otomatis. Silakan salin alamat dari address bar browser.');
  }
}


/* ================================================
   6. FILTER UMKM
   Tombol filter kategori di halaman UMKM
   ================================================ */

/**
 * Generate chip filter UMKM secara dinamis dari kategori yang ada di data.
 * Chip "Semua" sudah ada di HTML — fungsi ini hanya tambah chip per kategori
 * yang muncul di umkm.json, diurutkan alfabet.
 * Kalau nanti ada UMKM baru dengan kategori baru, chip-nya otomatis muncul.
 * 
 * FIX (26 Juni 2026): jangan pakai innerHTML = '' — itu hapus event listener.
 * Sebaiknya removeChild semua chip kategori (bukan "Semua"), atau rebuild
 * keseluruhan tanpa hapus DOM.
 */
function renderFilterChips() {
  const row = document.getElementById('filter-row');
  if (!row) return;

  /* Kumpulkan kategori unik, urutkan alfabet */
  const cats = [...new Set(UMKM.map(function(u) { return u.cat; }).filter(Boolean))].sort();

  /* Hapus chip kategori lama (bukan "Semua") tanpa hapus event listener "Semua" */
  const semuaChip = row.querySelector('[data-filter=""]');
  const chipKategoriLama = row.querySelectorAll('[data-filter]:not([data-filter=""])');
  chipKategoriLama.forEach(function(chip) {
    row.removeChild(chip);
  });

  /* Buat chip kategori baru */
  cats.forEach(function(cat) {
    const btn = document.createElement('button');
    btn.className = 'fchip';
    btn.dataset.filter = cat;
    btn.textContent = cat;
    btn.addEventListener('click', function() {
      row.querySelectorAll('.fchip').forEach(function(x) { x.classList.remove('active'); });
      btn.classList.add('active');
      filterUMKM(cat);
    });
    row.appendChild(btn);
  });

  /* Pastikan chip "Semua" punya event listener yang benar.
     Pakai addEventListener untuk konsistensi dengan chip kategori. */
  if (semuaChip) {
    /* Hapus listener lama kalau ada (hindari duplikat) */
    const semuaChipClone = semuaChip.cloneNode(false);
    semuaChipClone.className = semuaChip.className;
    semuaChipClone.textContent = semuaChip.textContent;
    semuaChipClone.dataset.filter = '';
    semuaChipClone.addEventListener('click', function() {
      row.querySelectorAll('.fchip').forEach(function(x) { x.classList.remove('active'); });
      semuaChipClone.classList.add('active');
      filterUMKM('');
    });
    row.replaceChild(semuaChipClone, semuaChip);
  }
}

/**
 * Filter UMKM berdasarkan kategori yang diklik
 * Dipanggil lewat event listener di bawah
 * @param {string} cat - nama kategori ('') = semua
 */
function filterUMKM(cat) {
  renderGrid(cat);
}


/* ================================================
   8. DATA AGENDA — Sumber Tunggal
   ------------------------------------------------
   Dulu data agenda ditulis 2x manual: sekali sebagai
   HTML statis di index.html, sekali lagi sebagai
   AGENDA_SEARCH di sini (khusus search). Akibatnya
   gampang gak sinkron — itu sebabnya tanggal di
   halaman Agenda sempat "basi" (masih nunjuk 2025).

   SEKARANG: HANYA edit array AGENDA di bawah ini.
   - Beranda (3 agenda terdekat)
   - Halaman Agenda (daftar lengkap per bulan)
   - Search global
   ...semuanya otomatis render dari array ini. Index.html
   tidak lagi punya card agenda hardcoded.

   FORMAT TANGGAL: WAJIB "YYYY-MM-DD" (contoh: "2026-07-15").
   Ini supaya JS bisa baca tanggalnya dan otomatis:
   - Sembunyikan/pindahkan acara yang sudah lewat
   - Generate label bulan ("Juli 2026") otomatis,
     tidak perlu ditulis manual lagi

   CARA TAMBAH AGENDA BARU:
   Copy salah satu blok { ... }, paste di akhir
   sebelum tanda ] penutup, ganti isinya. Urutan
   tidak harus kronologis — JS otomatis mengurutkan.

   ------------------------------------------------
   PENTING — Sesuai arah Product Roadmap SIMBAH:
   Agenda di sini KHUSUS untuk EVENT PUBLIK BESAR yang
   layak diketahui orang luar dusun (festival, sedekah
   bumi, jalan sehat, HUT dusun, kirab budaya, dll) —
   BUKAN agenda internal RT/rutin (kerja bakti, posyandu,
   pengajian rutin, rapat RT). Agenda rutin RT cukup
   diumumkan lewat grup WA warga seperti biasa, tidak
   perlu masuk web supaya halaman Agenda tetap ringkas
   dan benar-benar jadi etalase ke orang luar.
   Frekuensi realistis: ±1 event besar per bulan.
   ------------------------------------------------

   tag yang dikenali (untuk warna badge):
   'Festival', 'HUT Dusun', 'Kirab' → badge hijau
   'Sedekah Bumi', 'Jalan Sehat'    → badge emas
   (lihat fungsi tagClass() di bawah kalau mau nambah)
   ================================================ */
const AGENDA = [
  { title: 'Jalan Sehat & Bazar UMKM',     date: '2026-07-12', time: '06.30 WIB', lokasi: 'Lapangan Dusun Ngemplak', tag: 'Jalan Sehat' },
  { title: 'Sedekah Bumi Dusun Ngemplak',  date: '2026-08-09', time: '08.00 WIB', lokasi: 'Balai Dusun & Punden Desa', tag: 'Sedekah Bumi' },
  { title: 'HUT Kemerdekaan & Kirab Budaya', date: '2026-08-17', time: '07.00 WIB', lokasi: 'Lapangan Dusun Ngemplak', tag: 'HUT Dusun' },
  { title: 'Festival Panen Raya',          date: '2026-09-13', time: '09.00 WIB', lokasi: 'Lapangan Dusun Ngemplak', tag: 'Festival' },
];

/* ================================================
   8B. DATA INVENTARIS — Sumber Tunggal
   ------------------------------------------------
   Sama seperti AGENDA, data inventaris HANYA ditulis
   di sini (bukan di index.html lagi). Halaman Inventaris
   penuh dan Search global render dari array yang sama.

   Field per item:
   - nama     : nama barang
   - jumlah   : jumlah + satuan (contoh: "150 Buah")
   - kondisi  : "Baik" / "Perlu Cek" / "Rusak" (menentukan warna badge)
   - lokasi   : lokasi penyimpanan
   - pj       : penanggung jawab/pengelola (RW 02, PKK, dst)
   - kelompok : nama kelompok/kategori (jadi judul section)
   - emoji    : ikon kelompok (1 ikon dipakai untuk semua barang di kelompok itu)

   CARA TAMBAH BARANG BARU:
   Copy salah satu blok { ... }, paste sebelum tanda ]
   penutup, ganti isinya. Barang otomatis dikelompokkan
   berdasarkan field "kelompok" — tidak perlu bikin
   section HTML baru secara manual.
   ================================================ */
const INVENTARIS = [
  { nama: 'Tratag Besi', jumlah: '1 Set', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '🏗️' },
  { nama: 'Tiang Utama Tratag', jumlah: '32 Batang', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '🏗️' },
  { nama: 'Palang Atas Tratag', jumlah: '48 Batang', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '🏗️' },
  { nama: 'Palang Samping Tratag', jumlah: '32 Batang', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '🏗️' },
  { nama: 'Seng Atap Tratag', jumlah: '120 Lembar', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '🏗️' },
  { nama: 'Terpal Plastik Besar', jumlah: '8 Lembar', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '🏗️' },
  { nama: 'Kipas Gantung Tratag', jumlah: '8 Unit', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '🌀' },
  { nama: 'Lampu Penerangan', jumlah: '12 Unit', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '💡' },
  { nama: 'Kabel Roll', jumlah: '5 Unit', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '🔌' },
  { nama: 'Panggung Bongkar Pasang', jumlah: '1 Set', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'RW 02', kelompok: 'Sarana Hajatan', emoji: '🏗️' },

  { nama: 'Kursi Plastik', jumlah: '150 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Perlengkapan Acara', emoji: '🪑' },
  { nama: 'Meja Plastik', jumlah: '20 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Perlengkapan Acara', emoji: '🍽️' },
  { nama: 'Meja Prasmanan', jumlah: '10 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Perlengkapan Acara', emoji: '🍽️' },
  { nama: 'Taplak Meja Seragam', jumlah: '20 Lembar', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Perlengkapan Acara', emoji: '🧵' },
  { nama: 'Kain Penutup Dekorasi', jumlah: '15 Lembar', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Perlengkapan Acara', emoji: '🎀' },
  { nama: 'Kotak Sumbangan', jumlah: '2 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Perlengkapan Acara', emoji: '📦' },

  { nama: 'Soblok / Dandang Air', jumlah: '4 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Dapur', emoji: '🍲' },
  { nama: 'Wajan Besar', jumlah: '4 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Dapur', emoji: '🍳' },
  { nama: 'Tempat Nasi', jumlah: '8 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Dapur', emoji: '🍚' },
  { nama: 'Tempat Sayur', jumlah: '8 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Dapur', emoji: '🥘' },
  { nama: 'Tempat Krupuk', jumlah: '6 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Dapur', emoji: '🥣' },
  { nama: 'Centong', jumlah: '10 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Dapur', emoji: '🥄' },

  { nama: 'Piring', jumlah: '300 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Makan Minum', emoji: '🍽️' },
  { nama: 'Sendok', jumlah: '300 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Makan Minum', emoji: '🥄' },
  { nama: 'Gelas', jumlah: '10 Krat', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Makan Minum', emoji: '🥤' },
  { nama: 'Bak Air Besar', jumlah: '2 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Makan Minum', emoji: '🪣' },
  { nama: 'Tong Air', jumlah: '6 Buah', kondisi: 'Baik', lokasi: 'Gudang Dusun', pj: 'PKK', kelompok: 'Peralatan Makan Minum', emoji: '🛢️' },
];

/** Map kondisi barang → kelas badge warna (lihat .ibg/.ibb/.ibr di style.css) */
function kondisiClass(kondisi) {
  if (kondisi === 'Baik') return 'ibg';
  if (kondisi === 'Rusak') return 'ibr';
  return 'ibb'; /* default: Perlu Cek / Butuh Perhatian */
}

/** Render 1 card inventaris (dipakai halaman Inventaris) */
function renderCardInventaris(item) {
  return `
    <div class="inv">
      <div class="iico">${item.emoji}</div>
      <div style="flex:1"><div class="inm">${item.nama}</div><div class="idet">${item.jumlah} · ${item.lokasi}</div></div>
      <span class="ibadge ${kondisiClass(item.kondisi)}">${item.kondisi}</span>
    </div>`;
}

/**
 * Render halaman Inventaris penuh, dikelompokkan otomatis per
 * field "kelompok" — 1 tombol WA per kelompok (bukan per barang,
 * supaya tidak ada 26 tombol WA berulang di halaman yang sama).
 */
function renderInventarisPage() {
  const el = document.getElementById('inventaris-page-list');
  if (!el) return;

  /* Kelompokkan berdasarkan field "kelompok", urut sesuai urutan
     kemunculan pertama di array (bukan alfabet) */
  const kelompokOrder = [];
  const kelompokMap = {};
  INVENTARIS.forEach(function(item) {
    if (!kelompokMap[item.kelompok]) {
      kelompokMap[item.kelompok] = [];
      kelompokOrder.push(item.kelompok);
    }
    kelompokMap[item.kelompok].push(item);
  });

  el.innerHTML = kelompokOrder.map(function(kelompok) {
    const items = kelompokMap[kelompok];
    const pj = items[0].pj; /* PJ diasumsikan sama untuk 1 kelompok */
    return `
      <div class="sec">
        <div class="sec-hdr"><div class="sec-ttl">${kelompok}</div></div>
        <div class="bline"></div>
        ${items.map(renderCardInventaris).join('')}
        <a class="pj-wa" href="https://wa.me/${WA_UTAMA}" target="_blank">💬 Hubungi Pengelola (${pj})</a>
      </div>`;
  }).join('');
}

/**
 * Render versi MINOR Inventaris di Beranda — cuma 2 item teratas
 * (lebih sedikit dari sebelumnya yang 3), sesuai keputusan product
 * roadmap bahwa Inventaris bukan fokus utama, jadi porsinya di
 * Beranda dikecilkan, tapi tetap ada (tidak dihapus total).
 */
function renderInventarisBeranda() {
  const el = document.getElementById('inventaris-beranda-list');
  if (!el) return;

  const JUMLAH_TAMPIL = 2;
  const list = INVENTARIS.slice(0, JUMLAH_TAMPIL);
  el.innerHTML = list.map(renderCardInventaris).join('');
}

const INVENTARIS_SEARCH = INVENTARIS.map(function(item) {
  return { title: item.nama, meta: item.jumlah + ' · Pengelola: ' + item.pj };
});

/** Map tag agenda → kelas badge warna (lihat .tg/.tb di style.css) */
function tagClass(tag) {
  const hijau = ['Festival', 'HUT Dusun', 'Kirab'];
  return hijau.indexOf(tag) !== -1 ? 'tg' : 'tb';
}

/** Nama bulan Indonesia, dipakai generate label otomatis */
const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const NAMA_BULAN_SINGKAT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

/**
 * Ambil daftar agenda yang BELUM lewat, terurut dari yang terdekat.
 * "Belum lewat" dihitung per-hari (bukan jam), jadi acara HARI INI
 * masih tampil sampai besok paginya.
 */
function getAgendaMendatang() {
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  return AGENDA
    .filter(function(a) {
      const tgl = new Date(a.date + 'T00:00:00');
      return tgl >= hariIni;
    })
    .sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
}

/** Render 1 card agenda (dipakai Beranda & halaman Agenda) */
function renderCardAgenda(a) {
  const tgl = new Date(a.date + 'T00:00:00');
  const hari = String(tgl.getDate()).padStart(2, '0');
  const bulan = NAMA_BULAN_SINGKAT[tgl.getMonth()];
  return `
    <div class="ag">
      <div class="ag-dt"><div class="ag-d">${hari}</div><div class="ag-m">${bulan}</div></div>
      <div class="ag-info">
        <div class="ag-ttl">${a.title}</div>
        <div class="ag-meta">📍 ${a.lokasi} · ⏰ ${a.time}</div>
      </div>
      <span class="ag-tag ${tagClass(a.tag)}">${a.tag}</span>
    </div>`;
}

/** Render 3 agenda terdekat di Beranda */
function renderAgendaBeranda() {
  const el = document.getElementById('agenda-beranda-list');
  if (!el) return;

  const mendatang = getAgendaMendatang().slice(0, 3);

  if (!mendatang.length) {
    el.innerHTML = `<div style="text-align:center; padding:20px 0; font-size:12px; color:var(--tx3)">Belum ada agenda terjadwal.</div>`;
    return;
  }
  el.innerHTML = mendatang.map(renderCardAgenda).join('');
}

/**
 * Render teks ticker pengumuman di Hero Beranda, diambil dari array
 * AGENDA yang sama (bukan ditulis manual lagi) — supaya kalau Zen
 * update agenda, ticker otomatis ikut berubah, tidak perlu sentuh
 * index.html sama sekali.
 */
function renderTicker() {
  const el = document.getElementById('ticker-text');
  if (!el) return;

  const mendatang = getAgendaMendatang();

  if (!mendatang.length) {
    el.textContent = 'Belum ada agenda mendatang.';
    return;
  }

  el.innerHTML = mendatang.map(function(a) {
    const tgl = new Date(a.date + 'T00:00:00');
    const hari = String(tgl.getDate()).padStart(2, '0');
    const bulan = NAMA_BULAN_SINGKAT[tgl.getMonth()];
    return `${a.title} &middot; ${hari} ${bulan} ${a.time}`;
  }).join(' &nbsp;&middot;&nbsp; ');
}

/**
 * Render daftar agenda lengkap di halaman Agenda, dikelompokkan
 * per bulan dengan label otomatis ("Juni 2026", dst). Acara yang
 * sudah lewat TIDAK ditampilkan di sini (sesuai keputusan auto-hide).
 */
function renderAgendaPage() {
  const el = document.getElementById('agenda-page-list');
  if (!el) return;

  const mendatang = getAgendaMendatang();

  if (!mendatang.length) {
    el.innerHTML = `
      <div style="text-align:center; padding:40px 16px; color:var(--tx3)">
        <div style="font-size:32px; margin-bottom:8px">📅</div>
        <div style="font-size:13px; font-weight:600; color:var(--tx)">Belum ada agenda mendatang</div>
        <div style="font-size:11px; margin-top:4px">Cek lagi nanti, atau tambahkan agenda baru di data.</div>
      </div>`;
    return;
  }

  /* Kelompokkan per bulan (key: "2026-06") supaya label bulan
     cuma muncul sekali per kelompok, bukan per-card */
  let html = '';
  let bulanTerakhir = null;

  mendatang.forEach(function(a) {
    const tgl = new Date(a.date + 'T00:00:00');
    const keyBulan = tgl.getFullYear() + '-' + tgl.getMonth();

    if (keyBulan !== bulanTerakhir) {
      if (bulanTerakhir !== null) html += '</div>'; /* tutup wrapper bulan sebelumnya */
      html += `<div class="ag-month-lbl">${NAMA_BULAN[tgl.getMonth()]} ${tgl.getFullYear()}</div>`;
      html += `<div style="padding:0 16px">`;
      bulanTerakhir = keyBulan;
    }
    html += renderCardAgenda(a);
  });
  html += '</div>'; /* tutup wrapper bulan terakhir */

  el.innerHTML = html;
}


/* ================================================
   8C. FOOTER — Sumber Tunggal
   ------------------------------------------------
   Dulu footer ditulis 2x manual di index.html (Beranda
   & Tentang) dengan isi PERSIS SAMA — risiko gampang
   gak sinkron kalau salah satu lupa diupdate (mis. ganti
   nomor WA, alamat, atau link sosmed, harus diingat edit
   di 2 tempat).

   SEKARANG: index.html cuma punya placeholder kosong
   <div id="footer-beranda"></div> dan <div id="footer-tentang"></div>.
   Keduanya diisi oleh renderFooter() di bawah ini — 1
   sumber HTML, ditempel ke semua placeholder yang ada.

   CATATAN WA: dulu footer pakai placeholder teks "{{WA}}"
   yang di-replace oleh script kecil di akhir index.html.
   Sekarang gak perlu itu lagi khusus untuk footer — nomor
   WA langsung diambil dari WA_UTAMA (sudah didefinisikan
   di atas) saat HTML footer di-generate, jadi selalu benar
   dari awal tanpa perlu langkah replace tambahan.

   CARA TAMBAH placeholder footer baru (kalau nanti ada
   halaman baru yang butuh footer juga): cukup tambah
   <div class="footer-slot" id="footer-NAMA-BARU"></div>
   di index.html, lalu daftarkan id-nya di array FOOTER_SLOTS
   di bawah — tidak perlu copy-paste HTML footer lagi.
   ================================================ */
const FOOTER_SLOTS = ['footer-beranda', 'footer-tentang'];

function templateFooter() {
  return `
    <div class="footer">
      <div class="ft-grid">

        <div class="ft-col">
          <div class="ft-brand">
            <img class="ft-logo" src="img/branding/logo.png" alt="Logo" width="38" height="38">
            <div>
              <div class="ft-name">SIMBAH Ngemplak</div>
              <div class="ft-sub">Sistem Informasi Masyarakat Bale Harian</div>
            </div>
          </div>
          <div class="ft-desc">
            Balai dusun digital untuk warga Ngemplak — informasi, layanan, dan direktori komunitas dalam satu tempat.
          </div>
          <div class="ft-tagline">"Tumbuh Bersama, Maju Berkelanjutan."</div>
          <div class="ft-socials">
            <a class="ft-soc" href="https://www.facebook.com/ktoppen.lestari.9" target="_blank" title="Facebook Karang Taruna Oppen Lestari">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8.5h-1.5c-.55 0-1 .45-1 1V11h2.4l-.3 2.2h-2.1V19h-2.3v-5.8H9.2V11h1.9V9.2c0-1.9 1.2-3.2 3.1-3.2H16v2.5z" fill="#fff"/></svg>
            </a>
            <a class="ft-soc" href="https://www.instagram.com/ktoppenlestari/" target="_blank" title="Instagram Karang Taruna">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="14" height="14" rx="4" stroke="#fff" stroke-width="1.4" fill="none"/><circle cx="12" cy="12" r="3.4" stroke="#fff" stroke-width="1.4" fill="none"/><circle cx="16.3" cy="7.7" r="0.9" fill="#fff"/></svg>
            </a>
            <a class="ft-soc" href="https://www.instagram.com/lensangemplak/" target="_blank" title="Instagram Dusun Ngemplak">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="14" height="14" rx="4" stroke="#fff" stroke-width="1.4" fill="none"/><circle cx="12" cy="12" r="3.4" stroke="#fff" stroke-width="1.4" fill="none"/><circle cx="16.3" cy="7.7" r="0.9" fill="#fff"/></svg>
            </a>
            <a class="ft-soc" href="https://wa.me/${WA_UTAMA}" target="_blank" title="WhatsApp">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 4c-4.42 0-8 3.58-8 8 0 1.42.37 2.75 1.02 3.9L4 20l4.24-1.02A7.96 7.96 0 0 0 12.04 20c4.42 0 8-3.58 8-8s-3.58-8-8-8zm4.34 11.06c-.18.5-1.05.96-1.45 1-.4.04-.78.18-2.6-.62-2.18-.96-3.58-3.18-3.69-3.32-.11-.14-.87-1.16-.87-2.2 0-1.05.55-1.56.75-1.77.2-.22.43-.27.58-.27h.42c.13 0 .31-.02.48.39.18.43.6 1.46.66 1.57.06.11.1.24.02.38-.08.14-.13.22-.25.34l-.36.4c-.12.13-.24.27-.1.52.13.25.6 1 1.3 1.62.9.78 1.65 1.03 1.92 1.15.27.12.43.1.59-.06.16-.16.7-.78.88-1.05.18-.27.36-.22.6-.13.24.09 1.55.7 1.82.83.27.13.45.2.51.31.06.12.06.65-.12 1.15z" fill="#fff"/></svg>
            </a>
          </div>
        </div>

        <div class="ft-col">
          <div class="ft-addr">
            Dusun Ngemplak, Desa Samping,<br>
            Kec. Kemiri, Kab. Purworejo,<br>
            Jawa Tengah 55751.
          </div>
          <div class="ft-contact">
            <a class="ft-citem" href="https://wa.me/${WA_UTAMA}" target="_blank">
              <div class="ft-cico"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21l1.65-4.95a8.5 8.5 0 1 1 3.4 3.4L3 21z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
              <span class="ft-cval">0822-4143-9784</span>
            </a>
            <a class="ft-citem" href="mailto:samxngemplak@gmail.com">
              <div class="ft-cico"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></div>
              <span class="ft-cval">samxngemplak@gmail.com</span>
            </a>
          </div>
        </div>

      </div>
      <div class="ft-copy">© 2026 Dusun Ngemplak · SIMBAH v1.0</div>
    </div>`;
}

/** Render footer ke semua placeholder yang terdaftar di FOOTER_SLOTS */
function renderFooter() {
  const html = templateFooter();
  FOOTER_SLOTS.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) { el.outerHTML = html; }
    /* pakai outerHTML (bukan innerHTML) supaya wrapper <div class="footer-slot">
       digantikan total oleh <div class="footer">, tidak nested 2 div */
  });
}


/* ================================================
   9. SEARCH GLOBAL
   Kotak pencarian di header, muncul saat ikon kaca
   pembesar diklik. Mencari di UMKM + Agenda +
   Inventaris sekaligus.
   ================================================ */

/* ================================================
   9. SEARCH — Pill Morph Pattern
   ------------------------------------------------
   Satu elemen (.search-pill) yang melebar ke kiri
   jadi input saat diklik. Tidak ada overlay, tidak
   ada box baru — button-nya sendiri yang morph.
   Menutup dengan klik × atau klik di luar header.
   ================================================ */
var _searchOpen = false;

function openSearch() {
  if (_searchOpen) return;
  _searchOpen = true;
  var pill = document.getElementById('search-pill');
  pill.classList.add('open');
  pill.onclick = null;
  document.getElementById('search-pill-btn').onclick = closeSearch;
  setTimeout(function() { document.getElementById('search-input').focus(); }, 200);
}

function closeSearch() {
  if (!_searchOpen) return;
  _searchOpen = false;
  var pill = document.getElementById('search-pill');
  pill.classList.remove('open');
  pill.onclick = openSearch;
  document.getElementById('search-pill-btn').onclick = null;
  document.getElementById('search-input').value = '';
  var dd = document.getElementById('search-results');
  dd.classList.remove('show');
  dd.innerHTML = '';
}

/* Klik di luar header → tutup search */
document.addEventListener('click', function(e) {
  var hdr = document.querySelector('.hdr');
  if (hdr && !hdr.contains(e.target) && _searchOpen) closeSearch();
});

/**
 * Jalankan pencarian setiap kali user mengetik
 * Mencari di 3 sumber: UMKM, Agenda, Inventaris
 */
function runSearch(query) {
  var resultsEl = document.getElementById('search-results');
  var q = query.trim().toLowerCase();

  if (!q) {
    resultsEl.classList.remove('show');
    resultsEl.innerHTML = '';
    return;
  }

  var html = '';

  /* --- Cari di UMKM --- */
  var umkmHasil = UMKM.filter(function(u) {
    return u.name.toLowerCase().includes(q) ||
           (u.cat && u.cat.toLowerCase().includes(q)) ||
           (u.desc && u.desc.toLowerCase().includes(q));
  });
  umkmHasil.forEach(function(u) {
    html += `<button class="src-item" onclick="goToUMKM(${u.id})"><span class="src-ico">${escapeHtml(u.emoji || '🏪')}</span><span class="src-body"><span class="src-ttl">${escapeHtml(u.name)}</span><span class="src-meta">UMKM · ${escapeHtml(u.cat || '')}</span></span></button>`;
  });

  /* --- Cari di Agenda (hanya yang belum lewat) --- */
  var agendaHasil = getAgendaMendatang().filter(function(a) {
    return a.title.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q);
  });
  agendaHasil.forEach(function(a) {
    var tgl = new Date(a.date + 'T00:00:00');
    var metaTgl = String(tgl.getDate()).padStart(2, '0') + ' ' + NAMA_BULAN_SINGKAT[tgl.getMonth()] + ' · ' + a.lokasi;
    html += `<button class="src-item" onclick="nav('agenda')"><span class="src-ico">📅</span><span class="src-body"><span class="src-ttl">${escapeHtml(a.title)}</span><span class="src-meta">Agenda · ${escapeHtml(metaTgl)}</span></span></button>`;
  });

  /* --- Cari di Inventaris --- */
  var invHasil = INVENTARIS_SEARCH.filter(function(i) {
    return i.title.toLowerCase().includes(q);
  });
  invHasil.forEach(function(i) {
    html += `<button class="src-item" onclick="nav('inventaris')"><span class="src-ico">📦</span><span class="src-body"><span class="src-ttl">${escapeHtml(i.title)}</span><span class="src-meta">Inventaris · ${escapeHtml(i.meta)}</span></span></button>`;
  });

  /* --- Tidak ada hasil --- */
  if (!html) {
    html = `<div class="src-empty">Tidak ditemukan hasil untuk "${escapeHtml(query)}"</div>`;
  }

  resultsEl.innerHTML = html;
  resultsEl.classList.add('show');
}

/**
 * Pindah ke halaman UMKM lalu buka detail UMKM tertentu
 * Dipakai saat item hasil search UMKM diklik
 */
function goToUMKM(id) {
  closeSearch();
  nav('umkm');
  showUMKM(id); // data sudah di memory, tidak perlu setTimeout
}


/* ================================================
   9B. SUB-TAB HALAMAN TENTANG
   ------------------------------------------------
   4 tombol (Profil, Visi & Misi, Sejarah, Pengurus).
   Klik 1 tombol -> tampilkan panel itu, sembunyikan
   3 panel lain TOTAL (display:none, bukan animasi
   collapse) — supaya sederhana dan minim risiko gagal
   render di browser apapun.
   ================================================ */
const TENTANG_TABS = ['profil', 'visimisi', 'sejarah', 'pengurus'];

function tentangTab(key) {
  TENTANG_TABS.forEach(function(k) {
    const panel = document.getElementById('tpanel-' + k);
    const btn = document.getElementById('ttab-' + k);
    if (panel) { panel.style.display = (k === key) ? '' : 'none'; }
    if (btn) { btn.classList.toggle('active', k === key); }
  });

  /* Scroll konten halaman Tentang ke atas setiap ganti tab,
     supaya orang tidak bingung kalau sebelumnya sudah scroll
     jauh ke bawah di tab lain. */
  const scrollArea = document.querySelector('#p-tentang > div');
  if (scrollArea) { scrollArea.scrollTop = 0; }
}


/* ================================================
   10. INISIALISASI
   Kode yang dijalankan saat halaman pertama dimuat
   ================================================ */

/* Mulai ambil data UMKM dari data/umkm.json.
   renderGrid() akan dipanggil otomatis di dalam
   fungsi ini setelah data selesai dimuat. */
muatDataUMKM();

/* Inject data kas ke semua elemen yang menampilkan saldo & tanggal update.
   Cukup ubah KAS_UPDATE dan KAS_TOTAL di atas (konstanta) — semua bagian
   (beranda ringkasan + halaman kas penuh) otomatis ikut benar. */
(function injectKas() {
  /* Saldo — beranda & halaman kas */
  document.querySelectorAll('.kas-sal, .kastot-val').forEach(function(el) {
    el.textContent = KAS_TOTAL;
  });
  /* Keterangan update — beranda ringkasan */
  document.querySelectorAll('.kas-upd').forEach(function(el) {
    el.textContent = 'Diperbarui: ' + KAS_UPDATE;
  });
  /* Sub-header halaman kas penuh (psub) */
  var psub = document.querySelector('#p-kas .psub');
  if (psub) psub.textContent = 'Keuangan Dusun Ngemplak · Diperbarui ' + KAS_UPDATE;
  /* Keterangan gabungan di kastot */
  document.querySelectorAll('.kastot-sub').forEach(function(el) {
    el.textContent = 'Gabungan 4 kas komunitas · Diperbarui ' + KAS_UPDATE;
  });
})();

/* Render Agenda Terdekat di Beranda saat halaman pertama dimuat.
   (Halaman Agenda penuh di-render saat nav('agenda') dipanggil,
   tidak perlu di-render di sini karena belum aktif/terlihat.) */
renderAgendaBeranda();
renderTicker();
renderInventarisBeranda();

/* Render footer ke semua placeholder (Beranda & Tentang) — 1 sumber
   template (lihat templateFooter() di atas), tidak perlu hardcode lagi. */
renderFooter();

/* Pasang link WA pendaftaran UMKM dengan pesan template pre-filled */
(function() {
  var el = document.getElementById('umkm-daftar-wa');
  if (!el) return;
  var pesan = [
    'Halo Pengelola SIMBAH 👋',
    'Saya warga Ngemplak dan ingin mendaftarkan usaha saya ke katalog SIMBAH.',
    '',
    '📋 *Data Usaha:*',
    '• Nama usaha:',
    '• Jenis usaha/produk:',
    '• Alamat:',
    '• No. HP/WA pemilik:',
    '• Link Google Maps (kalau ada):',
    '• Instagram/medsos (kalau ada):',
    '',
    'Mohon bantuannya, terima kasih! 🙏'
  ].join('\n');
  el.href = 'https://wa.me/' + WA_UTAMA + '?text=' + encodeURIComponent(pesan);
})();

/* Pasang event listener ke input pencarian */
document.getElementById('search-input')?.addEventListener('input', function(e) {
  runSearch(e.target.value);
});

/* ESC menutup search pill */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && _searchOpen) closeSearch();
});
/* Filter chip di-generate dan di-attach event listener oleh renderFilterChips()
   yang dipanggil setelah data UMKM selesai di-fetch. */

/**
 * Tangani tombol Back/Forward BROWSER (bukan tombol "← Kembali" kita
 * sendiri — itu sudah ditangani goBack()). Tanpa ini, kalau orang
 * tekan back di browser setelah buka link share UMKM, URL berubah
 * tapi tampilan halaman tidak ikut berubah (jadi tidak sinkron).
 *
 * Strategi paling aman & simpel: kalau event ini terpicu, baca ulang
 * URL saat ini. Kalau ada ?umkm=slug yang valid, tampilkan detail-nya.
 * Kalau tidak ada, pulangkan ke Beranda. Ini cukup untuk kasus paling
 * umum (orang share link UMKM, ada yang buka, lalu back).
 */
window.addEventListener('popstate', function(event) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('umkm');

  /* Kasus 1: URL punya ?umkm=slug — tampilkan detail UMKM */
  if (slug) {
    const cocok = UMKM.find(function(item) { return slugify(item.name) === slug; });
    if (cocok) {
      showUMKM(cocok.id, false);
      return;
    }
  }

  /* Kasus 2: state menyimpan halaman sebelumnya (diisi oleh nav() & goBack()) */
  if (event.state && event.state.page && pageMap[event.state.page]) {
    const targetPage = event.state.page;
    document.getElementById(pageMap[currentPage])?.classList.remove('active');
    semuaIdNav.forEach(function(id) { document.getElementById(id)?.classList.remove('active'); });
    currentPage = targetPage;
    document.getElementById(pageMap[currentPage])?.classList.add('active');
    (navMap[currentPage] || []).forEach(function(id) { document.getElementById(id)?.classList.add('active'); });
    if (currentPage === 'umkm') renderGrid('');
    if (currentPage === 'agenda') renderAgendaPage();
    if (currentPage === 'inventaris') renderInventarisPage();
    resetMetaDefault();
    return;
  }

  /* Kasus 3: tidak ada info apapun — fallback ke Beranda */
  document.getElementById(pageMap[currentPage])?.classList.remove('active');
  semuaIdNav.forEach(function(id) { document.getElementById(id)?.classList.remove('active'); });
  currentPage = 'beranda';
  navHistory = [];
  document.getElementById(pageMap['beranda'])?.classList.add('active');
  (navMap['beranda'] || []).forEach(function(id) { document.getElementById(id)?.classList.add('active'); });
  resetMetaDefault();
});

/* ================================================
   TOMBOL KEMBALI KE ATAS
   Muncul setelah scroll melewati 1 tinggi viewport,
   supaya tidak langsung muncul pas baru buka halaman
   pendek (Nyuwun Tulung, dst). Pakai window scroll
   karena .page tidak punya scroll container sendiri
   (lihat css/style.css — .page { overflow-y: visible }).
   ================================================ */
(function () {
  var btt = document.getElementById('btt');
  if (!btt) return;

  function toggleBtt() {
    if (window.scrollY > window.innerHeight * 0.6) {
      btt.classList.add('show');
    } else {
      btt.classList.remove('show');
    }
  }

  window.addEventListener('scroll', toggleBtt, { passive: true });
  toggleBtt(); /* cek posisi awal saat load (misal buka via link share + anchor) */
})();

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
