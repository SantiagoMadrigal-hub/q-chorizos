// js/form-ui.js
document.addEventListener('DOMContentLoaded', function() {
  const pricePerUnit = 12900;
  const qtyInput = document.getElementById('cantidad');
  const qtyMinus = document.querySelector('.qty-minus');
  const qtyPlus = document.querySelector('.qty-plus');
  const summaryQty = document.getElementById('summary-qty');
  const summaryTotal = document.getElementById('summary-total');

  function formatPrice(n) {
    return '$' + n.toLocaleString('es-CO');
  }

  function updateSummary() {
    const qty = Math.max(1, Math.min(100, parseInt(qtyInput.value) || 1));
    qtyInput.value = qty;
    summaryQty.textContent = qty;
    summaryTotal.textContent = formatPrice(qty * pricePerUnit);
  }

  qtyMinus.addEventListener('click', function() {
    qtyInput.value = Math.max(1, (parseInt(qtyInput.value) || 1) - 1);
    updateSummary();
  });

  qtyPlus.addEventListener('click', function() {
    qtyInput.value = Math.min(100, (parseInt(qtyInput.value) || 1) + 1);
    updateSummary();
  });

  qtyInput.addEventListener('input', updateSummary);
  updateSummary();

  // Validación de campos
  document.querySelectorAll('.form-input').forEach(function(input) {
    input.addEventListener('blur', function() {
      const group = this.closest('.form-group');
      const feedback = group ? group.querySelector('.field-feedback') : null;
      if (!feedback) return;

      if (this.validity.valueMissing && this.hasAttribute('required')) {
        feedback.textContent = 'Este campo es obligatorio';
        feedback.className = 'field-feedback field-error';
      } else if (this.validity.typeMismatch) {
        feedback.textContent = 'Formato no válido';
        feedback.className = 'field-feedback field-error';
      } else if (this.validity.patternMismatch) {
        feedback.textContent = 'Revisa el formato ingresado';
        feedback.className = 'field-feedback field-error';
      } else if (this.value.length > 0) {
        feedback.textContent = 'Correcto';
        feedback.className = 'field-feedback field-success';
      } else {
        feedback.textContent = '';
        feedback.className = 'field-feedback';
      }
    });
  });
});
