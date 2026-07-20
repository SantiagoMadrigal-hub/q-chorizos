// js/form-submission.js
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form');
  const submitBtn = document.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('.btn-text');

  /* ── Mock payment simulation (demo only) ── */
  async function mockPayment(pedido) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      id: 'pay_mock_' + Date.now(),
      status: 'approved',
      metodo: pedido.metodo_pago,
      monto: pedido.precio_unitario * pedido.cantidad,
      reference: 'ORD-' + Date.now().toString(36).toUpperCase()
    };
  }

  function showPaymentToast(payment) {
    let toast = document.getElementById('payment-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'payment-toast';
      toast.className = 'payment-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="payment-toast-inner">
        <span class="payment-toast-icon" aria-hidden="true">✅</span>
        <div class="payment-toast-content">
          <strong>Pago simulado aprobado</strong>
          <small>En producción: ${payment.metodo} → Wompi / MercadoPago</small>
          <small>Ref: ${payment.reference} · $${payment.monto.toLocaleString('es-CO')}</small>
        </div>
      </div>
    `;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 6000);
  }
  const ratingFeedback = document.getElementById('ratingFeedback');
  const ratingComment = document.getElementById('ratingComment');
  const charCount = document.getElementById('charCount');
  const ratingSubmit = document.getElementById('ratingSubmit');
  const ratingSkip = document.getElementById('ratingSkip');
  const ratingSuccess = document.getElementById('ratingSuccess');
  const ratingModal = document.getElementById('ratingModal');
  let previousFocusedElement = null;

  const feedbackLabels = {
    5: { text: '¡Increíble! Nos encanta que hayas disfrutado.', className: 'is-high' },
    4: { text: '¡Muy bueno! Agradecemos tu opinión.', className: 'is-high' },
    3: { text: 'Está bien. Cuéntanos cómo mejorar.', className: 'is-medium' },
    2: { text: 'Podemos hacerlo mejor. ¿Qué pasó?', className: 'is-low' },
    1: { text: 'Lamentamos que no haya sido la mejor experiencia.', className: 'is-low' }
  };

  function setSubmitting(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.textContent = isLoading ? 'Enviando...' : 'Confirmar pedido';
    submitBtn.classList.toggle('btn-loading', isLoading);
  }

  function showFeedback(type, message) {
    let el = document.getElementById('order-feedback');
    if (!el) {
      el = document.createElement('div');
      el.id = 'order-feedback';
      el.className = 'order-feedback';
      form.insertBefore(el, form.querySelector('.form-footer'));
    }
    el.className = 'order-feedback order-feedback-' + type;
    el.textContent = message;
    el.style.display = 'block';
  }

  function hideFeedback() {
    const el = document.getElementById('order-feedback');
    if (el) {el.style.display = 'none';}
  }

  /* ── Open / Close rating modal ── */
  function openRatingModal() {
    previousFocusedElement = document.activeElement;

    ratingModal.setAttribute('aria-hidden', 'false');
    ratingModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    /* Move focus to first focusable element inside modal */
    const firstFocusable = ratingModal.querySelector('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {firstFocusable.focus();}

    /* Reset stars */
    const checked = ratingModal.querySelector('.rating-stars__input:checked');
    if (checked) {checked.checked = false;}
    ratingFeedback.textContent = '';
    ratingFeedback.className = 'rating-stars__feedback';
    ratingComment.value = '';
    charCount.textContent = '0/500';
    ratingSubmit.disabled = false;
    ratingSubmit.textContent = 'Enviar calificación';
    ratingSubmit.className = 'rating-actions__submit';
    ratingSuccess.style.display = '';
    const sentEl = ratingModal.querySelector('.rating-modal__sent');
    if (sentEl) {sentEl.classList.remove('is-visible');}
  }

  function closeRatingModal() {
    ratingModal.setAttribute('aria-hidden', 'true');
    ratingModal.classList.remove('is-open');
    document.body.style.overflow = '';

    /* Restore focus to the element that opened the modal */
    if (previousFocusedElement) {previousFocusedElement.focus();}
    previousFocusedElement = null;
  }

  /* ── Star rating change ── */
  ratingModal.addEventListener('change', function(e) {
    if (e.target.classList.contains('rating-stars__input')) {
      const val = parseInt(e.target.value);
      const label = feedbackLabels[val];
      if (label) {
        ratingFeedback.textContent = label.text;
        ratingFeedback.className = 'rating-stars__feedback ' + label.className;
      }
    }
  });

  /* ── Comment char count ── */
  ratingComment.addEventListener('input', function() {
    const len = this.value.length;
    charCount.textContent = len + '/500';
    charCount.classList.toggle('is-near-limit', len > 450);
    if (len > 500) {this.value = this.value.slice(0, 500);}
  });

  /* ── Submit rating ── */
  ratingSubmit.addEventListener('click', async function() {
    const selected = ratingModal.querySelector('.rating-stars__input:checked');
    if (!selected) {
      ratingFeedback.textContent = 'Selecciona una calificación antes de enviar.';
      ratingFeedback.className = 'rating-stars__feedback is-low';
      return;
    }

    const ratingValue = parseInt(selected.value);
    const comment = ratingComment.value.trim();

    ratingSubmit.disabled = true;
    ratingSubmit.textContent = 'Enviando...';
    ratingSubmit.classList.add('is-loading');

    try {
      if (!window.__supabaseReady || !window.supabaseClient) {
        console.log('Simulando feedback (Supabase no configurado):', { ratingValue, comment });
        await new Promise(function(r) { setTimeout(r, 400); });
        showSentState();
        return;
      }

      const result = await window.supabaseClient.rpc('insertar_feedback', {
        p_calificacion: ratingValue,
        p_comentario: comment || '',
        p_fuente: 'formulario-pedido'
      });

      if (result.error) {throw result.error;}

      showSentState();

    } catch (err) {
      ratingSubmit.disabled = false;
      ratingSubmit.textContent = 'Enviar calificación';
      ratingSubmit.classList.remove('is-loading');
      ratingFeedback.textContent = 'Error al enviar. Intenta de nuevo.';
      ratingFeedback.className = 'rating-stars__feedback is-low';
    }
  });

  function showSentState() {
    ratingSuccess.style.display = 'none';

    let sentEl = ratingModal.querySelector('.rating-modal__sent');
    if (!sentEl) {
      sentEl = document.createElement('div');
      sentEl.className = 'rating-modal__sent';
      sentEl.setAttribute('role', 'status');
      sentEl.innerHTML =
        '<div class="rating-modal__sent-icon" aria-hidden="true">&#x2764;</div>' +
        '<p class="rating-modal__sent-text">&#161;Gracias por tu feedback!</p>' +
        '<p class="rating-modal__sent-sub">Tu opini&#243;n nos ayuda a mejorar cada d&#237;a.</p>' +
        '<button class="rating-modal__sent-close" id="ratingSentClose">Cerrar</button>';
      ratingModal.querySelector('.rating-modal__body').appendChild(sentEl);

      document.getElementById('ratingSentClose').addEventListener('click', closeRatingModal);
    }

    sentEl.classList.add('is-visible');

    setTimeout(function() {
      closeRatingModal();
    }, 5000);
  }

  /* ── Skip rating ── */
  ratingSkip.addEventListener('click', closeRatingModal);

  /* ── Close on backdrop click ── */
  ratingModal.addEventListener('click', function(e) {
    if (e.target === ratingModal || e.target.classList.contains('rating-modal__backdrop')) {
      closeRatingModal();
    }
  });

  /* ── Close on Escape + Focus trap on Tab ── */
  document.addEventListener('keydown', function(e) {
    if (!ratingModal.classList.contains('is-open')) {return;}

    if (e.key === 'Escape') {
      e.preventDefault();
      closeRatingModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = ratingModal.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  const confirmation = document.getElementById('orderConfirmation');

  /* ══════════════════════════════════════
     FORM SUBMIT
     ══════════════════════════════════════ */

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    hideFeedback();

    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const instrucciones = document.getElementById('instrucciones').value.trim();
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const metodoPago = document.getElementById('metodo-pago').value;

    const productoForm = document.getElementById('producto');
    const productoVal = productoForm ? productoForm.value : '';

    if (!nombre || !telefono || !correo || !direccion || !productoVal || !cantidad || !metodoPago) {
      showFeedback('error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    setSubmitting(true);

    const pedido = {
      nombre_completo: nombre,
      telefono: telefono,
      email: correo,
      direccion_entrega: direccion,
      instrucciones: instrucciones || '',
      cantidad: cantidad,
      metodo_pago: metodoPago,
      producto: (document.getElementById('producto') && document.getElementById('producto').value) || window._selectedProducto || 'Chorizos artesanales',
      precio_unitario: window._selectedPrecio || 12900
    };

    savedPedido = pedido;

    try {
      if (!window.__supabaseReady || !window.supabaseClient) {
        console.log('Simulando env\u00edo (Supabase no configurado):', pedido);
        await new Promise(function(r) { setTimeout(r, 800); });

        const payment = await mockPayment(pedido);
        showPaymentToast(payment);

        form.style.display = 'none';
        confirmation.classList.add('is-visible');
        setTimeout(function() { openRatingModal(); }, 800);
        return;
      }

      const result = await window.supabaseClient.rpc('insertar_pedido', {
        p_nombre_completo: pedido.nombre_completo,
        p_telefono: pedido.telefono,
        p_email: pedido.email,
        p_direccion_entrega: pedido.direccion_entrega,
        p_instrucciones: pedido.instrucciones || '',
        p_cantidad: pedido.cantidad,
        p_metodo_pago: pedido.metodo_pago,
        p_producto: pedido.producto,
        p_precio_unitario: pedido.precio_unitario
      });

      if (result.error) {throw result.error;}

      /* Simulate payment after order saved */
      const payment = await mockPayment(pedido);
      showPaymentToast(payment);

      /* Hide form, show confirmation */
      form.style.display = 'none';
      confirmation.classList.add('is-visible');

      setTimeout(function() {
        openRatingModal();
      }, 800);

    } catch (err) {
      const errorMsg = err.message || err.error_description || 'Error de conexión. Intenta de nuevo.';
      showFeedback('error', errorMsg);

      /* Add retry button */
      const feedbackEl = document.getElementById('order-feedback');
      let retryBtn = feedbackEl.querySelector('.order-feedback-retry');
      if (!retryBtn) {
        retryBtn = document.createElement('button');
        retryBtn.className = 'order-feedback-retry';
        retryBtn.textContent = 'Reintentar';
        retryBtn.type = 'button';
        retryBtn.addEventListener('click', function() {
          form.dispatchEvent(new Event('submit'));
        });
        feedbackEl.appendChild(retryBtn);
      }
    } finally {
      setSubmitting(false);
    }
  });
});
