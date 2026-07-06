// js/form-ui.js
document.addEventListener('DOMContentLoaded', function() {
  var PRODUCTS = {
    'Chorizo tradicional': { price: 25000, desc: 'El sabor de siempre que conquista a todos. Elaborado con carne de cerdo seleccionada y especias naturales.', badge: 'M&#225;s vendido' },
    'Chorizo picante':     { price: 23000, desc: 'Para los que se atreven. Intensidad y car&#225;cter en cada mordida con un toque de aj&#237;.', badge: 'Picante' },
    'Chorizo premium':     { price: 30000, desc: 'Experiencia gourmet. Ingredientes selectos para paladares exigentes.', badge: 'Premium' }
  };

  var productParam = new URLSearchParams(window.location.search).get('producto');
  var quantityParam = new URLSearchParams(window.location.search).get('cantidad');
  var pricePerUnit = 12900;

  var sidebarTitle = document.getElementById('sidebar-title');
  var sidebarDesc = document.getElementById('sidebar-desc');
  var priceAmount = document.getElementById('price-amount');
  var productBadge = document.querySelector('.product-badge');
  var productSelect = document.getElementById('producto');
  var qtyInput = document.getElementById('cantidad');
  var qtyMinus = document.querySelector('.qty-minus');
  var qtyPlus = document.querySelector('.qty-plus');
  var summaryQty = document.getElementById('summary-qty');
  var summaryTotal = document.getElementById('summary-total');

  function formatPrice(n) {
    return '$' + n.toLocaleString('es-CO');
  }

  function updateSidebar(productName) {
    var product = PRODUCTS[productName];
    if (!product) return;
    pricePerUnit = product.price;
    window._selectedProducto = productName;
    window._selectedPrecio = product.price;

    var shortName = productName.replace('Chorizo ', '');
    shortName = shortName.charAt(0).toUpperCase() + shortName.slice(1);

    if (sidebarTitle) sidebarTitle.innerHTML = shortName + '<br><em>artesanales</em>';
    if (sidebarDesc) sidebarDesc.innerHTML = product.desc;
    if (productBadge) productBadge.innerHTML = '<span class="badge-dot" aria-hidden="true"></span> ' + product.badge;
    if (priceAmount) priceAmount.textContent = formatPrice(product.price);
    updateSummary();
  }

  /* Restore saved form state first, then URL params override it */
  restoreFormState();

  if (productParam && PRODUCTS[productParam]) {
    if (productSelect) productSelect.value = productParam;
    updateSidebar(productParam);
  } else if (productSelect) {
    productSelect.value = '';
  }

  if (quantityParam) {
    var qty = Math.max(1, Math.min(100, parseInt(quantityParam, 10) || 1));
    if (qtyInput) qtyInput.value = qty;
  }

  if (priceAmount && !productParam) priceAmount.textContent = formatPrice(pricePerUnit);

  function updateSummary() {
    var qty = Math.max(1, Math.min(100, parseInt(qtyInput.value) || 1));
    qtyInput.value = qty;
    if (summaryQty) summaryQty.textContent = qty;
    if (summaryTotal) summaryTotal.textContent = formatPrice(qty * pricePerUnit);
  }

  if (productSelect) {
    productSelect.addEventListener('change', function() {
      updateSidebar(this.value);
    });
  }

  if (qtyMinus) qtyMinus.addEventListener('click', function() {
    qtyInput.value = Math.max(1, (parseInt(qtyInput.value) || 1) - 1);
    updateSummary();
  });

  if (qtyPlus) qtyPlus.addEventListener('click', function() {
    qtyInput.value = Math.min(100, (parseInt(qtyInput.value) || 1) + 1);
    updateSummary();
  });

  var debounceTimer;
  qtyInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateSummary, 80);
  });
  updateSummary();

  /* ── Auto-save form to sessionStorage ── */
  var FORM_KEY = 'qchorizos-form';
  var formFields = document.querySelectorAll('.form-input, #metodo-pago');

  function saveFormState() {
    var data = {};
    formFields.forEach(function(field) {
      data[field.id || field.name] = field.value;
    });
    try { sessionStorage.setItem(FORM_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function restoreFormState() {
    try {
      var raw = sessionStorage.getItem(FORM_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      formFields.forEach(function(field) {
        var key = field.id || field.name;
        if (data[key] !== undefined) field.value = data[key];
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
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function() {
      try { sessionStorage.removeItem(FORM_KEY); } catch (e) { /* ignore */ }
    });
  }

  /* ── Blur validation (visual feedback only, no "Correcto" text) ── */
  document.querySelectorAll('.form-input').forEach(function(input) {
    input.addEventListener('blur', function() {
      var group = this.closest('.form-group');
      var feedback = group ? group.querySelector('.field-feedback') : null;
      if (!feedback) return;

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
  var submitBtn = document.querySelector('.btn-submit');
  var requiredFields = document.querySelectorAll('#nombre, #telefono, #correo, #direccion, #producto, #cantidad, #metodo-pago');

  function checkFormComplete() {
    var complete = true;
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
  var instrucciones = document.getElementById('instrucciones');
  var charCount = document.getElementById('instrucciones-count');
  if (instrucciones && charCount) {
    const updateCharCount = function() {
      var len = instrucciones.value.length;
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
