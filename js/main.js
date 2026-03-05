/* ================================================
   STORE INVICTUS — main.js v4.0
   NOVIDADES:
   - Carrossel da home com autoplay (pausa no hover/touch)
   - Filtros com feedback visual de empty state
   - FAQ max-height dinâmico
   - Mobile menu com visibility/opacity
   - Counter animation mobile-friendly
   ================================================ */

(function () {
  'use strict';

  /* ────────────────────────────────────────────
     NAVBAR SCROLL
  ──────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ────────────────────────────────────────────
     HAMBURGER / MOBILE MENU
  ──────────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobile);
    });

    document.addEventListener('click', (e) => {
      if (
        mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMobile();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobile();
    });
  }

  function closeMobile() {
    mobileMenu?.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ────────────────────────────────────────────
     ACTIVE NAV LINK
  ──────────────────────────────────────────── */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ────────────────────────────────────────────
     SCROLL REVEAL
  ──────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
      const delay = el.dataset.delay || (i % 4) * 80;
      el.style.animationDelay = delay + 'ms';
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.style.opacity = '1';
    });
  }

  /* ────────────────────────────────────────────
     COUNTER ANIMATION
  ──────────────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      const current  = Math.floor(eased * target);
      el.textContent = current.toLocaleString('pt-BR') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));
  }

  /* ────────────────────────────────────────────
     FAQ ACCORDION
  ──────────────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        const a = i.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        const body = answer.querySelector('.faq-body');
        if (body && answer) {
          answer.style.maxHeight = (body.scrollHeight + 34) + 'px';
        }
      }
    });
  });

  document.querySelectorAll('.faq-answer').forEach(a => {
    a.style.maxHeight = '0';
  });

  /* ────────────────────────────────────────────
     FILTROS — com empty state
  ──────────────────────────────────────────── */
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const btns  = group.querySelectorAll('[data-filter]');
    const gridContainer = document.querySelector('.cursos-grid, .ebooks-grid');
    const emptyState = document.getElementById('filtro-empty');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        btns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        if (gridContainer) {
          const cards = gridContainer.querySelectorAll('[data-categoria]');
          let visible = 0;

          cards.forEach(card => {
            const match = filter === 'todos' || card.dataset.categoria === filter;
            card.style.display = match ? '' : 'none';
            if (match) visible++;
          });

          if (emptyState) {
            emptyState.classList.toggle('visible', visible === 0);
          }
        }
      });
    });
  });

  /* ────────────────────────────────────────────
     CARROSSEL DA HOME — com autoplay
  ──────────────────────────────────────────── */
  const track    = document.getElementById('carr-track');
  const dotsWrap = document.getElementById('carr-dots');
  const btnPrev  = document.getElementById('carr-prev');
  const btnNext  = document.getElementById('carr-next');

  if (track) {
    const cards    = track.querySelectorAll('.c-card');
    const total    = cards.length;
    let current    = 0;
    let autoplayTimer = null;
    let isPaused   = false;

    function getVisible() {
      const w = track.parentElement.offsetWidth;
      if (w < 500) return 1;
      if (w < 780) return 2;
      return 3;
    }

    function maxIndex() { return Math.max(0, total - getVisible()); }

    function buildDots() {
      dotsWrap.innerHTML = '';
      const steps = maxIndex() + 1;
      for (let i = 0; i < steps; i++) {
        const d = document.createElement('button');
        d.className = 'carr-dot' + (i === current ? ' active' : '');
        d.setAttribute('aria-label', 'Ir para slide ' + (i + 1));
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIndex()));
      const cardW = cards[0].offsetWidth + 20;
      track.style.transform = 'translateX(-' + (current * cardW) + 'px)';
      dotsWrap.querySelectorAll('.carr-dot').forEach((d, i) => d.classList.toggle('active', i === current));
      if (btnPrev) btnPrev.style.opacity = current === 0 ? '0.35' : '1';
      if (btnNext) btnNext.style.opacity = current === maxIndex() ? '0.35' : '1';
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        if (!isPaused) {
          goTo(current >= maxIndex() ? 0 : current + 1);
        }
      }, 4000);
    }

    function stopAutoplay() {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }

    if (btnPrev) btnPrev.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    if (btnNext) btnNext.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

    // Pausa no hover
    track.addEventListener('mouseenter', () => { isPaused = true; });
    track.addEventListener('mouseleave', () => { isPaused = false; });

    // Touch drag
    let startX = 0, startTranslate = 0, dragging = false;

    track.addEventListener('mousedown', e => {
      dragging = true;
      startX = e.clientX;
      startTranslate = current * (cards[0].offsetWidth + 20);
      track.style.transition = 'none';
      stopAutoplay();
    });
    track.addEventListener('mousemove', e => {
      if (!dragging) return;
      track.style.transform = 'translateX(-' + (startTranslate - (e.clientX - startX)) + 'px)';
    });
    track.addEventListener('mouseup', e => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      const diff = e.clientX - startX;
      if (diff < -50) goTo(current + 1);
      else if (diff > 50) goTo(current - 1);
      else goTo(current);
      startAutoplay();
    });
    track.addEventListener('mouseleave', () => {
      if (dragging) { dragging = false; track.style.transition = ''; goTo(current); }
    });

    // Touch
    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startTranslate = current * (cards[0].offsetWidth + 20);
      track.style.transition = 'none';
      isPaused = true;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      track.style.transition = '';
      const diff = e.changedTouches[0].clientX - startX;
      if (diff < -50) goTo(current + 1);
      else if (diff > 50) goTo(current - 1);
      else goTo(current);
      isPaused = false;
    });

    buildDots();
    goTo(0);
    startAutoplay();

    window.addEventListener('resize', () => {
      buildDots();
      goTo(Math.min(current, maxIndex()));
    });
  }

  /* ────────────────────────────────────────────
     SCROLL SUAVE PARA ÂNCORAS
  ──────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();

/* ════════════════════════════════════════════════════════════
   ANALYTICS — Google Analytics 4 + Meta Pixel
   Cole os IDs abaixo quando tiver. Os eventos já estão prontos.
   ════════════════════════════════════════════════════════════ */

