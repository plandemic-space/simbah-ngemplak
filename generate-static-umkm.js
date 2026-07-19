#!/usr/bin/env node

/**
 * SIMBAH Static UMKM Page Generator
 * ==================================
 * Script ini membaca data/umkm.json dan generate file HTML statis
 * untuk setiap UMKM di folder /umkm/[slug].html.
 * 
 * Tujuan: Membantu Google crawler mengindex halaman UMKM tanpa
 * perlu execute JavaScript untuk render konten.
 * 
 * Cara pakai:
 * 1. Pastikan Node.js sudah terinstall
 * 2. Jalankan: node generate-static-umkm.js
 * 3. Upload semua file di folder /umkm/ ke GitHub
 * 4. Sitemap.xml akan otomatis di-update
 */

const fs = require('fs');
const path = require('path');

// ===== KONSTANTA =====
const DOMAIN = 'https://simbahngemplak.vercel.app';
const WA_UTAMA = '6282241439784'; // sama dengan WA_UTAMA di js/script.js
const DATA_PATH = './data/umkm.json';
const OUTPUT_DIR = './umkm';
const SITEMAP_PATH = './sitemap.xml';

// ===== HELPER FUNCTIONS =====

/**
 * Slugify nama UMKM (sama seperti fungsi di script.js)
 */
function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Escape HTML untuk keamanan
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate HTML lengkap untuk 1 UMKM
 */
