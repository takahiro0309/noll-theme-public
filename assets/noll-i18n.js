(function () {
  'use strict';

  var STORAGE_KEY = 'noll-lang';
  var LABELS = { ja: 'JP', en: 'EN' };

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || 'ja';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function applyLang(lang) {
    var els = document.querySelectorAll('[data-en]');
    els.forEach(function (el) {
      if (!el.dataset.ja) {
        el.dataset.ja = el.innerHTML;
      }
      var en = el.dataset.en;
      if (lang === 'en' && en) {
        el.innerHTML = en;
      } else {
        el.innerHTML = el.dataset.ja;
      }
    });

    var phEls = document.querySelectorAll('[data-en-placeholder]');
    phEls.forEach(function (el) {
      if (!el.dataset.jaPlaceholder) {
        el.dataset.jaPlaceholder = el.getAttribute('placeholder') || '';
      }
      if (lang === 'en') {
        el.setAttribute('placeholder', el.dataset.enPlaceholder || el.dataset.jaPlaceholder);
      } else {
        el.setAttribute('placeholder', el.dataset.jaPlaceholder);
      }
    });

    var altEls = document.querySelectorAll('[data-en-alt]');
    altEls.forEach(function (el) {
      if (!el.dataset.jaAlt) {
        el.dataset.jaAlt = el.getAttribute('alt') || '';
      }
      if (lang === 'en') {
        el.setAttribute('alt', el.dataset.enAlt || el.dataset.jaAlt);
      } else {
        el.setAttribute('alt', el.dataset.jaAlt);
      }
    });

    var ariaEls = document.querySelectorAll('[data-en-aria-label]');
    ariaEls.forEach(function (el) {
      if (!el.dataset.jaAriaLabel) {
        el.dataset.jaAriaLabel = el.getAttribute('aria-label') || '';
      }
      if (lang === 'en') {
        el.setAttribute('aria-label', el.dataset.enAriaLabel || el.dataset.jaAriaLabel);
      } else {
        el.setAttribute('aria-label', el.dataset.jaAriaLabel);
      }
    });

    document.documentElement.lang = lang;

    var legacyToggle = document.getElementById('langToggle');
    if (legacyToggle) {
      legacyToggle.textContent = lang === 'ja' ? 'JP / EN' : 'EN / JP';
    }

    var currentLabel = document.querySelector('.lang-dropdown__current');
    if (currentLabel) {
      currentLabel.textContent = LABELS[lang] || 'JP';
    }

    var options = document.querySelectorAll('.lang-dropdown__option');
    options.forEach(function (opt) {
      if (opt.getAttribute('data-lang') === lang) {
        opt.classList.add('is-active');
        opt.setAttribute('aria-selected', 'true');
      } else {
        opt.classList.remove('is-active');
        opt.setAttribute('aria-selected', 'false');
      }
    });
  }

  function setupDropdown() {
    var trigger = document.getElementById('langTrigger');
    var menu = document.getElementById('langMenu');
    if (!trigger || !menu) return;

    function close() {
      trigger.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }
    function open() {
      trigger.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (isOpen) close(); else open();
    });

    menu.querySelectorAll('.lang-dropdown__option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var lang = opt.getAttribute('data-lang');
        if (!lang) return;
        setLang(lang);
        applyLang(lang);
        close();
      });
    });

    document.addEventListener('click', function (e) {
      if (!trigger.contains(e.target) && !menu.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function setupLegacyToggle() {
    var toggle = document.getElementById('langToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var current = getLang();
      var next = current === 'ja' ? 'en' : 'ja';
      setLang(next);
      applyLang(next);
    });
  }

  function init() {
    setupDropdown();
    setupLegacyToggle();
    var lang = getLang();
    applyLang(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
