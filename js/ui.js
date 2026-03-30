/* ============================================================
   UI  ·  Hamburger menu · Sticky header scroll · Smooth scroll
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Hamburger menu toggle ── //
  const menuToggle = document.querySelector('.landing-menu-toggle');
  const landingNav = document.getElementById('landing-navigation');
  if (menuToggle && landingNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      landingNav.style.display = isExpanded ? 'none' : 'block';
      landingNav.setAttribute('aria-hidden', String(isExpanded));
    });
  }

  // ── Sticky header: frosted-glass transition + logo swap ── //
  const stickyHdr = document.querySelector('.landing-header');
  if (stickyHdr) {
    const logoImg = stickyHdr.querySelector('.landing-logo');
    const onHeroScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.75;
      stickyHdr.classList.toggle('header-scrolled', pastHero);
      if (logoImg) {
        logoImg.src = pastHero ? 'logo-inverted.svg' : 'logo.svg';
      }
    };
    window.addEventListener('scroll', onHeroScroll, { passive: true });
    onHeroScroll(); // run once on load (handles restored scroll position)
  }

  // ── Smooth-scroll for "Investors" nav link ── //
  document.querySelectorAll('a[href="#investors"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.getElementById('investors');
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // Close hamburger menu if open
      const nav    = document.getElementById('landing-navigation');
      const toggle = document.querySelector('.landing-menu-toggle');
      if (nav && nav.style.display !== 'none') {
        nav.style.display = 'none';
        nav.setAttribute('aria-hidden', 'true');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

});
