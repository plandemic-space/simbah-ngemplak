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

    /* Render grid (halaman UMKM) + card unggulan (Beranda) setelah data siap */
    renderGrid('');
    renderUMKMBeranda();

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
          <div style="font-size:11px; line-height:1.5">Pastikan website dibuka lewat Laragon<br>(http://localhost/simbah/), bukan klik file langsung.</div>
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
   - history     : tumpukan halaman sebelumnya
                   (untuk tombol kembali)
   - menuOpen    : apakah menu sheet terbuka?
   ================================================ */
let currentPage = 'beranda';
let history     = [];
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

  /* Kalau pindah ke halaman Agenda, render daftar lengkap dulu */
  if (key === 'agenda') {
    renderAgendaPage();
  }

  /* Bersihkan parameter ?umkm=... dari URL kalau pindah ke halaman
     LAIN (bukan detail UMKM) — supaya URL gak nyangkut nunjuk UMKM
     lama padahal sudah pindah halaman lain. */
  if (key !== 'umkm-detail' && window.location.search) {
    window.history.pushState({}, '', window.location.pathname);
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

  /* Kalau kembali ke halaman Agenda, render daftar lengkap lagi */
  if (currentPage === 'agenda') {
    renderAgendaPage();
  }

  /* Bersihkan parameter ?umkm=... dari URL kalau yang dituju
     bukan halaman detail UMKM (sama seperti di nav() di atas) */
  if (currentPage !== 'umkm-detail' && window.location.search) {
    window.history.pushState({}, '', window.location.pathname);
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

  const JUMLAH_TAMPIL = 4; /* berapa card yang muncul di Beranda — ubah di sini kalau mau lebih/kurang */
  const list = UMKM.slice(0, JUMLAH_TAMPIL);

  if (!list.length) {
    el.innerHTML = `<div style="font-size:12px; color:var(--tx3); padding:8px 0">Belum ada UMKM terdaftar.</div>`;
    return;
  }

  el.innerHTML = list.map(function(u) {
    return `
      <div class="ucard" onclick="showUMKM(${u.id})">
        <div class="uimg">${u.emoji}<div class="uwa">💬</div></div>
        <div class="uinfo"><div class="uname">${u.name}</div><div class="ucat">${u.cat}</div></div>
      </div>`;
  }).join('');
}

/**
 * Ubah nama UMKM jadi "slug" URL yang pendek & enak dibaca.
 * Contoh: "Plandemic Space" -> "plandemic-space"
 * Dipakai supaya link share UMKM gak pakai ?umkm=6 (gak jelas),
 * tapi ?umkm=plandemic-space (jelas, enak dibaca).
 * Tidak perlu field manual baru di JSON — slug dihitung otomatis
 * dari field "name" yang sudah ada.
 */
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
    console.warn('⚠️ Link UMKM "' + slug + '" tidak ditemukan — mungkin nama usaha sudah berubah.');
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
    console.warn('⚠️ UMKM dengan id', id, 'tidak ditemukan di data/umkm.json');
    alert('Maaf, data UMKM ini tidak ditemukan. Silakan kembali ke daftar UMKM.');
    return;
  }

  /* Simpan sebagai UMKM aktif — dipakai fungsi shareUMKM() */
  currentUMKM = u;

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
    else { console.warn('⚠️ Elemen #' + elementId + ' tidak ditemukan di HTML'); }
  }
  function isiLink(elementId, nilai) {
    const el = document.getElementById(elementId);
    if (el) { el.href = nilai; }
    else { console.warn('⚠️ Elemen #' + elementId + ' tidak ditemukan di HTML'); }
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
    if (!el) { console.warn('⚠️ Elemen #' + elementId + ' tidak ditemukan di HTML'); return; }

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

  /* ── Link "Lihat Review di Google Maps" — reuse link Maps yang sama.
     CATATAN: ini mengarahkan ke profil Maps usaha (kalau linknya sudah
     diisi link asli oleh Zen), BUKAN review yang ditampilkan langsung
     di website ini. Kita gak fetch data review asli dari Google API
     karena itu butuh API key berbayar + backend — lihat diskusi PR. ── */
  isiLink('ud-review-link', u.maps);

  /* ── Info operasional (alamat, jam, telepon) ── */
  isiTeks('ud-alamat', u.alamat);
  isiTeks('ud-jam', u.jam);
  isiTeks('ud-phone', '+' + u.phone);
  isiLink('ud-maps-link', u.maps);
  isiTeks('ud-maps-addr', u.alamat);

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
  const sosmedSec = document.getElementById('ud-sosmed-sec');
  if (sosmedSec) {
    sosmedSec.style.display = adaYangKeisi ? '' : 'none';
  }

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

  /* ── Render testimoni warga (cek dulu array-nya ada) ──
     Beda dari "Review Google" — ini testimoni manual yang
     dikumpulkan Zen dari pembeli asli, bukan API Google. */
  const testimoniEl = document.getElementById('ud-testimoni');
  if (testimoniEl) {
    const list = u.testimoni || [];
    if (!list.length) {
      testimoniEl.innerHTML = `<div style="font-size:11px; color:var(--tx3); padding:4px 0 8px">Belum ada testimoni warga untuk usaha ini.</div>`;
    } else {
      testimoniEl.innerHTML = list.map(function(t) {
        return `
          <div class="rv">
            <div class="rv-top">
              <span class="rv-name">${t.nama}</span>
              <span class="rv-date">${t.tanggal}</span>
            </div>
            <div class="rv-txt">${t.teks}</div>
          </div>`;
      }).join('');
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

   tag yang dikenali (untuk warna badge):
   'Kerja Bakti', 'Kliwonan', 'Rapat' → badge hijau
   'Posyandu', 'Hajatan'              → badge emas
   (lihat fungsi tagClass() di bawah kalau mau nambah)
   ================================================ */
const AGENDA = [
  { title: 'Kerja Bakti RT 01 & 02', date: '2026-06-08', time: '07.00 WIB', lokasi: 'Pertigaan Utama', tag: 'Kerja Bakti' },
  { title: 'Posyandu Balita',        date: '2026-06-12', time: '08.00 WIB', lokasi: 'Balai Dusun', tag: 'Posyandu' },
  { title: 'Hajatan Anak Pak Sunar', date: '2026-06-15', time: '09.00 WIB', lokasi: 'Rumah Pak Sunar RT 02', tag: 'Hajatan' },
  { title: 'Pengajian Kliwonan',     date: '2026-06-20', time: "Ba'da Isya", lokasi: 'Mushola Al-Ikhlas', tag: 'Kliwonan' },
  { title: 'Musyawarah Dusun',       date: '2026-06-28', time: '19.30 WIB', lokasi: 'Balai Dusun', tag: 'Rapat' },
  { title: 'Posyandu Balita',        date: '2026-07-10', time: '08.00 WIB', lokasi: 'Balai Dusun', tag: 'Posyandu' },
  { title: 'Pengajian Kliwonan',     date: '2026-07-18', time: "Ba'da Isya", lokasi: 'Mushola Al-Ikhlas', tag: 'Kliwonan' },
];

const INVENTARIS_SEARCH = [
  { title: 'Sound System', meta: '2 unit · Pengelola: Pak Suroto' },
  { title: 'Genset 5000W', meta: '1 unit · Pengelola: Pak Suroto' },
  { title: 'Tenda Tarup', meta: '4 unit · Pengelola: Pak Kamijan' },
  { title: 'Kursi Plastik', meta: '100 unit · Pengelola: Pak Kamijan' },
  { title: 'Meja Lipat', meta: '20 unit · Pengelola: Pak Kamijan' },
];

/** Map tag agenda → kelas badge warna (lihat .tg/.tb di style.css) */
function tagClass(tag) {
  const hijau = ['Kerja Bakti', 'Kliwonan', 'Rapat'];
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

  /* --- Cari di Agenda (hanya yang belum lewat) --- */
  const agendaHasil = getAgendaMendatang().filter(function(a) {
    return a.title.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q);
  });
  agendaHasil.forEach(function(a) {
    const tgl = new Date(a.date + 'T00:00:00');
    const metaTgl = String(tgl.getDate()).padStart(2, '0') + ' ' + NAMA_BULAN_SINGKAT[tgl.getMonth()] + ' · ' + a.lokasi;
    html += `
      <button class="src-item" onclick="nav('agenda')">
        <span class="src-ico">📅</span>
        <span class="src-body">
          <span class="src-ttl">${a.title}</span>
          <span class="src-meta">Agenda · ${metaTgl}</span>
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
   9B. TOGGLE SEJARAH DUSUN
   Buka/tutup section Sejarah di halaman Tentang Dusun.
   Default tertutup (lihat CSS .sejarah-content) supaya
   halaman utama tetap ringkas — kontennya tetap LENGKAP,
   cuma disembunyikan sampai tombol ini diklik.
   ================================================ */
function toggleSejarah() {
  const content = document.getElementById('sejarah-content');
  const chevron = document.getElementById('sejarah-chevron');
  const btn = document.getElementById('sejarah-toggle-btn');
  if (!content || !chevron || !btn) return;

  const sedangTerbuka = content.classList.contains('open');
  content.classList.toggle('open');
  chevron.classList.toggle('rotated');
  btn.setAttribute('aria-expanded', String(!sedangTerbuka));
}


/* ================================================
   10. INISIALISASI
   Kode yang dijalankan saat halaman pertama dimuat
   ================================================ */

/* Mulai ambil data UMKM dari data/umkm.json.
   renderGrid() akan dipanggil otomatis di dalam
   fungsi ini setelah data selesai dimuat. */
muatDataUMKM();

/* Render Agenda Terdekat di Beranda saat halaman pertama dimuat.
   (Halaman Agenda penuh di-render saat nav('agenda') dipanggil,
   tidak perlu di-render di sini karena belum aktif/terlihat.) */
renderAgendaBeranda();

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
window.addEventListener('popstate', function() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('umkm');

  if (slug) {
    const cocok = UMKM.find(function(item) { return slugify(item.name) === slug; });
    if (cocok) {
      showUMKM(cocok.id, false);
      return;
    }
  }

  /* Tidak ada parameter umkm yang valid — pulangkan ke Beranda */
  document.getElementById(pageMap[currentPage])?.classList.remove('active');
  semuaIdNav.forEach(function(id) { document.getElementById(id)?.classList.remove('active'); });
  currentPage = 'beranda';
  history = [];
  document.getElementById(pageMap['beranda'])?.classList.add('active');
  (navMap['beranda'] || []).forEach(function(id) { document.getElementById(id)?.classList.add('active'); });
});