function generateUMKMHTML(umkm, allUmkm) {
  const slug = slugify(umkm.name);
  const url = `${DOMAIN}/umkm/${slug}.html`;
  
  // SEO title & description
  const title = umkm.seoTitle || `${umkm.name} — ${umkm.cat} di Dusun Ngemplak | SIMBAH`;
  const descRaw = umkm.seoDesc || umkm.desc || `Usaha ${umkm.cat} warga Dusun Ngemplak, Desa Samping, Kemiri, Purworejo.`;
  const description = descRaw.length > 155 ? descRaw.slice(0, 152) + '...' : descRaw;
  
  // Cover image URL
  const coverImage = umkm.cover 
    ? `${DOMAIN}/${umkm.cover}` 
    : `${DOMAIN}/img/branding/og-image.webp`;

  // Schema.org LocalBusiness
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: umkm.name,
    description: descRaw,
    url: url,
    image: umkm.cover ? `${DOMAIN}/${umkm.cover}` : `${DOMAIN}/img/branding/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: umkm.alamat || 'Dusun Ngemplak, Desa Samping',
      addressLocality: 'Kecamatan Kemiri',
      addressRegion: 'Purworejo, Jawa Tengah',
      addressCountry: 'ID'
    },
    areaServed: umkm.area || 'Desa Samping, Kemiri, Purworejo'
  };
  
  if (umkm.phone) {
    schemaData.telephone = `+${umkm.phone}`;
  }
  
  if (umkm.maps && umkm.maps !== '#' && umkm.maps.trim()) {
    schemaData.hasMap = umkm.maps;
  }
  
  if (umkm.rating && umkm.ulasan) {
    schemaData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: umkm.rating,
      reviewCount: umkm.ulasan
    };
  }

  // Schema.org FAQPage (jika ada FAQ)
  let faqSchema = '';
  if (umkm.faq && umkm.faq.length > 0) {
    const faqData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: umkm.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a
        }
      }))
    };
    faqSchema = `
  <script type="application/ld+json">
  ${JSON.stringify(faqData, null, 2)}
  </script>`;
  }

  // Render sections...
  const galeriHTML = umkm.galeri && umkm.galeri.length > 0
    ? umkm.galeri.map(img => `<div class="gfoto"><img src="/${escapeHtml(img)}" alt="${escapeHtml(umkm.name)} - foto" width="100%" height="100%" loading="lazy"></div>`).join('\n          ')
    : '';

  const productsHTML = umkm.products && umkm.products.length > 0
    ? umkm.products.map(p => `
          <div class="pcard">
            <div class="pimg">${escapeHtml(p.e)}</div>
            <div class="pinfo">
              <div class="pname">${escapeHtml(p.n)}</div>
              ${p.k ? `<div class="pketerangan">${escapeHtml(p.k)}</div>` : ''}
            </div>
          </div>`).join('')
    : '';

  const faqHTML = umkm.faq && umkm.faq.length > 0
    ? umkm.faq.map(f => `
        <details class="faq-item">
          <summary class="faq-q">${escapeHtml(f.q)}</summary>
          <div class="faq-a">${escapeHtml(f.a)}</div>
        </details>`).join('')
    : '';

  let terkaitHTML = '';
  if (umkm.terkait && umkm.terkait.length > 0) {
    const terkaitList = umkm.terkait.map(id => allUmkm.find(u => u.id === id)).filter(Boolean);
    if (terkaitList.length > 0) {
      terkaitHTML = '<div class="terkait-list">' + terkaitList.map(u => {
        const uSlug = slugify(u.name);
        return `<a href="/umkm/${uSlug}.html" class="terkait-item" style="text-decoration:none">
            <span class="terkait-ico">${escapeHtml(u.emoji)}</span>
            <div class="terkait-info">
              <div class="terkait-name">${escapeHtml(u.name)}</div>
              <div class="terkait-cat">${escapeHtml(u.cat)}</div>
            </div>
            <span class="terkait-arr">›</span>
          </a>`;
      }).join('') + '</div>';
    }
  }

  // Tombol sosmed
  const sosmedButtons = [];
  const sosmedMap = [
    { key: 'ig', label: 'Instagram', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>' },
    { key: 'fb', label: 'Facebook', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8.5h-1.5c-.55 0-1 .45-1 1V11h2.4l-.3 2.2h-2.1V20h-2.3v-6.8H9.2V11h1.9V9.2c0-1.9 1.2-3.5 3.1-3.5H16v2.8z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>' },
    { key: 'tt', label: 'TikTok', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4v9.5a3.3 3.3 0 1 1-2.3-3.14M14 4c.4 2.1 2 3.6 4 3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    { key: 'yt', label: 'YouTube', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="6" width="19" height="12" rx="3.5" stroke="currentColor" stroke-width="1.7"/><path d="M10.5 9.5l4.5 2.5-4.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>' },
    { key: 'sp', label: 'Shopee', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h14l-1 11.5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5L5 9z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.5 9V7a3.5 3.5 0 1 1 7 0v2" stroke="currentColor" stroke-width="1.6"/></svg>' },
    { key: 'tp', label: 'Tokopedia', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 9h16l-1.2 10.2a1.6 1.6 0 0 1-1.6 1.4H6.8a1.6 1.6 0 0 1-1.6-1.4L4 9z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 9V7.5a3 3 0 0 1 6 0V9" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="13.2" r="1.6" fill="currentColor"/></svg>' }
  ];

  sosmedMap.forEach(({ key, label, svg }) => {
    const link = umkm[key];
    if (link && link !== '#' && link.trim()) {
      sosmedButtons.push(`
            <a class="sb-btn" href="${escapeHtml(link)}" target="_blank" rel="noopener">
              <div class="sb-ico">${svg}</div>
              <div class="sb-lbl">${label}</div>
            </a>`);
    }
  });

  const sosmedHTML = sosmedButtons.length > 0 ? `
        <div class="ud-sec">
          <div class="ud-sec-ttl">Media Sosial & Marketplace</div>
          <div class="sosmed-g">
${sosmedButtons.join('')}
          </div>
        </div>` : '';

  const coverHTML = umkm.cover 
    ? `<img src="/${escapeHtml(umkm.cover)}" alt="${escapeHtml(umkm.name)}" width="100%" height="100%" loading="eager">`
    : `<div class="ud-cover-fallback"><span class="ud-cover-emoji">${escapeHtml(umkm.emoji)}</span><span class="ud-cover-name">${escapeHtml(umkm.name)}</span></div>`;

  const waBtn = umkm.phone 
    ? `<a class="cta-wa" href="https://wa.me/${escapeHtml(umkm.phone)}?text=Halo%20${encodeURIComponent(umkm.name)}%2C%20saya%20ingin%20tanya%20lebih%20lanjut" target="_blank" rel="noopener">💬 Chat WhatsApp</a>`
    : '';
  
  const mapBtn = (umkm.maps && umkm.maps !== '#' && umkm.maps.trim())
    ? `<a class="cta-map" href="${escapeHtml(umkm.maps)}" target="_blank" rel="noopener">📍 Lihat Maps & Ulasan</a>`
    : '';

  const waBtn2 = umkm.phone
    ? `<a class="cta-wa" href="https://wa.me/${escapeHtml(umkm.phone)}" target="_blank" rel="noopener" style="display:flex; margin-top:8px; border-radius:10px; padding:13px">💬 Hubungi via WhatsApp</a>`
    : '';

  const ratingPill = umkm.rating
    ? `<span>⭐</span><span class="rn">${escapeHtml(umkm.rating)}</span>${umkm.ulasan ? `<span class="rn-ulasan">(${escapeHtml(String(umkm.ulasan))})</span>` : ''}`
    : `<span class="rn-new">Baru</span>`;

  const ratingRowHTML = umkm.rating ? `
            <div class="irow">
              <div class="irico">⭐</div>
              <div><div class="irlbl">Rating Google</div><div class="irval">${escapeHtml(umkm.rating)} ${umkm.ulasan ? `dari ${escapeHtml(String(umkm.ulasan))} ulasan` : 'bintang'}</div></div>
            </div>` : '';

  const areaRowHTML = umkm.area ? `
            <div class="irow">
              <div class="irico">🗺️</div>
              <div><div class="irlbl">Area Layanan</div><div class="irval">${escapeHtml(umkm.area)}</div></div>
            </div>` : '';

  const faqSectionHTML = faqHTML ? `
        <div class="ud-sec">
          <div class="ud-sec-ttl">Pertanyaan Umum (FAQ)</div>
${faqHTML}
        </div>` : '';

  const terkaitSectionHTML = terkaitHTML ? `
        <div class="ud-sec">
          <div class="ud-sec-ttl">Usaha Terkait</div>
          ${terkaitHTML}
        </div>` : '';

  // Revisi Data — low-key, link ke WA_UTAMA (pengelola), bukan umkm.phone
  const pesanRevisi = encodeURIComponent(`Halo, saya pemilik usaha ${umkm.name} mau update informasi di SIMBAH`);
  const revisiSectionHTML = `
        <div class="ud-revisi">
          <div class="ud-revisi-ttl">Ini usahamu?</div>
          <div class="ud-revisi-desc">Kalau ada data yang salah atau mau diupdate, kabari pengelola — gratis, kapan aja.</div>
          <a class="ud-revisi-link" href="https://wa.me/${WA_UTAMA}?text=${pesanRevisi}" target="_blank" rel="noopener">Hubungi Pengelola &rarr;</a>
        </div>`;

  const taglineHTML = umkm.tagline 
    ? `<div class="ud-tagline">${escapeHtml(umkm.tagline)}</div>`
    : '';

  // Generate complete HTML
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Critical CSS first to prevent FOUC -->
  <link rel="stylesheet" href="/css/style.css">
  
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(umkm.keywords || '')}">
  <meta name="author" content="SIMBAH Ngemplak">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">
  
  <meta property="og:type" content="business.business">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${coverImage}">
  <meta property="og:site_name" content="SIMBAH Ngemplak">
  <meta property="og:locale" content="id_ID">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${coverImage}">
  
  <script type="application/ld+json">
  ${JSON.stringify(schemaData, null, 2)}
  </script>${faqSchema}
  
  <link rel="icon" href="/img/branding/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/img/branding/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/img/branding/apple-touch-icon.png">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Lora:wght@700&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Lora:wght@700&display=swap"></noscript>
  
  <meta name="theme-color" content="#2D5A3D">
</head>
<body>

<div class="phone">
  
  <div class="hdr">
    <a href="/" class="hlogo" style="text-decoration:none">
      <img src="/img/branding/logo.png" alt="Logo Ngemplak" width="34" height="34" loading="eager">
      <div>
        <div class="hbrand">SIMBAH</div>
        <div class="hsub">Dusun Ngemplak</div>
      </div>
    </a>

    <nav class="dnav">
      <a href="/?page=beranda" class="dn-item" style="text-decoration:none">Beranda</a>
      <a href="/?page=umkm" class="dn-item" style="text-decoration:none">UMKM</a>
      <a href="/?page=agenda" class="dn-item" style="text-decoration:none">Agenda</a>
      <a href="/?page=nyuwun" class="dn-item" style="text-decoration:none">Nyuwun Tulung</a>
      <a href="/?page=tentang" class="dn-item" style="text-decoration:none">Tentang</a>
      <div class="dn-dropdown-wrap">
        <button class="dn-item dn-dropdown-btn" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
          Lainnya
          <svg class="dn-chevron" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="dn-dropdown-menu" style="display:none">
          <a href="/?page=kas" class="dn-dropdown-item">💰 Transparansi Kas</a>
          <a href="/?page=inventaris" class="dn-dropdown-item">📦 Inventaris Dusun</a>
        </div>
      </div>
    </nav>
  </div>

  <div class="page active" style="display:block">
    
    <div class="ud-cover" style="position:relative; width:100%; height:280px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #1a3d2b 0%, #2d6a4f 60%, #52b788 100%)">
      ${coverHTML}
      <a href="/umkm/" class="ud-back" style="position:absolute; top:16px; left:16px; width:40px; height:40px; background:rgba(26,46,35,0.7); backdrop-filter:blur(8px); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; text-decoration:none">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </a>
      <button class="ud-share" onclick="if(navigator.share){navigator.share({title:'${escapeHtml(umkm.name)}',text:'${escapeHtml(description)}',url:window.location.href})}else{alert('Salin link: '+window.location.href)}" style="position:absolute; top:16px; right:16px; width:40px; height:40px; background:rgba(26,46,35,0.7); backdrop-filter:blur(8px); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; border:none; cursor:pointer">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
      </button>
    </div>

    <div class="ud-logo-strip">
      <div class="ud-logo-box">${escapeHtml(umkm.emoji)}</div>
      <div class="ud-name-group">
        <div class="ud-bname">${escapeHtml(umkm.name)}</div>
        <div class="ud-bcat">${escapeHtml(umkm.cat)}</div>
        ${taglineHTML}
      </div>
      <div class="rating-pill">${ratingPill}</div>
    </div>

    <div style="flex:1; overflow-y:auto">
      <div class="ud-body">
        
        <div class="ud-desc">${escapeHtml(umkm.desc)}</div>

        ${waBtn || mapBtn ? `<div class="cta-grp">
          ${waBtn}
          ${mapBtn}
        </div>` : ''}

        ${galeriHTML ? `<div class="ud-sec">
          <div class="ud-sec-ttl">Galeri Foto</div>
          <div class="galeri">
          ${galeriHTML}
          </div>
        </div>` : ''}

        ${productsHTML ? `<div class="ud-sec">
          <div class="ud-sec-ttl">Produk & Jasa</div>
          <div class="prow">
${productsHTML}
          </div>
        </div>` : ''}

        <div class="ud-sec">
          <div class="ud-sec-ttl">Informasi</div>
          <div class="irow">
            <div class="irico">📍</div>
            <div><div class="irlbl">Alamat</div><div class="irval">${escapeHtml(umkm.alamat)}</div></div>
          </div>
          <div class="irow">
            <div class="irico">🕐</div>
            <div><div class="irlbl">Jam Buka</div><div class="irval">${escapeHtml(umkm.jam)}</div></div>
          </div>
          <div class="irow">
            <div class="irico">📞</div>
            <div><div class="irlbl">Telepon</div><div class="irval">${umkm.phone ? '+' + escapeHtml(umkm.phone) : '-'}</div></div>
          </div>
${areaRowHTML}
${ratingRowHTML}
        </div>

${faqSectionHTML}

        ${waBtn2}

${sosmedHTML}

${terkaitSectionHTML}

${revisiSectionHTML}

      </div>
    </div>

  </div>

</div>

</body>
</html>`;
}

