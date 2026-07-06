document.addEventListener('DOMContentLoaded', function() {
  var modal = document.getElementById('modalProducto');
  if (!modal) return;

  var qtyInput = document.getElementById('modalQty');
  var qtyMinus = document.getElementById('modalQtyMinus');
  var qtyPlus = document.getElementById('modalQtyPlus');
  var comprarBtn = document.getElementById('modalComprarBtn');
  var currentProducto = '';

  function updateQty(delta) {
    if (!qtyInput) return;
    var val = parseInt(qtyInput.value, 10) || 1;
    val = Math.max(1, Math.min(99, val + delta));
    qtyInput.value = val;
    updateComprarLink();
  }

  function updateComprarLink() {
    if (!comprarBtn) return;
    var qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
    comprarBtn.href = '/html-css/formulario/formulario.html?producto=' + encodeURIComponent(currentProducto) + '&cantidad=' + qty;
  }

  if (qtyMinus) qtyMinus.addEventListener('click', function() { updateQty(-1); });
  if (qtyPlus) qtyPlus.addEventListener('click', function() { updateQty(1); });

  if (qtyInput) qtyInput.addEventListener('input', updateComprarLink);

  modal.addEventListener('show.bs.modal', function(event) {
    var button = event.relatedTarget;
    if (!button) return;

    currentProducto = button.dataset.producto;
    if (qtyInput) qtyInput.value = '1';

    document.getElementById('modalTitulo').textContent = currentProducto;
    document.getElementById('modalPrecio').textContent = button.dataset.precio;

    var img = document.getElementById('modalImagen');
    var webpSrc = document.getElementById('modalImagenWebp');
    var originalSrc = button.dataset.imagen;
    img.src = originalSrc;
    img.alt = currentProducto || '';
    if (webpSrc) {
      webpSrc.srcset = originalSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    }

    document.getElementById('modalDescripcion').textContent = button.dataset.descripcion || 'Producto artesanal listo para disfrutar.';
    document.getElementById('modalContexto').textContent = button.dataset.contexto || '';

    document.getElementById('modalPeso').textContent = button.dataset.peso || '—';
    document.getElementById('modalCantidad').textContent = button.dataset.cantidad || '—';
    document.getElementById('modalCarne').textContent = button.dataset.carne || '—';
    document.getElementById('modalPicante').textContent = button.dataset.picante || '—';
    document.getElementById('modalConservacion').textContent = button.dataset.conservacion || '—';

    updateComprarLink();
  });
});
