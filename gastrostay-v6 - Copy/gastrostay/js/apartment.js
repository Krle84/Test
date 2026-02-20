/* ============================================================
   GASTRO & STAY — apartment.js
   ============================================================ */

(function () {
  'use strict';

  const gradients = [
    'apt-placeholder-1','apt-placeholder-2','apt-placeholder-3',
    'apt-placeholder-4','apt-placeholder-5'
  ];

  // ── Parse query param ──────────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10) || 1;

  // ── Lightbox ───────────────────────────────────────────────
  let lbImages = [];
  let lbIndex = 0;

  function openLightbox(idx) {
    lbIndex = idx;
    renderLb();
    const lb = document.getElementById('lightbox');
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lightbox-close').focus();
  }
  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }
  function renderLb() {
    const wrap = document.getElementById('lb-img-wrap');
    const counter = document.getElementById('lb-counter');
    if (!wrap) return;
    const g = gradients[(lbIndex) % gradients.length];
    wrap.innerHTML = `<div class="${g} apt-img-placeholder" role="img" aria-label="Apartment image ${lbIndex + 1}"></div>`;
    if (counter) counter.textContent = `${lbIndex + 1} / ${lbImages.length}`;
  }

  document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('lightbox')) closeLightbox();
  });
  document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lb-prev')?.addEventListener('click', () => {
    lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
    renderLb();
  });
  document.getElementById('lb-next')?.addEventListener('click', () => {
    lbIndex = (lbIndex + 1) % lbImages.length;
    renderLb();
  });
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; renderLb(); }
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; renderLb(); }
  });

  // ── Load apartment data ────────────────────────────────────
  fetch('data/apartments.json')
    .then(r => r.json())
    .then(apts => {
      const apt = apts.find(a => a.id === id) || apts[0];

      // Update document title
      document.title = `${apt.name} — Gastro & Stay Belgrade`;

      // Breadcrumb
      const bc = document.getElementById('apt-breadcrumb-name');
      if (bc) bc.textContent = apt.name;

      // Hero
      const nameEl = document.getElementById('apt-name');
      if (nameEl) nameEl.textContent = apt.name;

      const priceEl = document.getElementById('apt-price');
      if (priceEl) priceEl.innerHTML = `<em>from</em> €${apt.pricePerNight} <span>/ night</span>`;

      // Chips in hero
      const heroChips = document.getElementById('apt-hero-chips');
      if (heroChips) {
        heroChips.innerHTML = `
          <span class="apt-chip">${apt.guests} guests</span>
          <span class="apt-chip">${apt.beds} bed${apt.beds > 1 ? 's' : ''}</span>
          <span class="apt-chip">${apt.size}m²</span>
          <span class="apt-chip">${apt.locationNote}</span>
        `;
      }

      // ── Gallery slider ─────────────────────────────────────
      let currentIdx = 0;
      const allImgs = apt.images.length >= 4 ? apt.images.slice(0, 6) : [...apt.images, ...apt.images].slice(0, 4);
      lbImages = allImgs;

      function getGradientClass(idx) {
        return gradients[idx % gradients.length];
      }

      function updateMainImage(idx) {
        currentIdx = idx;
        const mainImg = document.getElementById('gallery-main-img');
        const counter = document.getElementById('gallery-counter');
        if (mainImg) {
          // Remove all gradient classes and set new one
          gradients.forEach(g => mainImg.classList.remove(g));
          mainImg.className = `${getGradientClass(idx)} apt-img-placeholder`;
          mainImg.setAttribute('aria-label', `${apt.name} photo ${idx + 1}`);
        }
        if (counter) counter.textContent = `${idx + 1} / ${allImgs.length}`;

        // Update active thumb
        document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
          t.classList.toggle('active', i === idx);
        });
      }

      // Thumbnails
      const thumbsWrap = document.getElementById('gallery-thumbs');
      if (thumbsWrap) {
        thumbsWrap.innerHTML = allImgs.map((_, i) => `
          <div class="gallery-thumb${i === 0 ? ' active' : ''}" 
               data-index="${i}" 
               role="listitem" 
               tabindex="0"
               aria-label="Photo ${i + 1}">
            <div class="${getGradientClass(i)} apt-img-placeholder"></div>
          </div>
        `).join('');

        thumbsWrap.querySelectorAll('.gallery-thumb').forEach(thumb => {
          thumb.addEventListener('click', () => updateMainImage(parseInt(thumb.dataset.index)));
          thumb.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') updateMainImage(parseInt(thumb.dataset.index));
          });
        });
      }

      // Arrow buttons
      document.getElementById('gallery-prev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        updateMainImage((currentIdx - 1 + allImgs.length) % allImgs.length);
      });
      document.getElementById('gallery-next')?.addEventListener('click', (e) => {
        e.stopPropagation();
        updateMainImage((currentIdx + 1) % allImgs.length);
      });

      // Click main image → open lightbox
      document.getElementById('gallery-main')?.addEventListener('click', () => openLightbox(currentIdx));
      document.getElementById('gallery-main')?.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openLightbox(currentIdx);
      });

      // Description
      const descEl = document.getElementById('apt-description');
      if (descEl) descEl.textContent = apt.description;

      // Amenities
      const amenEl = document.getElementById('apt-amenities');
      if (amenEl) {
        amenEl.innerHTML = apt.amenities.map(a => `<div class="amenity-item">${a}</div>`).join('');
      }

      // Rules
      const rulesEl = document.getElementById('apt-rules');
      if (rulesEl) {
        rulesEl.innerHTML = apt.rules.map(r => `<li>${r}</li>`).join('');
      }

      // Sidebar
      const sbPrice = document.getElementById('sb-price');
      if (sbPrice) sbPrice.innerHTML = `<em>from</em> €${apt.pricePerNight} <span>/ night</span>`;

      const sbInfo = document.getElementById('sb-info');
      if (sbInfo) {
        sbInfo.innerHTML = `
          <div class="row"><span class="label">Guests</span><span class="val">Up to ${apt.guests}</span></div>
          <div class="row"><span class="label">Beds</span><span class="val">${apt.beds}</span></div>
          <div class="row"><span class="label">Size</span><span class="val">${apt.size}m²</span></div>
          <div class="row"><span class="label">Location</span><span class="val">${apt.locationNote}</span></div>
          <div class="row"><span class="label">Check-in</span><span class="val">From 15:00</span></div>
          <div class="row"><span class="label">Check-out</span><span class="val">By 11:00</span></div>
        `;
      }

      // CTA links — update all inquiry buttons on the page
      const inquiryLinks = document.querySelectorAll('.apt-inquiry-cta');
      inquiryLinks.forEach(link => {
        link.href = `index.html#upit?apartment=${apt.id}`;
        link.addEventListener('click', () => {
          localStorage.setItem('gs_selected_apt', String(apt.id));
        });
      });
    })
    .catch(() => {
      const main = document.querySelector('main');
      if (main) main.innerHTML = '<div class="container" style="padding:80px 0;text-align:center;"><p>Apartment not found. <a href="index.html" style="color:var(--primary);">Back to Home</a></p></div>';
    });

})();
