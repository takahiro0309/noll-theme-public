/* noll — full motion suite
 * - page loader
 * - scroll reveal (single elements + split-line for hero)
 * - hero parallax
 * - sticky header (hide on scroll down, show on scroll up, shadow on scroll)
 * - custom cursor with image-hover expansion ("VIEW")
 * - product detail: thumb gallery, qty, ATC feedback
 * - page transition overlay on internal-link navigation
 * - prefers-reduced-motion respected
 */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var isCoarse = window.matchMedia && window.matchMedia('(hover: none)').matches;

  /* ---------- Page loader (only on first visit per session) ---------- */
  function mountLoader() {
    if (prefersReduced) return;
    try {
      if (sessionStorage.getItem('noll-loader-seen')) return;
      sessionStorage.setItem('noll-loader-seen', '1');
    } catch (e) { /* sessionStorage unavailable, show once anyway */ }
    var loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<span class="page-loader__logo">noll</span>';
    document.body.appendChild(loader);
    setTimeout(function () {
      loader.classList.add('is-hidden');
      setTimeout(function () { loader.remove(); }, 560);
    }, 700);
  }

  /* ---------- Scroll reveal ---------- */
  function reveal(el) {
    if (el.dataset.revealed === '1') return;
    el.dataset.revealed = '1';
    el.classList.add('is-revealed');
  }
  function setupReveal() {
    var revealEls = document.querySelectorAll('.reveal, .split-line');
    if (!('IntersectionObserver' in window) || prefersReduced) {
      revealEls.forEach(reveal);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    // Safety net: any element near/below viewport but never revealed → reveal it
    setTimeout(function () {
      revealEls.forEach(function (el) {
        if (el.dataset.revealed === '1') return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 400) reveal(el);
      });
    }, 1800);
  }

  /* ---------- Hero parallax ---------- */
  function setupParallax() {
    if (prefersReduced) return;
    var els = document.querySelectorAll('[data-parallax] img, [data-parallax]');
    if (!els.length) return;
    var ticking = false;
    function update() {
      var y = window.scrollY;
      els.forEach(function (el) {
        var img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (!img) return;
        var rect = el.getBoundingClientRect();
        var inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!inView) return;
        var progress = (rect.top + rect.height / 2) / window.innerHeight;
        var translate = (0.5 - progress) * 24;
        img.style.transform = 'translate3d(0,' + translate.toFixed(2) + 'px,0) scale(1.04)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Sticky header (hide on scroll down, show on up, shadow) ---------- */
  function setupHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    var lastY = window.scrollY;
    var threshold = 50;
    function onScroll() {
      var y = window.scrollY;
      if (y > 8) header.classList.add('is-scrolled'); else header.classList.remove('is-scrolled');
      if (y > threshold && y > lastY) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Custom cursor ---------- */
  function setupCursor() {
    if (prefersReduced || isCoarse) return;
    var dot = document.getElementById('customCursor');
    if (!dot) return;
    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var tx = x, ty = y;
    function loop() {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    loop();

    // hover expansion
    var hoverables = document.querySelectorAll('[data-cursor="view"]');
    hoverables.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        dot.classList.add('is-large');
        dot.textContent = 'View';
      });
      el.addEventListener('mouseleave', function () {
        dot.classList.remove('is-large');
        dot.textContent = '';
      });
    });

    // hide cursor when leaving window
    document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = '1'; });
  }

  /* ---------- PDP: thumb gallery ---------- */
  function setupPdpGallery() {
    var thumbs = document.querySelectorAll('.pdp__thumb');
    var main = document.getElementById('pdpMainImage');
    if (!thumbs.length || !main) return;
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.getAttribute('data-img');
        if (!src) return;
        main.style.opacity = '0';
        setTimeout(function () {
          main.src = src;
          main.style.opacity = '1';
        }, 220);
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });
  }

  /* ---------- PDP: size + color toggles ---------- */
  function setupPdpSelectors() {
    var sizes = document.querySelectorAll('.pdp__size');
    sizes.forEach(function (s) {
      if (s.classList.contains('is-out')) return;
      s.addEventListener('click', function () {
        sizes.forEach(function (x) { x.classList.remove('is-active'); });
        s.classList.add('is-active');
      });
    });
    var colors = document.querySelectorAll('.pdp__color');
    colors.forEach(function (c) {
      c.addEventListener('click', function () {
        colors.forEach(function (x) { x.classList.remove('is-active'); });
        c.classList.add('is-active');
      });
    });
  }

  /* ---------- PDP: qty + ATC ---------- */
  function setupPdpQty() {
    var minus = document.getElementById('qtyMinus');
    var plus = document.getElementById('qtyPlus');
    var input = document.getElementById('qtyInput');
    if (!input) return;
    minus && minus.addEventListener('click', function () {
      var n = Math.max(1, parseInt(input.value, 10) - 1);
      input.value = String(n);
    });
    plus && plus.addEventListener('click', function () {
      var n = Math.min(9, parseInt(input.value, 10) + 1);
      input.value = String(n);
    });

    var atc = document.getElementById('atcBtn');
    if (atc) {
      atc.addEventListener('click', function () {
        var orig = atc.textContent;
        atc.textContent = '✓ Added to cart';
        atc.disabled = true;
        // bump cart count
        document.querySelectorAll('.cart-count').forEach(function (cc) {
          var n = parseInt(cc.textContent, 10) || 0;
          cc.textContent = String(n + 1);
        });
        setTimeout(function () {
          atc.textContent = orig;
          atc.disabled = false;
        }, 1800);
      });
    }
  }

  /* ---------- Page transition on internal nav ---------- */
  function setupPageTransitions() {
    if (prefersReduced) return;
    var overlay = document.getElementById('pageTransition');
    if (!overlay) return;
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      var isExternal = a.target === '_blank' || /^https?:/.test(href) && !href.includes(location.host);
      if (isExternal) return;
      // only hijack same-document non-hash nav
      e.preventDefault();
      overlay.classList.add('is-active');
      setTimeout(function () { window.location.href = href; }, 360);
    });
    // restore on bfcache
    window.addEventListener('pageshow', function () { overlay.classList.remove('is-active'); });
  }

  /* ---------- Search bar interactivity (collection page) ---------- */
  function setupSearchBar() {
    var input = document.querySelector('.search-bar__input');
    var clear = document.querySelector('.search-bar__close');
    if (clear && input) {
      clear.addEventListener('click', function () {
        input.value = '';
        input.focus();
      });
    }
  }

  /* ---------- Newsletter wiring (graceful, no-op on success in markup) ---------- */
  function setupNewsletter() { /* handled inline via onsubmit attribute */ }

  /* ---------- Tabs (collection page) ---------- */
  function setupTabs() {
    var tabs = document.querySelectorAll('.collection-tabs__item');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('is-active'); });
        t.classList.add('is-active');
      });
    });
  }

  /* ---------- Boot ---------- */
  function init() {
    mountLoader();
    setupHeader();
    setupReveal();
    setupParallax();
    setupCursor();
    setupPdpGallery();
    setupPdpSelectors();
    setupPdpQty();
    setupSearchBar();
    setupTabs();
    setupNewsletter();
    setupPageTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
