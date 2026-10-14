/* ==========================================================================
   ООО «Коннект» — интерактив и анимации
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Год в подвале ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Шапка: состояние при скролле + прогресс ---------- */
  var header = document.getElementById('siteHeader');
  var progress = document.querySelector('.scroll-progress');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 12);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(y / h, 1) : 0;
      progress.style.transform = 'scaleX(' + p + ')';
    }
    var top = document.querySelector('.to-top');
    if (top) top.classList.toggle('is-visible', y > 520);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  var overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    overlay.classList.remove('is-open');
    if (toggle) { toggle.classList.remove('is-active'); toggle.setAttribute('aria-expanded', 'false'); }
    document.body.classList.remove('nav-open');
  }
  function openNav() {
    if (!nav) return;
    nav.classList.add('is-open');
    overlay.classList.add('is-open');
    if (toggle) { toggle.classList.add('is-active'); toggle.setAttribute('aria-expanded', 'true'); }
    document.body.classList.add('nav-open');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) closeNav(); else openNav();
    });
  }
  overlay.addEventListener('click', closeNav);
  if (nav) {
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---------- Появление элементов при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Анимированные счётчики ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = (el.getAttribute('data-decimals') | 0) || 0;
    var duration = 1500;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals).replace('.', ',');
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals).replace('.', ',');
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) {
      var d = (c.getAttribute('data-decimals') | 0) || 0;
      c.textContent = parseFloat(c.getAttribute('data-count')).toFixed(d).replace('.', ',');
    });
  }

  /* ---------- Модальное окно сотрудников ---------- */
  var modal = document.getElementById('personModal');
  if (modal) {
    var mPhoto = modal.querySelector('[data-modal-photo]');
    var mName = modal.querySelector('[data-modal-name]');
    var mRole = modal.querySelector('[data-modal-role]');
    var mAbout = modal.querySelector('[data-modal-about]');
    var mAboutWrap = modal.querySelector('[data-modal-about-wrap]');
    var mProj = modal.querySelector('[data-modal-projects]');
    var mProjWrap = modal.querySelector('[data-modal-projects-wrap]');
    var lastFocus = null;

    function openModal(card) {
      var d = card.dataset;
      if (mPhoto) { mPhoto.src = d.photo || ''; mPhoto.alt = d.name || ''; }
      if (mName) mName.textContent = d.name || '';
      if (mRole) mRole.textContent = d.role || '';
      if (mAbout) mAbout.textContent = d.about || '';
      if (mAboutWrap) mAboutWrap.style.display = d.about ? '' : 'none';
      if (mProj) mProj.textContent = d.projects || '';
      if (mProjWrap) mProjWrap.style.display = d.projects ? '' : 'none';
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      document.body.classList.add('nav-open');
      var closeBtn = modal.querySelector('.modal__close');
      if (closeBtn) closeBtn.focus();
    }
    function closeModal() {
      modal.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('[data-person]').forEach(function (card) {
      card.addEventListener('click', function () { openModal(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
      });
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    });
    modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  /* ---------- Форма обратной связи ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var name = form.querySelector('[name="name"]');
      var contact = form.querySelector('[name="contact"]');
      var consent = form.querySelector('[name="consent"]');
      var ok = true;

      [name, contact].forEach(function (f) {
        if (f && !f.value.trim()) { f.style.borderColor = 'var(--accent-500)'; ok = false; }
        else if (f) { f.style.borderColor = ''; }
      });
      if (consent && !consent.checked) ok = false;

      if (!ok) {
        if (status) { status.textContent = 'Пожалуйста, заполните обязательные поля и подтвердите согласие.'; status.className = 'form-status is-err'; }
        return;
      }
      if (status) { status.textContent = 'Спасибо! Ваше сообщение отправлено — мы свяжемся с вами в рабочее время.'; status.className = 'form-status is-ok'; }
      form.reset();
    });
  }

  /* ---------- Кнопка «наверх» ---------- */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Плавная прокрутка по якорям ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------- Лёгкий параллакс в hero ---------- */
  var heroBg = document.querySelector('[data-parallax]');
  if (heroBg && !reduceMotion) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) heroBg.style.transform = 'translate3d(0,' + (y * 0.14) + 'px,0)';
    }, { passive: true });
  }
})();
