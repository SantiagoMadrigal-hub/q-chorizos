document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('modalProducto');
  if (!modal) return;

  modal.addEventListener('show.bs.modal', function(event) {
    const button = event.relatedTarget;
    if (!button) return;

    document.getElementById('modalTitulo').textContent = button.dataset.producto;
    document.getElementById('modalPrecio').textContent = button.dataset.precio;

    const img = document.getElementById('modalImagen');
    img.src = button.dataset.imagen;
    img.alt = button.dataset.producto;

    document.getElementById('modalDescripcion').textContent = button.dataset.descripcion || 'Producto artesanal listo para disfrutar.';
    document.getElementById('modalContexto').textContent = button.dataset.contexto || '';

    document.getElementById('modalPeso').textContent = button.dataset.peso || '—';
    document.getElementById('modalCantidad').textContent = button.dataset.cantidad || '—';
    document.getElementById('modalCarne').textContent = button.dataset.carne || '—';
    document.getElementById('modalPicante').textContent = button.dataset.picante || '—';
    document.getElementById('modalConservacion').textContent = button.dataset.conservacion || '—';

    const comprarBtn = document.getElementById('modalComprarBtn');
    if (comprarBtn) {
      comprarBtn.href = `/html-css/formulario/formulario.html?producto=${encodeURIComponent(button.dataset.producto)}`;
    }
  });
});