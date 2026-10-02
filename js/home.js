/* ============================================================
   HOME  ·  Mobile nav · Header shadow · Height demo · Reveal
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Mobile nav toggle ── //
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  }

  // ── Header shadow once scrolled ── //
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Heel height demo ── //
  const range = document.getElementById('heel-height');
  const valueEl = document.getElementById('height-value');
  const occasionEl = document.getElementById('height-occasion');
  const bar = document.getElementById('height-bar');
  if (range && valueEl && occasionEl && bar) {
    const occasionFor = (h) =>
      h <= 21 ? 'Commute & errands' :
      h <= 28 ? 'Office & meetings' :
      h <= 35 ? 'Dinner & events' : 'Gala & red carpet';
    const update = () => {
      const h = Number(range.value);               // tenths of an inch, 17–40
      const inches = (h / 10).toFixed(h % 10 === 0 ? 0 : 1);
      valueEl.textContent = inches + '″';
      occasionEl.textContent = occasionFor(h);
      bar.style.height = Math.round(h * 6) + 'px'; // 4″ = 240px, matches tick marks
      range.setAttribute('aria-valuetext', inches + ' inches');
    };
    range.addEventListener('input', () => {
      update();
      range.parentElement.classList.remove('is-untouched');
    });
    update();
  }

  // ── Scroll-in reveal ── //
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in-view'));
  }
});