// ── Google Analytics 4 ──────────────────────────────────────
// PASSO 1: Substitua 'G-XXXXXXXXXX' pelo seu Measurement ID
// PASSO 2: Remova os comentários das linhas abaixo

/*
(function(){
  var GA_ID = 'G-XXXXXXXXXX'; // <-- cole aqui
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', GA_ID);
  window._gtag = gtag;
})();
*/

// ── Meta Pixel (Facebook / Instagram Ads) ───────────────────
// PASSO 1: Substitua '000000000000000' pelo seu Pixel ID
// PASSO 2: Remova os comentários das linhas abaixo

/*
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '000000000000000'); // <-- cole seu Pixel ID aqui
fbq('track', 'PageView');
*/

// ── Rastreamento de cliques em botões de compra ──────────────
// Funciona automaticamente assim que GA4 ou Meta Pixel estiver ativo
(function(){
  document.addEventListener('click', function(e){
    var link = e.target.closest('a[href*="pay.hotmart.com"]');
    if (!link) return;
    var product = link.closest('[class*="card"]');
    var name = product ? (product.querySelector('h2,h3')?.innerText || 'Ebook') : 'Ebook';

    // GA4 — evento de clique em compra
    if (typeof window._gtag === 'function') {
      window._gtag('event', 'begin_checkout', {
        currency: 'BRL',
        value: 15,
        items: [{ item_name: name, price: 15, quantity: 1 }]
      });
    }

    // Meta Pixel — evento de clique em compra
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_name: name,
        value: 15,
        currency: 'BRL'
      });
    }
  });
})();