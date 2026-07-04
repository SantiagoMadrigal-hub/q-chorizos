// js/navbar.js
(function() {
  'use strict';

  var navbar = document.querySelector('.js-navbar');
  var toggle = document.querySelector('.js-navbar-toggle');
  var nav = document.querySelector('.js-navbar-nav');

  /* ── Scroll-aware: transparent at top ── */
  function updateNavbarState() {
    if (!navbar) return;
    if (window.scrollY < 40) {
      navbar.classList.add('navbar--top');
    } else {
      navbar.classList.remove('navbar--top');
    }
  }
  updateNavbarState();
  window.addEventListener('scroll', updateNavbarState, { passive: true });

  /* ── Mobile menu toggle ── */
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open');
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    /* Close menu on link click */
    nav.querySelectorAll('.navbar__link').forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }
})();
