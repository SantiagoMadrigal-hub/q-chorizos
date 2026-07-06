(function() {
  'use strict';

  var modal = document.getElementById('modalProducto');
  if (!modal) return;

  var closeBtns = modal.querySelectorAll('[data-modal-close]');
  var backdrop = null;
  var previousFocus = null;
  var focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function trapFocus(e) {
    var focusable = modal.querySelectorAll(focusableSelector);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function open(trigger) {
    previousFocus = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('show');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.addEventListener('click', close);
      document.body.appendChild(backdrop);
      requestAnimationFrame(function() { backdrop.classList.add('show'); });
    }

    document.body.style.overflow = 'hidden';

    var img = document.getElementById('modalImagen');
    var webpSrc = document.getElementById('modalImagenWebp');
    if (img && trigger) {
      img.src = trigger.dataset.imagen || '';
      img.alt = trigger.dataset.producto || '';
      if (webpSrc) {
        webpSrc.srcset = (trigger.dataset.imagen || '').replace(/\.(png|jpg|jpeg)$/i, '.webp');
      }
    }

    var fields = [
      { id: 'modalTitulo', key: 'producto' },
      { id: 'modalPrecio', key: 'precio' },
      { id: 'modalDescripcion', key: 'descripcion' },
      { id: 'modalContexto', key: 'contexto' },
      { id: 'modalPeso', key: 'peso' },
      { id: 'modalCantidad', key: 'cantidad' },
      { id: 'modalCarne', key: 'carne' },
      { id: 'modalPicante', key: 'picante' },
      { id: 'modalConservacion', key: 'conservacion' }
    ];

    fields.forEach(function(f) {
      var el = document.getElementById(f.id);
      if (el) el.textContent = trigger && trigger.dataset[f.key] || '';
    });

    var comprarBtn = document.getElementById('modalComprarBtn');
    if (comprarBtn && trigger) {
      comprarBtn.href = '/html-css/formulario/formulario.html?producto=' + encodeURIComponent(trigger.dataset.producto || '');
    }

    document.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', onEscape);

    requestAnimationFrame(function() {
      var first = modal.querySelector(focusableSelector);
      if (first) first.focus();
    });
  }

  function close() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('show');
    if (backdrop) {
      backdrop.classList.remove('show');
      var b = backdrop;
      setTimeout(function() { if (b.parentNode) b.parentNode.removeChild(b); }, 300);
      backdrop = null;
    }
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapFocus);
    document.removeEventListener('keydown', onEscape);
    if (previousFocus) previousFocus.focus();
  }

  function onEscape(e) {
    if (e.key === 'Escape') close();
  }

  document.querySelectorAll('[data-modal-target="modalProducto"]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      open(btn);
    });
  });

  closeBtns.forEach(function(btn) {
    btn.addEventListener('click', close);
  });

  modal.setAttribute('aria-hidden', 'true');
})();
