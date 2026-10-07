(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- header state ---------- */
  var header = doc.getElementById('header');

  function syncHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  /* ---------- mobile navigation ---------- */
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Открыть меню');
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  doc.querySelectorAll('[data-magnetic]').forEach(function (el) {
    if (!finePointer || reduceMotion) return;

    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      var mx = Math.max(-16, Math.min(16, x * 0.3));
      var my = Math.max(-11, Math.min(11, y * 0.4));
      el.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) scale(1.045)';
      var arrow = el.querySelector('.btn__arrow');
      if (arrow) arrow.style.transform = 'translateX(4px)';
    });

    el.addEventListener('pointerleave', function () {
      el.style.transform = '';
      var arrow = el.querySelector('.btn__arrow');
      if (arrow) arrow.style.transform = '';
    });
  });

  /* ---------- scroll reveals (disabled below the fold) ---------- */
  var revealables = doc.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealables.forEach(function (el) { observer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- hero entrance ---------- */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { body.classList.add('is-ready'); });
  });

  /* ---------- 3D cup: cursor tracking, CSS-transition smoothed ---------- */
  var stage = doc.querySelector('[data-cup-stage]');
  var scene = doc.querySelector('[data-cup-scene]');

  if (stage && scene) {
    var BASE_RX = 10;
    var BASE_RY = -18;

    function reset() {
      scene.style.setProperty('--rx', BASE_RX + 'deg');
      scene.style.setProperty('--ry', BASE_RY + 'deg');
    }

    if (finePointer && !reduceMotion) {
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        scene.style.setProperty('--ry', (BASE_RY + nx * 36).toFixed(1) + 'deg');
        scene.style.setProperty('--rx', (BASE_RX - ny * 20).toFixed(1) + 'deg');
      });

      stage.addEventListener('pointerleave', reset);
    } else {
      reset();
    }
  }

  /* ---------- footer year ---------- */
  var year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();