/**
 * Update sitemap.xml dengan URL baru
 */
function updateSitemap(umkmList) {
  const now = new Date().toISOString().split('T')[0];
  
  const umkmEntries = umkmList.map(u => {
    const slug = slugify(u.name);
    const imageTag = u.cover ? `
    <image:image>
      <image:loc>${DOMAIN}/${u.cover}</image:loc>
      <image:title>${escapeHtml(u.name)}</image:title>
    </image:image>` : '';
    return `  <url>
    <loc>${DOMAIN}/umkm/${slug}.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Lapak Warga (Daftar UMKM) -->
  <url>
    <loc>${DOMAIN}/umkm/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- UMKM Pages (Static HTML) -->
${umkmEntries}

</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemap, 'utf8');
  console.log(`✅ Sitemap updated: ${SITEMAP_PATH}`);
}

/**
 * Generate umkm/index.html — halaman statis daftar semua UMKM
 * Layout persis mengikuti renderGrid() di script.js
 */
function generateIndex(umkmList) {
  const now = new Date().toISOString().split('T')[0];

  // Collect unique categories for filter chips
  const cats = [...new Set(umkmList.map(u => u.cat))];
  const filterChips = [
    '<button class="fchip active" data-filter="">Semua</button>',
    ...cats.map(c => `<button class="fchip" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`)
  ].join('\n          ');

  // Generate grid cards — struktur persis renderGrid() di script.js
  const gridCards = umkmList.map(u => {
    const thumbHtml = u.cover
      ? `<img src="/${escapeHtml(u.cover)}" alt="${escapeHtml(u.name)}" width="100%" height="100%" loading="lazy">`
      : escapeHtml(u.emoji);
    const phoneLink = u.phone
      ? `<a class="ug-wa" href="https://wa.me/${escapeHtml(u.phone)}" target="_blank" onclick="event.stopPropagation()">💬 Chat WA</a>`
      : `<span class="ug-wa-empty">📍 Lihat Maps</span>`;
    const ratingHtml = u.rating
      ? '⭐ ' + escapeHtml(u.rating)
      : '<span class="ug-new">Baru</span>';

    return `        <div class="ugcard" style="position:relative">
          <a href="/umkm/${slugify(u.name)}.html" aria-label="${escapeHtml(u.name)}" style="position:absolute; inset:0; z-index:1"></a>
          <div class="ug-img">
            ${thumbHtml}
            <div class="ug-badge">${escapeHtml(u.cat)}</div>
          </div>
          <div class="ug-info">
            <div class="ug-name">${escapeHtml(u.name)}</div>
            <div class="ug-cat">${escapeHtml(u.cat)}</div>
            <div class="ug-rating">${ratingHtml}</div>
            ${phoneLink.replace('class="ug-wa"', 'class="ug-wa" style="position:relative; z-index:2"').replace('class="ug-wa-empty"', 'class="ug-wa-empty" style="position:relative; z-index:2"')}
          </div>
        </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lapak Warga — Daftar UMKM Dusun Ngemplak | SIMBAH</title>
  <meta name="description" content="Jelajahi ${umkmList.length} UMKM dan usaha warga Dusun Ngemplak, Desa Samping, Kemiri, Purworejo. Temukan bibit tanaman, peternakan, furniture, dan jasa warga.">
  <meta name="keywords" content="UMKM Ngemplak, usaha warga, bibit tanaman, dusun ngemplak, purworejo">
  <meta name="author" content="SIMBAH Ngemplak">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${DOMAIN}/umkm/">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${DOMAIN}/umkm/">
  <meta property="og:title" content="Lapak Warga — Daftar UMKM Dusun Ngemplak | SIMBAH">
  <meta property="og:description" content="Jelajahi ${umkmList.length} UMKM dan usaha warga Dusun Ngemplak, Desa Samping, Kemiri, Purworejo.">
  <meta property="og:image" content="${DOMAIN}/img/branding/og-image.webp">
  <meta property="og:site_name" content="SIMBAH Ngemplak">
  <meta property="og:locale" content="id_ID">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Lapak Warga — Daftar UMKM Dusun Ngemplak | SIMBAH">
  <meta name="twitter:description" content="Jelajahi ${umkmList.length} UMKM dan usaha warga Dusun Ngemplak.">
  <meta name="twitter:image" content="${DOMAIN}/img/branding/og-image.webp">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Daftar UMKM Dusun Ngemplak",
    "description": "${umkmList.length} UMKM dan usaha warga Dusun Ngemplak.",
    "url": "${DOMAIN}/umkm/",
    "about": {
      "@type": "Thing",
      "name": "UMKM Ngemplak"
    }
  }
  </script>

  <link rel="icon" href="/img/branding/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/img/branding/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/img/branding/apple-touch-icon.png">

  <link rel="stylesheet" href="/css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Lora:wght@700&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Lora:wght@700&display=swap"></noscript>

  <meta name="theme-color" content="#2D5A3D">
</head>
<body>
<div class="phone">

  <div class="hdr">
    <a href="/" class="hlogo" style="text-decoration:none">
      <img src="/img/branding/logo.png" alt="Logo Ngemplak" width="34" height="34" loading="eager">
      <div>
        <div class="hbrand">SIMBAH</div>
        <div class="hsub">Dusun Ngemplak</div>
      </div>
    </a>
    <nav class="dnav">
      <a href="/?page=beranda" class="dn-item" style="text-decoration:none">Beranda</a>
      <a href="/?page=umkm" class="dn-item dn-item-active" style="text-decoration:none">UMKM</a>
      <a href="/?page=agenda" class="dn-item" style="text-decoration:none">Agenda</a>
      <a href="/?page=nyuwun" class="dn-item" style="text-decoration:none">Nyuwun Tulung</a>
      <a href="/?page=tentang" class="dn-item" style="text-decoration:none">Tentang</a>
      <div class="dn-dropdown-wrap">
        <button class="dn-item dn-dropdown-btn" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
          Lainnya
          <svg class="dn-chevron" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="dn-dropdown-menu" style="display:none">
          <a href="/?page=kas" class="dn-dropdown-item">💰 Transparansi Kas</a>
          <a href="/?page=inventaris" class="dn-dropdown-item">📦 Inventaris Dusun</a>
        </div>
      </div>
    </nav>
  </div>

  <div class="page active" style="display:block">

    <div class="phdr">
      <a href="/" class="pback" style="text-decoration:none">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        <span>Kembali</span>
      </a>
      <h1 class="pttl">Lapak Warga</h1>
      <div class="psub">UMKM & usaha warga Dusun Ngemplak</div>
    </div>

    <div class="filter-row" id="filter-row">
          ${filterChips}
    </div>

    <div class="ugrid" id="umkm-grid">
${gridCards}
    </div>

    <div class="umkm-daftar-cta">
      <div class="umkm-daftar-body">
        <div class="umkm-daftar-title">Usahamu belum ada di sini?</div>
        <div class="umkm-daftar-desc">Warga Ngemplak bisa daftar gratis — kirim info lewat WhatsApp, pengelola yang urus sisanya.</div>
      </div>
      <a class="umkm-daftar-btn" id="umkm-daftar-wa" href="#" target="_blank" rel="noopener">Daftar Sekarang →</a>
    </div>

  </div>

</div>
<script>
// Simple filter functionality (no need for full script.js)
document.addEventListener('DOMContentLoaded', function() {
  const filterBtns = document.querySelectorAll('.fchip');
  const cards = document.querySelectorAll('.ugcard');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');
      
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Filter cards
      cards.forEach(card => {
        const cat = card.querySelector('.ug-cat').textContent;
        if (!filter || cat === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
  
  // Daftar WA button handler
  const daftarBtn = document.getElementById('umkm-daftar-wa');
  if (daftarBtn) {
    daftarBtn.href = 'https://wa.me/6285728433754?text=Halo%2C%20saya%20ingin%20mendaftarkan%20usaha%20di%20SIMBAH%20Ngemplak';
  }
});
</script>
</body>
</html>`;

  const filepath = path.join(OUTPUT_DIR, 'index.html');
  fs.writeFileSync(filepath, html, 'utf8');
}

// ===== MAIN EXECUTION =====

console.log('🚀 SIMBAH Static UMKM Generator\n');

// 1. Baca data UMKM
console.log('📖 Reading data/umkm.json...');
const rawData = fs.readFileSync(DATA_PATH, 'utf8');
const data = JSON.parse(rawData);
const umkmList = data.umkm;

console.log(`   Found ${umkmList.length} UMKM\n`);

// 2. Buat folder output jika belum ada
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created directory: ${OUTPUT_DIR}\n`);
}

// 3. Generate HTML untuk setiap UMKM
console.log('🔨 Generating HTML files...\n');
let successCount = 0;

umkmList.forEach((umkm, index) => {
  const slug = slugify(umkm.name);
  const filename = `${slug}.html`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  try {
    const html = generateUMKMHTML(umkm, umkmList);
    fs.writeFileSync(filepath, html, 'utf8');
    console.log(`   [${index + 1}/${umkmList.length}] ✅ ${filename}`);
    successCount++;
  } catch (error) {
    console.error(`   [${index + 1}/${umkmList.length}] ❌ ${filename} - Error: ${error.message}`);
  }
});

// 4. Update sitemap.xml
console.log('\n📄 Updating sitemap.xml...');
try {
  updateSitemap(umkmList);
} catch (error) {
  console.error(`❌ Failed to update sitemap: ${error.message}`);
}

// 4b. Generate index.html daftar semua UMKM
console.log('\n📑 Generating umkm/index.html...');
try {
  generateIndex(umkmList);
  console.log('✅ umkm/index.html created');
} catch (error) {
  console.error(`❌ Failed to generate umkm/index.html: ${error.message}`);
}

// 5. Summary
console.log('\n' + '='.repeat(50));
console.log('✨ Generation Complete!\n');
console.log(`   Total UMKM: ${umkmList.length}`);
console.log(`   Success: ${successCount}`);
console.log(`   Failed: ${umkmList.length - successCount}`);
console.log(`   Output: ${OUTPUT_DIR}/`);
console.log('='.repeat(50));
console.log('\n📤 Next steps:');
console.log('   1. Review generated files in /umkm/');
console.log('   2. Upload /umkm/ folder to GitHub');
console.log('   3. Upload updated sitemap.xml');
console.log('   4. Test: https://simbahngemplak.vercel.app/umkm/[slug].html\n');
