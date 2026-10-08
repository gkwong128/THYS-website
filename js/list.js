/* ============================================================
   LIST  ·  QR-code signup (/list) → /.netlify/functions/submit-popup
   Source tracking: /list?src=houston-gala  →  "houston-gala" in the Source column
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const form     = document.getElementById('list-form');
  const nameEl   = document.getElementById('list-name');
  const emailEl  = document.getElementById('list-email');
  const sizeEl   = document.getElementById('list-size');
  const submit   = document.getElementById('list-submit');
  const errorEl  = document.getElementById('list-error');
  const formWrap = document.getElementById('list-form-wrap');
  const success  = document.getElementById('list-success');
  const successName = document.getElementById('success-name');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const source = (params.get('src') || params.get('utm_source') || 'direct')
    .toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40) || 'direct';

  const showError = (msg, field) => {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    [nameEl, emailEl, sizeEl].forEach(el => el.removeAttribute('aria-invalid'));
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const name  = nameEl.value.trim();
    const email = emailEl.value.trim();
    const size  = sizeEl.value;

    if (!name) return showError('Please enter your first name.', nameEl);
    if (!/^\S+@\S+\.\S+$/.test(email)) return showError('Please enter a valid email.', emailEl);
    if (!size) return showError('Please choose your shoe size.', sizeEl);

    submit.disabled = true;
    submit.textContent = 'Saving…';

    try {
      const res = await fetch('/.netlify/functions/submit-popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, size, source, flowType: 'list' }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      successName.textContent = ', ' + name;
      formWrap.hidden = true;
      success.hidden = false;
      success.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      submit.disabled = false;
      submit.textContent = 'Keep me updated';
      showError('Something went wrong. Please try again.');
    }
  });
});
