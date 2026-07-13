// js/form-ui.js
document.addEventListener('DOMContentLoaded', function() {
  const PRODUCTS = {
    'Chorizo tradicional': { price: 25000, desc: 'El sabor de siempre que conquista a todos. Elaborado con carne de cerdo seleccionada y especias naturales.', badge: 'M&#225;s vendido' },
    'Chorizo picante':     { price: 23000, desc: 'Para los que se atreven. Intensidad y car&#225;cter en cada mordida con un toque de aj&#237;.', badge: 'Picante' },
    'Chorizo premium':     { price: 30000, desc: 'Experiencia gourmet. Ingredientes selectos para paladares exigentes.', badge: 'Premium' }
  };

  const productParam = new URLSearchParams(window.location.search).get('producto');
  const quantityParam = new URLSearchParams(window.location.search).get('cantidad');
  let pricePerUnit = 12900;

  const sidebarTitle = document.getElementById('sidebar-title');
  const sidebarDesc = document.getElementById('sidebar-desc');
  const priceAmount = document.getElementById('price-amount');
  const productBadge = document.querySelector('.product-badge');
  const productSelect = document.getElementById('producto');
  const qtyInput = document.getElementById('cantidad');
  const qtyMinus = document.querySelector('.qty-minus');
  const qtyPlus = document.querySelector('.qty-plus');
  const summaryQty = document.getElementById('summary-qty');
  const summaryTotal = document.getElementById('summary-total');

  function formatPrice(n) {
    return '$' + n.toLocaleString('es-CO');
  }

  function updateSidebar(productName) {
    const product = PRODUCTS[productName];
    if (!product) {return;}
    pricePerUnit = product.price;
    window._selectedProducto = productName;
    window._selectedPrecio = product.price;

    let shortName = productName.replace('Chorizo ', '');
    shortName = shortName.charAt(0).toUpperCase() + shortName.slice(1);

    if (sidebarTitle) {sidebarTitle.innerHTML = shortName + '<br><em>artesanales</em>';}
    if (sidebarDesc) {sidebarDesc.innerHTML = product.desc;}
    if (productBadge) {productBadge.innerHTML = '<span class="badge-dot" aria-hidden="true"></span> ' + product.badge;}
    if (priceAmount) {priceAmount.textContent = formatPrice(product.price);}
    updateSummary();
  }

  /* Restore saved form state first, then URL params override it */
  restoreFormState();

  if (productParam && PRODUCTS[productParam]) {
    if (productSelect) {productSelect.value = productParam;}
    updateSidebar(productParam);
  } else if (productSelect) {
    productSelect.value = '';
  }

  if (quantityParam) {
    const qty = Math.max(1, Math.min(100, parseInt(quantityParam, 10) || 1));
    if (qtyInput) {qtyInput.value = qty;}
  }

  if (priceAmount && !productParam) {priceAmount.textContent = formatPrice(pricePerUnit);}

  function updateSummary() {
    const qty = Math.max(1, Math.min(100, parseInt(qtyInput.value) || 1));
    qtyInput.value = qty;
    if (summaryQty) {summaryQty.textContent = qty;}
    if (summaryTotal) {summaryTotal.textContent = formatPrice(qty * pricePerUnit);}
  }

  if (productSelect) {
    productSelect.addEventListener('change', function() {
      updateSidebar(this.value);
    });
  }

  if (qtyMinus) {qtyMinus.addEventListener('click', function() {
    qtyInput.value = Math.max(1, (parseInt(qtyInput.value) || 1) - 1);
    updateSummary();
  });}

  if (qtyPlus) {qtyPlus.addEventListener('click', function() {
    qtyInput.value = Math.min(100, (parseInt(qtyInput.value) || 1) + 1);
    updateSummary();
  });}

  let debounceTimer;
  qtyInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateSummary, 80);
  });
  updateSummary();

  /* ── Auto-save form to sessionStorage ── */
  const FORM_KEY = 'qchorizos-form';
  const formFields = document.querySelectorAll('.form-input, #metodo-pago');

  function saveFormState() {
    const data = {};
    formFields.forEach(function(field) {
      data[field.id || field.name] = field.value;
    });
    try { sessionStorage.setItem(FORM_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function restoreFormState() {
    try {
      const raw = sessionStorage.getItem(FORM_KEY);
      if (!raw) {return;}
      const data = JSON.parse(raw);
      formFields.forEach(function(field) {
        const key = field.id || field.name;
        if (data[key] !== undefined) {field.value = data[key];}
      });
      if (data.producto && PRODUCTS[data.producto]) {
        updateSidebar(data.producto);
      }
    } catch (e) { /* ignore */ }
  }

  formFields.forEach(function(field) {
    field.addEventListener('input', saveFormState);
    field.addEventListener('change', saveFormState);
  });

  /* Clear saved state after successful submission */
  const form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function() {
      try { sessionStorage.removeItem(FORM_KEY); } catch (e) { /* ignore */ }
    });
  }

  /* ── Blur validation (visual feedback only, no "Correcto" text) ── */
  document.querySelectorAll('.form-input').forEach(function(input) {
    input.addEventListener('blur', function() {
      const group = this.closest('.form-group');
      const feedback = group ? group.querySelector('.field-feedback') : null;
      if (!feedback) {return;}

      if (this.validity.valueMissing && this.hasAttribute('required')) {
        feedback.textContent = 'Este campo es obligatorio';
        feedback.className = 'field-feedback field-error';
      } else if (this.validity.typeMismatch) {
        feedback.textContent = 'Formato no v&#225;lido';
        feedback.className = 'field-feedback field-error';
      } else if (this.validity.patternMismatch) {
        feedback.textContent = 'Revisa el formato ingresado';
        feedback.className = 'field-feedback field-error';
      } else if (this.value.length > 0) {
        feedback.textContent = '';
        feedback.className = 'field-feedback field-success';
      } else {
        feedback.textContent = '';
        feedback.className = 'field-feedback';
      }
    });
  });

  /* ── Real-time validation: disable submit until all required fields complete ── */
  const submitBtn = document.querySelector('.btn-submit');
  const requiredFields = document.querySelectorAll('#nombre, #telefono, #correo, #direccion, #producto, #cantidad, #metodo-pago');

  function checkFormComplete() {
    let complete = true;
    requiredFields.forEach(function(field) {
      if (!field.value || field.value === '') {
        complete = false;
      }
    });
    if (submitBtn) {
      submitBtn.disabled = !complete;
      submitBtn.classList.toggle('btn-disabled', !complete);
    }
  }

  requiredFields.forEach(function(field) {
    field.addEventListener('input', checkFormComplete);
    field.addEventListener('change', checkFormComplete);
  });

  checkFormComplete();

  /* ── Character counter for instrucciones textarea ── */
  const instrucciones = document.getElementById('instrucciones');
  const charCount = document.getElementById('instrucciones-count');
  if (instrucciones && charCount) {
    const updateCharCount = function() {
      const len = instrucciones.value.length;
      charCount.textContent = len + '/200';
      charCount.classList.toggle('is-near-limit', len > 170);
    };
    instrucciones.addEventListener('input', updateCharCount);
    updateCharCount();
  }

  /* Expose selected product info for form-submission.js */
  window._selectedProducto = productParam || '';
  window._selectedPrecio = pricePerUnit;
});
