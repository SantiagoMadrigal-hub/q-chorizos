(function() {
  'use strict';

  var carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;

  var items = carousel.querySelectorAll('.carousel-item');
  var indicators = carousel.querySelectorAll('.carousel-indicators [data-bs-slide-to]');
  var prevBtn = carousel.querySelector('.carousel-control-prev');
  var nextBtn = carousel.querySelector('.carousel-control-next');
  if (!items.length) return;

  var current = 0;
  var interval = parseInt(carousel.getAttribute('data-bs-interval'), 10) || 5000;
  var timer = null;
  var isPaused = false;

  function goTo(index) {
    if (index === current) return;
    items[current].classList.remove('active');
    if (indicators[current]) indicators[current].classList.remove('active');
    current = index;
    items[current].classList.add('active');
    if (indicators[current]) indicators[current].classList.add('active');

    var activeImg = items[current].querySelector('img[data-src]');
    var activeSource = items[current].querySelector('source[data-srcset]');
    if (activeImg && activeImg.getAttribute('data-src')) {
      activeImg.src = activeImg.getAttribute('data-src');
      activeImg.removeAttribute('data-src');
    }
    if (activeSource && activeSource.getAttribute('data-srcset')) {
      activeSource.srcset = activeSource.getAttribute('data-srcset');
      activeSource.removeAttribute('data-srcset');
    }

    var next = items[(current + 1) % items.length];
    var nextImg = next.querySelector('img[data-src]');
    var nextSource = next.querySelector('source[data-srcset]');
    if (nextImg && nextImg.getAttribute('data-src')) {
      nextImg.src = nextImg.getAttribute('data-src');
      nextImg.removeAttribute('data-src');
    }
    if (nextSource && nextSource.getAttribute('data-srcset')) {
      nextSource.srcset = nextSource.getAttribute('data-srcset');
      nextSource.removeAttribute('data-srcset');
    }
  }

  function prev() {
    goTo(current === 0 ? items.length - 1 : current - 1);
  }

  function next() {
    goTo((current + 1) % items.length);
  }

  function startAutoplay() {
    stopAutoplay();
    if (!isPaused) {
      timer = setInterval(next, interval);
    }
  }

  function stopAutoplay() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  if (prevBtn) prevBtn.addEventListener('click', function(e) { e.preventDefault(); prev(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function(e) { e.preventDefault(); next(); startAutoplay(); });

  indicators.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(btn.getAttribute('data-bs-slide-to'), 10);
      if (!isNaN(idx)) { goTo(idx); startAutoplay(); }
    });
  });

  carousel.addEventListener('mouseenter', function() { isPaused = true; stopAutoplay(); });
  carousel.addEventListener('mouseleave', function() { isPaused = false; startAutoplay(); });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
    if (e.key === 'ArrowRight') { next(); startAutoplay(); }
  });

  if (carousel.getAttribute('data-bs-ride') === 'carousel') {
    startAutoplay();
  }
})();
