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
   fetch() HANYA bisa jalan kalau dibuka lewat server
   (Laragon / localhost). Kalau index.html dibuka
   langsung dengan klik dua kali dari File Explorer,
   fetch() akan GAGAL karena browser memblokirnya demi
   keamanan (CORS policy). Selalu akses lewat:
   http://localhost/simbah/
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
    console.log('✓ Data UMKM berhasil dimuat:', UMKM.length, 'usaha');

    /* Render grid setelah data siap */
    renderGrid('');

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
          <div style="font-size:11px; line-height:1.5">Pastikan website dibuka lewat Laragon<br>(http://localhost/simbah/), bukan klik file langsung.</div>
        </div>`;
    }
  }
}


/* ================================================
   2. STATE — Kondisi Aplikasi
   Variabel yang menyimpan "kondisi saat ini"
   - currentPage : halaman yang sedang aktif
   - history     : tumpukan halaman sebelumnya
                   (untuk tombol kembali)
   - menuOpen    : apakah menu sheet terbuka?
   ================================================ */
let currentPage = 'beranda';
let history     = [];
let menuOpen    = false;

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

  /* Simpan halaman sekarang ke history (untuk tombol kembali) */
  history.push(currentPage);

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

  /* Kalau pindah ke halaman UMKM, render grid dulu */
  if (key === 'umkm') {
    renderGrid('');
  }
}

/**
 * Kembali ke halaman sebelumnya
 * Dipakai oleh tombol "← Kembali" di halaman dalam
 */
function goBack() {
  if (!history.length) return; /* tidak ada history, tidak jadi kembali */

  /* Sembunyikan halaman sekarang */
  document.getElementById(pageMap[currentPage])?.classList.remove('active');

  /* Nonaktifkan SEMUA tombol nav */
  semuaIdNav.forEach(function(id) {
    document.getElementById(id)?.classList.remove('active');
  });

  /* Ambil halaman sebelumnya dari tumpukan history */
  currentPage = history.pop();
  const el = document.getElementById(pageMap[currentPage]);
  if (el) {
    el.classList.add('active');
    el.scrollTop = 0;
  }

  /* Aktifkan SEMUA tombol nav yang sesuai */
  (navMap[currentPage] || []).forEach(function(id) {
    document.getElementById(id)?.classList.add('active');
  });

  /* Kalau kembali ke halaman UMKM, render grid lagi */
  if (currentPage === 'umkm') {
    renderGrid('');
  }
}

/**
 * Langsung kembali ke beranda
 * Dipakai oleh klik logo di header
 */
function goHome() {
  history = []; /* kosongkan history */
  nav('beranda');
}


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

  /* Buat HTML kartu untuk setiap UMKM */
  grid.innerHTML = list.map(function(u) {
    return `
      <div class="ugcard" onclick="showUMKM(${u.id})">
        <div class="ug-img">
          ${u.emoji}
          <div class="ug-badge">${u.cat}</div>
        </div>
        <div class="ug-info">
          <div class="ug-name">${u.name}</div>
          <div class="ug-cat">⭐ ${u.rating}</div>
          <a class="ug-wa"
             href="https://wa.me/${u.phone}"
             target="_blank"
             onclick="event.stopPropagation()">
            💬 Chat WA
          </a>
        </div>
      </div>`;
  }).join('');
}

/**
 * Tampilkan halaman detail UMKM
 * Mengisi semua elemen halaman detail dengan data UMKM
 * @param {number} id - id UMKM (sesuai properti id di data)
 */
function showUMKM(id) {
  /* Cari data UMKM berdasarkan id (pakai .find supaya
     tidak bergantung urutan array — lebih aman dari
     metode UMKM[id] yang dulu bisa salah index) */
  const u = UMKM.find(function(item) { return item.id === id; });

  /* Kalau data tidak ditemukan — kasih tau jelas, jangan diam saja */
  if (!u) {
    console.warn('⚠️ UMKM dengan id', id, 'tidak ditemukan di data/umkm.json');
    alert('Maaf, data UMKM ini tidak ditemukan. Silakan kembali ke daftar UMKM.');
    return;
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
    else { console.warn('⚠️ Elemen #' + elementId + ' tidak ditemukan di HTML'); }
  }
  function isiLink(elementId, nilai) {
    const el = document.getElementById(elementId);
    if (el) { el.href = nilai; }
    else { console.warn('⚠️ Elemen #' + elementId + ' tidak ditemukan di HTML'); }
  }

  /* ── Isi bagian atas (cover & nama) ── */
  const cover = document.getElementById('ud-cover');
  if (cover && cover.childNodes[0]) { cover.childNodes[0].textContent = u.emoji; }
  isiTeks('ud-logo', u.emoji);
  isiTeks('ud-name', u.name);
  isiTeks('ud-cat', u.cat);
  isiTeks('ud-rating', u.rating);

  /* ── Isi deskripsi ── */
  isiTeks('ud-desc', u.desc);

  /* ── Tombol WA (dengan pesan otomatis) ── */
  isiLink('ud-wa-btn', `https://wa.me/${u.phone}?text=Halo%20${encodeURIComponent(u.name)}%2C%20saya%20ingin%20tanya%20lebih%20lanjut`);

  /* ── Tombol Maps ── */
  isiLink('ud-map-btn', u.maps);

  /* ── Info operasional (alamat, jam, telepon) ── */
  isiTeks('ud-alamat', u.alamat);
  isiTeks('ud-jam', u.jam);
  isiTeks('ud-phone', '+' + u.phone);
  isiLink('ud-maps-link', u.maps);
  isiTeks('ud-maps-addr', u.alamat);

  /* ── Link sosmed & marketplace ── */
  isiLink('ud-ig', u.ig);
  isiLink('ud-fb', u.fb);
  isiLink('ud-tt', u.tt);
  isiLink('ud-yt', u.yt);
  isiLink('ud-sp', u.sp);
  isiLink('ud-tp', u.tp);

  /* ── Tombol WA kedua (di bagian bawah) ── */
  isiLink('ud-wa2', `https://wa.me/${u.phone}`);

  /* ── Render galeri foto (cek dulu array-nya ada) ── */
  const galeriEl = document.getElementById('ud-galeri');
  if (galeriEl) {
    galeriEl.innerHTML = (u.galeri || []).map(function(e) {
      return `<div class="gfoto">${e}</div>`;
    }).join('');
  }

  /* ── Render daftar produk/jasa (cek dulu array-nya ada) ── */
  const produkEl = document.getElementById('ud-products');
  if (produkEl) {
    produkEl.innerHTML = (u.products || []).map(function(p) {
      return `
        <div class="pcard">
          <div class="pimg">${p.e}</div>
          <div class="pinfo">
            <div class="pname">${p.n}</div>
            <div class="pprice">${p.p}</div>
          </div>
        </div>`;
    }).join('');
  }

  /* Pindah ke halaman detail */
  nav('umkm-detail');
}


