(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('.main-nav');
  const toggle = document.querySelector('.menu-toggle');
  const closeMenu = () => { menu?.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); toggle?.setAttribute('aria-label', 'Открыть меню'); document.body.classList.remove('menu-open'); };
  toggle?.addEventListener('click', () => {
    const opened = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(opened));
    toggle.setAttribute('aria-label', opened ? 'Закрыть меню' : 'Открыть меню');
    menu?.classList.toggle('is-open', opened);
    document.body.classList.toggle('menu-open', opened);
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); }, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.06, rootMargin: '0px 0px 35px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));
  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('.project[data-tags]')];
  const counter = document.querySelector('.project-count');
  const plural = n => n % 10 === 1 && n % 100 !== 11 ? 'проект' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'проекта' : 'проектов';
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filters.forEach(b => { const active = b === button; b.classList.toggle('is-active', active); b.setAttribute('aria-pressed', String(active)); });
    let visible = 0;
    projects.forEach(project => { const show = filter === 'all' || project.dataset.tags.split(' ').includes(filter); project.hidden = !show; if (show) { visible++; project.classList.add('is-visible'); } });
    if (counter) counter.textContent = `${visible} ${plural(visible)}`;
    const grid = document.querySelector('.project-grid');
    if (grid) { grid.classList.toggle('is-filtered', filter !== 'all'); grid.dataset.count = String(visible); }
  }));
  const copyButton = document.querySelector('[data-copy]');
  copyButton?.addEventListener('click', async () => {
    const status = document.querySelector('.copy-status');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(copyButton.dataset.copy);
      if (status) status.textContent = 'Почта скопирована';
      copyButton.textContent = 'Скопировано ✓';
      window.setTimeout(() => { copyButton.textContent = 'Скопировать почту'; if (status) status.textContent = ''; }, 3500);
    } catch {
      if (status) status.textContent = 'Выделите и скопируйте адрес почты выше';
    }
  });
  const gallery = [...document.querySelectorAll('[data-gallery]')];
  const lightbox = document.querySelector('.lightbox');
  if (gallery.length && lightbox?.showModal) {
    const image = lightbox.querySelector('figure img');
    const caption = lightbox.querySelector('figcaption');
    const prev = lightbox.querySelector('.lightbox-prev');
    const next = lightbox.querySelector('.lightbox-next');
    let index = 0;
    const display = i => {
      index = (i + gallery.length) % gallery.length;
      const source = gallery[index];
      image.src = source.href;
      image.alt = source.dataset.caption || source.querySelector('img')?.alt || '';
      caption.textContent = `${index + 1} / ${gallery.length} — ${image.alt}`;
      prev.disabled = gallery.length < 2;
      next.disabled = gallery.length < 2;
    };
    gallery.forEach((a, i) => a.addEventListener('click', event => { event.preventDefault(); display(i); lightbox.showModal(); document.body.classList.add('dialog-open'); }));
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('close', () => { document.body.classList.remove('dialog-open'); gallery[index]?.focus({ preventScroll: true }); });
    prev.addEventListener('click', () => display(index - 1));
    next.addEventListener('click', () => display(index + 1));
    lightbox.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' && gallery.length > 1) { event.preventDefault(); display(index - 1); } if (event.key === 'ArrowRight' && gallery.length > 1) { event.preventDefault(); display(index + 1); } });
    lightbox.addEventListener('click', event => { if (event.target === lightbox) { const r = lightbox.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) lightbox.close(); } });
  }
})();
