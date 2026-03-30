/* ============================================================
   POPUP  ·  Timer popup · Waitlist / download form submission
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const popup             = document.getElementById('timer-popup');
  const popupStep1        = document.getElementById('popup-step-1');
  const popupStep2        = document.getElementById('popup-step-2');
  const popupNameInput    = document.getElementById('popup-name');
  const popupEmailInput   = document.getElementById('popup-email');
  const popupNextButton   = document.getElementById('popup-next-step');
  const popupSubmitButton = document.getElementById('popup-submit');
  const popupSubmitting   = document.getElementById('popup-submitting');
  const popupSuccess      = document.getElementById('popup-success');
  const popupError        = document.getElementById('popup-error');
  const popupCloseButton  = document.getElementById('popup-close-button');

  // Guard: exit silently if popup HTML is not on this page
  if (!popup || !popupStep1 || !popupStep2 || !popupNameInput || !popupEmailInput ||
      !popupNextButton || !popupSubmitButton || !popupSubmitting || !popupSuccess || !popupError) {
    return;
  }

  const STORAGE_KEY_COMPLETED = 'popupCompleted';
  const STORAGE_KEY_NAME      = 'popupCurrentName';
  const STORAGE_KEY_DOWNLOAD  = 'downloadGuideCompleted';
  let isDownloadFlow = false;

  // ── Show popup ── //
  const showPopup = () => {
    const step1Heading   = popupStep1.querySelector('h2');
    const step1Paragraph = popupStep1.querySelector('p');
    const step2Heading   = popupStep2.querySelector('h2');
    const step2Paragraph = popupStep2.querySelector('p');

    if (isDownloadFlow) {
      step1Heading.textContent      = 'Please enter your name';
      step1Paragraph.textContent    = 'Download our product guide.';
      popupNextButton.textContent   = 'Continue';
      step2Heading.textContent      = 'Please enter your email';
      step2Paragraph.textContent    = 'Where should we send the product guide?';
      popupSubmitButton.textContent = 'Submit & Email Guide';
    } else {
      step1Heading.textContent      = 'This is THYS';
      step1Paragraph.textContent    = 'Be notified first! Enter your name to join our community.';
      popupNextButton.textContent   = 'Continue';
      step2Heading.textContent      = 'Almost there!';
      step2Paragraph.textContent    = 'Please enter your email so we can notify you about the launch.';
      popupSubmitButton.textContent = 'Submit';
    }

    document.documentElement.classList.add('popup-open');
    document.body.classList.add('popup-open');

    popupStep1.style.display      = 'block';
    popupStep2.style.display      = 'none';
    popupSubmitting.style.display = 'none';
    popupSuccess.style.display    = 'none';
    popupError.style.display      = 'none';
    popupNextButton.style.display   = 'block';
    popupSubmitButton.style.display = 'none';
    popupNameInput.value = localStorage.getItem(STORAGE_KEY_NAME) || '';

    const isLandingPage = document.body.classList.contains('landing-page-body');
    if (localStorage.getItem(STORAGE_KEY_NAME)) {
      popupStep1.style.display      = 'none';
      popupStep2.style.display      = 'block';
      popupNextButton.style.display   = 'none';
      popupSubmitButton.style.display = 'block';
      if (!isLandingPage) requestAnimationFrame(() => popupEmailInput.focus());
    } else {
      if (!isLandingPage) requestAnimationFrame(() => popupNameInput.focus());
    }

    popup.style.display = 'flex';
    setTimeout(() => { popup.classList.add('popup-visible'); }, 10);
  };

  // ── Hide popup ── //
  const hidePopup = () => {
    document.documentElement.classList.remove('popup-open');
    document.body.classList.remove('popup-open');
    popup.classList.remove('popup-visible');
    setTimeout(() => { popup.style.display = 'none'; }, 400);
  };

  // ── Trigger: Join Waitlist button ── //
  const joinWaitlistBtn = document.getElementById('join-waitlist-button');
  if (joinWaitlistBtn) {
    joinWaitlistBtn.addEventListener('click', e => {
      e.preventDefault();
      isDownloadFlow = false;
      showPopup();
    });
  }

  // ── Trigger: Download Guide button ── //
  const downloadGuideBtn = document.getElementById('download-guide-button');
  if (downloadGuideBtn) {
    downloadGuideBtn.addEventListener('click', e => {
      e.preventDefault();
      isDownloadFlow = true;
      localStorage.removeItem(STORAGE_KEY_NAME);
      popupStep1.style.display      = 'block';
      popupStep2.style.display      = 'none';
      popupNextButton.style.display   = 'block';
      popupSubmitButton.style.display = 'none';
      showPopup();
    });
  }

  // ── Auto-show after 4 minutes (landing page, first visit only) ── //
  if (document.body.classList.contains('landing-page-body') &&
      !localStorage.getItem(STORAGE_KEY_DOWNLOAD) &&
      !localStorage.getItem(STORAGE_KEY_COMPLETED)) {
    setTimeout(() => {
      if (!popup.classList.contains('popup-visible')) {
        localStorage.removeItem(STORAGE_KEY_NAME);
        isDownloadFlow = false;
        showPopup();
      }
    }, 240000); // 4 minutes
  }

  // ── Close button ── //
  if (popupCloseButton) {
    popupCloseButton.addEventListener('click', hidePopup);
  }

  // ── Enter key shortcuts ── //
  popupNameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); popupNextButton.click(); }
  });
  popupEmailInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); popupSubmitButton.click(); }
  });

  // ── Step 1 → Step 2 ── //
  popupNextButton.addEventListener('click', () => {
    const name = popupNameInput.value.trim();
    if (name) {
      localStorage.setItem(STORAGE_KEY_NAME, name);
      popupStep1.style.display      = 'none';
      popupStep2.style.display      = 'block';
      popupNextButton.style.display   = 'none';
      popupSubmitButton.style.display = 'block';
      if (!document.body.classList.contains('landing-page-body')) popupEmailInput.focus();
    } else {
      alert('Please enter your name.');
      popupNameInput.focus();
    }
  });

  // ── Form submission ── //
  popupSubmitButton.addEventListener('click', async () => {
    const name  = localStorage.getItem(STORAGE_KEY_NAME);
    const email = popupEmailInput.value.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address.');
      popupEmailInput.focus();
      return;
    }
    if (!name) { alert('Name is missing.'); return; }

    popupStep1.style.display      = 'none';
    popupStep2.style.display      = 'none';
    popupSubmitting.style.display = 'block';
    popupSuccess.style.display    = 'none';
    popupError.style.display      = 'none';

    try {
      const response = await fetch('/.netlify/functions/submit-popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, flowType: isDownloadFlow ? 'download' : 'waitlist' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `HTTP error ${response.status}`);

      popupSubmitting.style.display = 'none';
      popupSuccess.style.display    = 'block';
      const successP = popupSuccess.querySelector('p');
      if (successP) successP.style.color = 'var(--color-accent)';
      localStorage.setItem(STORAGE_KEY_COMPLETED, 'true');
      if (isDownloadFlow) localStorage.setItem(STORAGE_KEY_DOWNLOAD, 'true');
      setTimeout(hidePopup, 2000);

    } catch (error) {
      popupSubmitting.style.display = 'none';
      popupError.style.display      = 'block';
      const errorP = popupError.querySelector('p');
      if (errorP) {
        errorP.textContent = error.message.includes('HTTP error')
          ? 'Sorry, there was an error. Please try again later.'
          : error.message;
        errorP.style.color = '#dc3545';
      }
      setTimeout(hidePopup, 3000);
    }
  });

});