/* ================================================
   6. FILTER UMKM
   Tombol filter kategori di halaman UMKM
   ================================================ */

/**
 * Filter UMKM berdasarkan kategori yang diklik
 * Dipanggil lewat event listener di bawah
 * @param {string} cat - nama kategori ('') = semua
 */
function filterUMKM(cat) {
  renderGrid(cat);
}


/* ================================================
   8. DATA PENCARIAN GLOBAL
   Data Agenda & Inventaris disalin manual di sini
   supaya bisa dicari di kotak Search header.
   (UMKM tidak perlu disalin — sudah ada di array UMKM)

   CATATAN UNTUK MAINTENANCE:
   Kalau menambah/ubah item Agenda atau Inventaris di
   index.html, samakan juga datanya di sini supaya
   search tetap akurat.
   ================================================ */
const AGENDA_SEARCH = [
  { title: 'Kerja Bakti RT 01 & 02', meta: '8 Jun · Pertigaan Utama', tag: 'Kerja Bakti' },
  { title: 'Posyandu Balita', meta: '12 Jun · Balai Dusun', tag: 'Posyandu' },
  { title: 'Hajatan Anak Pak Sunar', meta: '15 Jun · Rumah Pak Sunar RT 02', tag: 'Hajatan' },
  { title: 'Pengajian Kliwonan', meta: '20 Jun · Mushola Al-Ikhlas', tag: 'Kliwonan' },
  { title: 'Musyawarah Dusun', meta: '28 Jun · Balai Dusun', tag: 'Rapat' },
  { title: 'Posyandu Balita', meta: '10 Jul · Balai Dusun', tag: 'Posyandu' },
  { title: 'Pengajian Kliwonan', meta: '18 Jul · Mushola Al-Ikhlas', tag: 'Kliwonan' },
];

const INVENTARIS_SEARCH = [
  { title: 'Sound System', meta: '2 unit · Pengelola: Pak Suroto' },
  { title: 'Genset 5000W', meta: '1 unit · Pengelola: Pak Suroto' },
  { title: 'Tenda Tarup', meta: '4 unit · Pengelola: Pak Kamijan' },
  { title: 'Kursi Plastik', meta: '100 unit · Pengelola: Pak Kamijan' },
  { title: 'Meja Lipat', meta: '20 unit · Pengelola: Pak Kamijan' },
];


