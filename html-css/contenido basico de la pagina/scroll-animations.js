/**
 * Scroll Animations - Q' Chorizos
 * Aparición suave de elementos al hacer scroll
 */
document.addEventListener('DOMContentLoaded', function() {
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Elementos a animar
  const animatables = document.querySelectorAll(
    '.section-heading, .nosotros-header, .nosotros-split, .valor-card, .nosotros-galeria-item, .nosotros-cierre, .card-producto, .card-experiencia, .testimonio-card, .faq-item, .experiencias-cta, .trust-counter, .form-section, .form-footer, .trust-badges'
  );

  animatables.forEach(function(el) {
    el.classList.add('fade-in-up');
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  });

  // Parallax sutil (scroll + mouse) solo en elementos marcados
  if (!prefersReducedMotion) {
    const parallaxImgs = Array.prototype.slice.call(document.querySelectorAll('img[data-parallax="nosotros"]'));
    const parallaxParents = new Set(
      parallaxImgs
        .map(function(img) { return img.closest('.nosotros-split-imagen, .nosotros-galeria-item'); })
        .filter(Boolean)
    );

    let latestScrollY = window.scrollY || 0;
    let rafId = null;

    const clamp = function(v, min, max) {
      return Math.max(min, Math.min(max, v));
    };

    const applyScrollParallax = function() {
      rafId = null;
      const viewportH = window.innerHeight || 800;

      parallaxImgs.forEach(function(img) {
        const strength = parseFloat(img.getAttribute('data-parallax-strength') || '10');
        const rect = img.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const t = (center - viewportH * 0.5) / (viewportH * 0.5);
        const y = clamp(t, -1, 1) * -strength;

        img.style.setProperty('--parallax-y', y.toFixed(2) + 'px');
      });
    };

    const scheduleParallax = function() {
      if (rafId !== null) {return;}
      rafId = window.requestAnimationFrame(applyScrollParallax);
    };

    window.addEventListener('scroll', function() {
      latestScrollY = window.scrollY || 0;
      scheduleParallax();
    }, { passive: true });

    window.addEventListener('resize', scheduleParallax, { passive: true });

    // Parallax por mouse (micro) en el contenedor para sensación editorial
    parallaxParents.forEach(function(parent) {
      let mx = 0, my = 0;
      let mraf = null;

      function applyMouse() {
        mraf = null;
        parent.style.setProperty('--parallax-mx', mx.toFixed(3));
        parent.style.setProperty('--parallax-my', my.toFixed(3));
      }

      function scheduleMouse() {
        if (mraf != null) {return;}
        mraf = window.requestAnimationFrame(applyMouse);
      }

      parent.addEventListener('mousemove', function(e) {
        const rect = parent.getBoundingClientRect();
        const rx = (e.clientX - rect.left) / Math.max(1, rect.width);
        const ry = (e.clientY - rect.top) / Math.max(1, rect.height);

        mx = clamp((rx - 0.5) * 2, -1, 1);
        my = clamp((ry - 0.5) * 2, -1, 1);
        scheduleMouse();
      });

      parent.addEventListener('mouseleave', function() {
        mx = 0; my = 0;
        scheduleMouse();
      });
    });

    // Inicializa al cargar
    scheduleParallax();
  }
});
