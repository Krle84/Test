/* ============================================================
   GASTRO & STAY — main.js
   ============================================================ */

(function () {
  'use strict';

  // ── Header scroll ─────────────────────────────────────────
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ── Mobile nav ────────────────────────────────────────────
  const burgerBtn = document.querySelector('.burger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.querySelectorAll('span').forEach(s => {
      s.style.transform = ''; s.style.opacity = '';
    });
  }

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded', open);
      burgerBtn.querySelectorAll('span').forEach((s, i) => {
        if (open) {
          if (i === 0) s.style.transform = 'rotate(45deg) translate(5px, 5px)';
          if (i === 1) s.style.opacity = '0';
          if (i === 2) s.style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
          s.style.transform = ''; s.style.opacity = '';
        }
      });
    });

    // Close menu when any link inside it is clicked
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMobileNav());
    });
  }

  // ── Language dropdown ─────────────────────────────────────
  const langDropdown = document.querySelector('.lang-dropdown');
  if (langDropdown) {
    langDropdown.querySelector('.lang-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => langDropdown.classList.remove('open'));
    langDropdown.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', () => {
        langDropdown.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        langDropdown.querySelector('.lang-btn span').textContent = opt.dataset.lang;
        langDropdown.classList.remove('open');
      });
    });
  }

  // ── Toast utility ─────────────────────────────────────────
  function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const iconSuccess = `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    const iconError = `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `${type === 'success' ? iconSuccess : iconError}<span>${msg}</span><button class="toast-close" aria-label="Close">×</button>`;
    document.body.appendChild(toast);

    const close = () => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 400);
    };
    toast.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, 6000);
  }

  // ── Load apartment cards ──────────────────────────────────
  const aptsGrid = document.getElementById('apts-grid');
  if (aptsGrid) {
    fetch('data/apartments.json')
      .then(r => r.json())
      .then(apts => {
        const gradients = ['apt-placeholder-1','apt-placeholder-2','apt-placeholder-3','apt-placeholder-4','apt-placeholder-5'];
        aptsGrid.innerHTML = apts.map((apt, i) => `
          <article class="apt-card" tabindex="0">
            <div class="apt-card-img">
              <div class="${gradients[i % 5]} apt-img-placeholder" role="img" aria-label="${apt.name} placeholder image"></div>
              <div class="apt-price-badge"><em>from</em> <span>€${apt.pricePerNight}</span> / night</div>
            </div>
            <div class="apt-card-body">
              <h3 class="apt-card-name">${apt.name}</h3>
              <p class="apt-card-desc">${apt.description}</p>
              <div class="apt-chips">
                <span class="apt-chip">${apt.guests} guests</span>
                <span class="apt-chip">${apt.beds} bed${apt.beds > 1 ? 's' : ''}</span>
                <span class="apt-chip">${apt.size}m²</span>
              </div>
              <div class="apt-card-footer">
                <span class="apt-avail">Availability: on request</span>
                <a href="apartment.html?id=${apt.id}" class="apt-details-link" aria-label="View details for ${apt.name}">Details →</a>
              </div>
            </div>
          </article>
        `).join('');
      })
      .catch(() => {
        aptsGrid.innerHTML = '<p style="color:var(--text-muted);padding:24px;">Could not load apartments. Please try again.</p>';
      });
  }

  // ── Inquiry form ──────────────────────────────────────────
  const form = document.getElementById('inquiry-form');
  if (form) {
    // Pre-select apartment from query param
    const urlParams = new URLSearchParams(window.location.search);
    const preApt = urlParams.get('apartment') || localStorage.getItem('gs_selected_apt');
    if (preApt) {
      const aptSelect = form.querySelector('[name="apartment"]');
      if (aptSelect) aptSelect.value = preApt;
      localStorage.removeItem('gs_selected_apt');
    }

    const startTime = Date.now();

    function showError(field, msg) {
      field.classList.add('error');
      let err = field.nextElementSibling;
      if (!err || !err.classList.contains('field-error')) {
        err = document.createElement('span');
        err.className = 'field-error';
        err.setAttribute('role', 'alert');
        field.insertAdjacentElement('afterend', err);
      }
      err.textContent = msg;
      field.setAttribute('aria-describedby', err.id || (err.id = 'err-' + Math.random().toString(36).slice(2)));
    }
    function clearError(field) {
      field.classList.remove('error');
      const err = field.nextElementSibling;
      if (err && err.classList.contains('field-error')) err.textContent = '';
    }

    function validateForm() {
      let valid = true;
      const get = n => form.querySelector(`[name="${n}"]`);

      // Honeypot
      if (get('website') && get('website').value) return false;

      // Dates
      const ci = get('checkIn'), co = get('checkOut');
      if (ci && co) {
        const ciVal = ci.value, coVal = co.value;
        if (ciVal && coVal) {
          const ciDate = new Date(ciVal), coDate = new Date(coVal);
          const nights = (coDate - ciDate) / 86400000;
          if (nights < 1) {
            showError(co, 'Check-out must be at least 1 night after check-in.');
            valid = false;
          } else clearError(co);
        }
      }

      // Required fields
      ['firstName','lastName','phone','country','email'].forEach(n => {
        const f = get(n);
        if (!f) return;
        if (!f.value.trim()) {
          showError(f, 'This field is required.');
          valid = false;
        } else if (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())) {
          showError(f, 'Please enter a valid email address.');
          valid = false;
        } else {
          clearError(f);
        }
      });

      return valid;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Anti-spam timing
      if (Date.now() - startTime < 3000) {
        showToast('Please wait a moment before submitting.', 'error');
        return;
      }

      if (!validateForm()) return;

      const data = {};
      new FormData(form).forEach((v, k) => { if (k !== 'website') data[k] = v.toString().trim(); });

      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const res = await fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.ok) {
          form.reset();
          showToast('Your inquiry has been sent! We will contact you shortly.', 'success');
        } else {
          showToast(json.error || 'Something went wrong. Please try again.', 'error');
        }
      } catch {
        showToast('Network error. Please check your connection and try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry';
      }
    });

    // Inline validation on blur
    form.querySelectorAll('input, select, textarea').forEach(f => {
      f.addEventListener('blur', () => {
        if (f.hasAttribute('required') && !f.value.trim()) {
          showError(f, 'This field is required.');
        } else {
          clearError(f);
        }
      });
    });
  }

  // ── Active nav pill follows scroll (smooth sliding) ──────
  const navLinks = document.querySelectorAll('nav .nav-link');
  const navSections = [
    { id: 'hero',       link: document.querySelector('nav .nav-link[href="#"]') },
    { id: 'apartmani',  link: document.querySelector('nav .nav-link[href="#apartmani"]') },
    { id: 'lokacija',   link: document.querySelector('nav .nav-link[href="#lokacija"]') },
    { id: 'upit',       link: document.querySelector('nav .nav-link[href="#upit"]') },
    { id: 'footer',     link: document.querySelector('nav .nav-link[href="#footer"]') },
  ];

  function getActiveSection() {
    const scrollY = window.scrollY + window.innerHeight * 0.35;
    let current = navSections[0];
    navSections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el && el.offsetTop <= scrollY) current = s;
    });
    return current;
  }

  const navEl = document.querySelector('#header nav');
  let pill = null;

  if (navEl && navLinks.length) {
    // Create sliding pill element
    pill = document.createElement('span');
    pill.setAttribute('aria-hidden', 'true');
    pill.style.cssText = `
      position: absolute;
      border-radius: 999px;
      background: var(--ivory);
      transition: left 0.38s cubic-bezier(0.4, 0, 0.2, 1),
                  width 0.38s cubic-bezier(0.4, 0, 0.2, 1),
                  top 0.38s cubic-bezier(0.4, 0, 0.2, 1),
                  height 0.38s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 0.22s ease;
      pointer-events: none;
      z-index: 0;
      opacity: 0;
    `;
    navEl.style.position = 'relative';
    navEl.insertBefore(pill, navEl.firstChild);
    navLinks.forEach(l => { l.style.position = 'relative'; l.style.zIndex = '1'; });

    function movePill(link) {
      if (!link) { pill.style.opacity = '0'; return; }
      const navRect = navEl.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      pill.style.left   = (linkRect.left - navRect.left) + 'px';
      pill.style.top    = (linkRect.top  - navRect.top)  + 'px';
      pill.style.width  = linkRect.width  + 'px';
      pill.style.height = linkRect.height + 'px';
      // Only show pill when header has scrolled (white bg), hide on transparent header
      pill.style.opacity = window.scrollY >= 20 ? '1' : '0';
    }

    function updateActiveNav() {
      const current = getActiveSection();
      navLinks.forEach(l => l.classList.remove('active'));
      if (current && current.link) {
        current.link.classList.add('active');
        movePill(current.link);
      } else {
        pill.style.opacity = '0';
      }
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    // Wait one frame so layout is ready before positioning pill
    requestAnimationFrame(() => updateActiveNav());
  }

  // ── Intersection observer for scroll reveal ───────────────
  if ('IntersectionObserver' in window) {
    const revealEls = document.querySelectorAll('.apt-card, .benefit-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeUp 0.5s ease both';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => observer.observe(el));
  }

})();