/* ================================================
   9. SEARCH GLOBAL
   Kotak pencarian di header, muncul saat ikon kaca
   pembesar diklik. Mencari di UMKM + Agenda +
   Inventaris sekaligus.
   ================================================ */

/**
 * Buka/tutup kotak search di bawah header
 */
function toggleSearch() {
  const box = document.getElementById('search-box');
  const isOpen = box.classList.contains('open');
  if (isOpen) {
    closeSearch();
  } else {
    box.classList.add('open');
    document.getElementById('search-input').focus();
  }
}

function closeSearch() {
  const box = document.getElementById('search-box');
  box.classList.remove('open');
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
}

/**
 * Jalankan pencarian setiap kali user mengetik
 * Mencari di 3 sumber: UMKM, Agenda, Inventaris
 */
function runSearch(query) {
  const resultsEl = document.getElementById('search-results');
  const q = query.trim().toLowerCase();

  if (!q) {
    resultsEl.innerHTML = '';
    return;
  }

  let html = '';

  /* --- Cari di UMKM --- */
  const umkmHasil = UMKM.filter(function(u) {
    return u.name.toLowerCase().includes(q) ||
           (u.cat && u.cat.toLowerCase().includes(q)) ||
           (u.desc && u.desc.toLowerCase().includes(q));
  });
  umkmHasil.forEach(function(u) {
    html += `
      <button class="src-item" onclick="goToUMKM(${u.id})">
        <span class="src-ico">${u.emoji || '🏪'}</span>
        <span class="src-body">
          <span class="src-ttl">${u.name}</span>
          <span class="src-meta">UMKM · ${u.cat || ''}</span>
        </span>
      </button>`;
  });

  /* --- Cari di Agenda --- */
  const agendaHasil = AGENDA_SEARCH.filter(function(a) {
    return a.title.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q);
  });
  agendaHasil.forEach(function(a) {
    html += `
      <button class="src-item" onclick="nav('agenda')">
        <span class="src-ico">📅</span>
        <span class="src-body">
          <span class="src-ttl">${a.title}</span>
          <span class="src-meta">Agenda · ${a.meta}</span>
        </span>
      </button>`;
  });

  /* --- Cari di Inventaris --- */
  const invHasil = INVENTARIS_SEARCH.filter(function(i) {
    return i.title.toLowerCase().includes(q);
  });
  invHasil.forEach(function(i) {
    html += `
      <button class="src-item" onclick="nav('inventaris')">
        <span class="src-ico">📦</span>
        <span class="src-body">
          <span class="src-ttl">${i.title}</span>
          <span class="src-meta">Inventaris · ${i.meta}</span>
        </span>
      </button>`;
  });

  /* --- Tidak ada hasil --- */
  if (!html) {
    html = `<div class="src-empty">Tidak ditemukan hasil untuk "${query}"</div>`;
  }

  resultsEl.innerHTML = html;
}

/**
 * Pindah ke halaman UMKM lalu buka detail UMKM tertentu
 * Dipakai saat item hasil search UMKM diklik
 */
function goToUMKM(id) {
  closeSearch();
  nav('umkm');
  /* beri waktu sedikit supaya halaman UMKM aktif dulu sebelum detail dibuka */
  setTimeout(function() { showUMKM(id); }, 50);
}


/* ================================================
   10. INISIALISASI
   Kode yang dijalankan saat halaman pertama dimuat
   ================================================ */

/* Mulai ambil data UMKM dari data/umkm.json.
   renderGrid() akan dipanggil otomatis di dalam
   fungsi ini setelah data selesai dimuat. */
muatDataUMKM();

/* Pasang event listener ke kotak pencarian */
document.getElementById('search-input')?.addEventListener('input', function(e) {
  runSearch(e.target.value);
});
document.querySelectorAll('.fchip').forEach(function(chip) {
  chip.addEventListener('click', function() {

    /* Nonaktifkan semua chip */
    document.querySelectorAll('.fchip').forEach(function(x) {
      x.classList.remove('active');
    });

    /* Aktifkan chip yang diklik */
    this.classList.add('active');

    /* Filter grid — kalau "Semua" diklik, kosongkan filter */
    const kategori = this.textContent === 'Semua' ? '' : this.textContent;
    filterUMKM(kategori);
  });
});
