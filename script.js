// script.js - Combined script for landing page and learn page

document.addEventListener('DOMContentLoaded', () => {
    // Global loader sync flags and checker (available to entire callback)
    let videoLoaded = false;
    let typingDone  = false;
    function hideLoaderIfReady() {
        const loadingScreen = document.getElementById('loading-screen');
        if (videoLoaded && typingDone && loadingScreen) {
            loadingScreen.classList.add('hidden');
            document.body.classList.remove('landing-loading');
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 600);
        }
    }
    // In-place Learn-page animation (skip loading overlay logic)
    if (document.body.classList.contains('learn-page-body')) {
        const prefixEl = document.getElementById('loading-prefix');
        const wordEl   = document.getElementById('loading-word');
        if (prefixEl && wordEl) {
            const wordsSequence = [
                { word: 'a dreamer', delay: 600 },
                { word: 'a leader', delay: 560 },
                { word: 'a storyteller', delay: 520 },
                { word: 'a lover', delay: 470 },
                { word: 'a rebel', delay: 420 },
                { word: 'a collaborator', delay: 360 },
                { word: 'a daughter', delay: 300 },
                { word: 'a mentor', delay: 250 },
                { word: 'a woman', delay: 210 },
                { word: 'a mother', delay: 180 },
                { word: 'a sister', delay: 150 },
                { word: 'a creator', delay: 130 },
                { word: 'a doer', delay: 110 },
                { word: 'a trend setter', delay: 95 },
                { word: 'a fashionista', delay: 80 },
                { word: 'a care taker', delay: 70 },
                { word: 'a visionary', delay: 60 },
                { word: 'a trailblazer', delay: 55 },
                { word: 'a healer', delay: 50 },
                { word: 'a protector', delay: 50 },
                { word: 'a listener', delay: 50 },
                { word: 'a multitasker', delay: 50 },
                { word: 'a fighter', delay: 50 },
                { word: 'a nurturer', delay: 50 },
                { word: 'a strategist', delay: 50 },
                { word: 'an explorer', delay: 50 },
                { word: 'a provider', delay: 50 },
                { word: 'a student', delay: 50 },
                { word: 'human', delay: 1500 }
            ];
            const pause = ms => new Promise(res => setTimeout(res, ms));
            (async function animateLearn() {
                for (const { word, delay: ms } of wordsSequence) {
                    // Only update the dynamic word; prefix remains static
                    wordEl.textContent = word;
                    await pause(ms);
                }
                // Extra pause on final "human"
                await pause(1500);
                animateLearn();
            })();
        }
        // Continue with the rest of the script on learn page
    }
    console.log("DOM fully loaded and parsed"); // General check
    let skipLoader = false;   // true when we bypass the "Unlimited You" screen

    // ===== Timer Popup Logic Start =====
    const popup = document.getElementById('timer-popup');
    const popupStep1 = document.getElementById('popup-step-1');
    const popupStep2 = document.getElementById('popup-step-2');
    const popupNameInput = document.getElementById('popup-name');
    const popupEmailInput = document.getElementById('popup-email');
    const popupNextButton = document.getElementById('popup-next-step');
    const popupSubmitButton = document.getElementById('popup-submit');
    const popupSubmitting = document.getElementById('popup-submitting');
    const popupSuccess = document.getElementById('popup-success');
    const popupError = document.getElementById('popup-error');
    const popupCloseButton = document.getElementById('popup-close-button'); // Get close button
    // Download flow indicator and download completion key
    let isDownloadFlow = false;
    const STORAGE_KEY_DOWNLOAD = 'downloadGuideCompleted';

    // Only proceed if the popup HTML exists on the page
    if (popup && popupStep1 && popupStep2 && popupNameInput && popupEmailInput && popupNextButton && popupSubmitButton && popupSubmitting && popupSuccess && popupError) {
        const STORAGE_KEY_COMPLETED = 'popupCompleted';
        const STORAGE_KEY_NAME = 'popupCurrentName';

        // showPopup function
        const showPopup = () => {
            console.log("Showing Popup");
            // Adjust popup text for download vs. waitlist flows
            const step1Heading = popupStep1.querySelector('h2');
            const step1Paragraph = popupStep1.querySelector('p');
            const step2Heading = popupStep2.querySelector('h2');
            const step2Paragraph = popupStep2.querySelector('p');

            if (isDownloadFlow) {
              step1Heading.textContent = 'Please enter your name';
              step1Paragraph.textContent = 'Download our product guide.';
              popupNextButton.textContent = 'Continue';

              step2Heading.textContent = 'Please enter your email';
              step2Paragraph.textContent = 'Where should we send the product guide?';
              popupSubmitButton.textContent = 'Submit & Email Guide';
            } else {
              // Default waitlist copy
              step1Heading.textContent = 'This is THYS';
              step1Paragraph.textContent = 'Be notified first! Enter your name to join our community.';
              popupNextButton.textContent = 'Continue';

              step2Heading.textContent = 'Almost there!';
              step2Paragraph.textContent = 'Please enter your email so we can notify you about the launch.';
              popupSubmitButton.textContent = 'Submit';
            }

            // 1. Apply CSS classes first to hide overflow
            document.documentElement.classList.add('popup-open');
            document.body.classList.add('popup-open');
            // 3. Continue with the rest of the popup display logic
            popupStep1.style.display = 'block';
            popupStep2.style.display = 'none';
            popupSubmitting.style.display = 'none';
            popupSuccess.style.display = 'none';
            popupError.style.display = 'none';
            popupNextButton.style.display = 'block';
            popupSubmitButton.style.display = 'none';
            popupNameInput.value = localStorage.getItem(STORAGE_KEY_NAME) || '';

            // Check if NOT on landing page before setting focus
            const isLandingPage = document.body.classList.contains('landing-page-body');

            if (localStorage.getItem(STORAGE_KEY_NAME)) {
                popupStep1.style.display = 'none';
                popupStep2.style.display = 'block';
                popupNextButton.style.display = 'none';
                popupSubmitButton.style.display = 'block';
                // Only focus if not landing page
                if (!isLandingPage) {
                    requestAnimationFrame(() => popupEmailInput.focus());
                }
            } else {
                 // Only focus if not landing page
                 if (!isLandingPage) {
                     requestAnimationFrame(() => popupNameInput.focus());
                 }
            }

            popup.style.display = 'flex';
            setTimeout(() => { popup.classList.add('popup-visible'); }, 10); // Fade in
        };

        // Attach Join Waitlist button to show the popup
        const joinWaitlistBtn = document.getElementById('join-waitlist-button');
        if (joinWaitlistBtn) {
          joinWaitlistBtn.addEventListener('click', e => {
            e.preventDefault();
            isDownloadFlow = false;
            showPopup();
          });
        }

        // Trigger popup when clicking "Download Guide" button
        const downloadGuideBtn = document.getElementById('download-guide-button');
        if (downloadGuideBtn) {
          downloadGuideBtn.addEventListener('click', e => {
            e.preventDefault();
            isDownloadFlow = true;
            // Clear any previously saved name so we always ask for name first
            localStorage.removeItem(STORAGE_KEY_NAME);
            // Reset to Step 1
            popupStep1.style.display = 'block';
            popupStep2.style.display = 'none';
            popupNextButton.style.display = 'block';
            popupSubmitButton.style.display = 'none';
            showPopup();
          });
        }

        // Auto‑show “This is THYS” only on the landing page and only if no popup has been completed
        if (
          document.body.classList.contains('landing-page-body') &&
          !localStorage.getItem(STORAGE_KEY_DOWNLOAD) &&
          !localStorage.getItem(STORAGE_KEY_COMPLETED)
        ) {
          setTimeout(() => {
            // Only trigger if not already visible
            if (!popup.classList.contains('popup-visible')) {
              // Ensure waitlist flow (name→email)
              localStorage.removeItem(STORAGE_KEY_NAME);
              isDownloadFlow = false;
              showPopup();
            }
          }, 240000); // 240,000 ms = 4 minutes
        }

        // hidePopup function
        const hidePopup = () => {
            // Always remove classes to allow default overflow
            document.documentElement.classList.remove('popup-open');
            document.body.classList.remove('popup-open');
            // Hide popup element
            popup.classList.remove('popup-visible');
            setTimeout(() => { popup.style.display = 'none'; }, 400); // Wait for fade out
        };

        // --- Add Enter Key Submission for Popup Inputs ---
        if (popupNameInput && popupNextButton) {
          popupNameInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
              event.preventDefault();
              popupNextButton.click();
            }
          });
        }
        if (popupEmailInput && popupSubmitButton) {
          popupEmailInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
              event.preventDefault();
              popupSubmitButton.click();
            }
          });
        }
        // --- End Enter Key Submission ---

        // --- Add Popup Close Button Listener ---
        if (popupCloseButton) {
            popupCloseButton.addEventListener('click', () => {
                hidePopup();
                // Optional: Decide if dismissing should also prevent future popups
                // localStorage.setItem(STORAGE_KEY_COMPLETED, 'true'); // Uncomment to prevent future popups on close
            });
        }
        // --- End Popup Close Button Listener ---

        // --- Popup Step Handling ---
        if (popupNextButton) {
            popupNextButton.addEventListener('click', () => {
                const name = popupNameInput.value.trim();
                if (name) {
                    localStorage.setItem(STORAGE_KEY_NAME, name);
                    popupStep1.style.display = 'none'; popupStep2.style.display = 'block';
                    popupNextButton.style.display = 'none'; popupSubmitButton.style.display = 'block';
                     // Only focus if not landing page
                    if (!document.body.classList.contains('landing-page-body')) {
                        popupEmailInput.focus();
                    }
                } else { alert("Please enter your name."); popupNameInput.focus(); }
            });
        }

        // --- Popup Submission Handling ---
        if (popupSubmitButton) {
            popupSubmitButton.addEventListener('click', async () => {
                const name = localStorage.getItem(STORAGE_KEY_NAME);
                const email = popupEmailInput.value.trim();
                if (!email || !/\S+@\S+\.\S+/.test(email)) { alert("Please enter a valid email address."); popupEmailInput.focus(); return; }
                if (!name) { alert("Name is missing."); /* Optionally handle missing name better */ return; }

                console.log("Submitting:", { name, email });
                popupStep1.style.display = 'none'; popupStep2.style.display = 'none';
                popupSubmitting.style.display = 'block'; popupSuccess.style.display = 'none'; popupError.style.display = 'none';

                const endpoint = '/.netlify/functions/submit-popup';

                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, flowType: isDownloadFlow ? 'download' : 'waitlist' }),
                    });

                    const result = await response.json(); // Try parsing JSON regardless of status

                    if (!response.ok) {
                        console.error(`Function error! Status: ${response.status}`, result);
                        throw new Error(result.error || `HTTP error! status: ${response.status}`);
                    }

                    // Success
                    popupSubmitting.style.display = 'none';
                    popupSuccess.style.display = 'block';
                    const successP = popupSuccess.querySelector('p');
                    if (successP) {
                        successP.style.color = 'var(--color-accent)';
                    }
                    localStorage.setItem(STORAGE_KEY_COMPLETED, 'true');
                    // If this is the download flow, mark as completed
                    if (isDownloadFlow) {
                      localStorage.setItem(STORAGE_KEY_DOWNLOAD, 'true');
                    }
                    setTimeout(hidePopup, 2000);

                } catch (error) {
                    console.error('Submission failed:', error);
                    popupSubmitting.style.display = 'none';
                    popupError.style.display = 'block';
                    const errorP = popupError.querySelector('p');
                    if (errorP) {
                        errorP.textContent = error.message.includes('HTTP error') ? 'Sorry, there was an error. Please try again later.' : error.message; // Show specific error if available
                        errorP.style.color = '#dc3545';
                    }
                    setTimeout(hidePopup, 3000);
                }
            });
        }
    } else {
         if (document.getElementById('timer-popup')) {
            console.error("Timer popup inner elements not found. Popup logic cannot run.");
         }
    }
    // ===== Timer Popup Logic End =====



   // ===== Loading Screen Logic (RUNS ONCE PER SESSION for index.html) Start =====
   const isLanding = document.body.classList.contains('landing-page-body');
   if (isLanding) {
       const loadingScreen = document.getElementById('loading-screen');
       const loadingText   = document.getElementById('loading-text');
       if (!loadingScreen || !loadingText) {
           console.error('Landing page: loader elements missing; loader logic skipped.');
       } else {
           const sessionKey = 'landingPageShown';
           // First visit: show loading animation
           if (!sessionStorage.getItem(sessionKey)) {
               // mark as shown and reset state
               sessionStorage.setItem(sessionKey, 'true');
               loadingScreen.style.opacity = '1';
               loadingScreen.style.display = 'flex';
               loadingScreen.classList.remove('hidden');

               // typing animation
               const lines = [
                   'unlimited heights',
                   'unlimited transformation',
                   'unlimited you'
               ];
               loadingText.innerHTML = '<span id="typed"></span>';
               const typed = document.getElementById('typed');
               let lineIndex = 0, charIndex = 0;
               const typeSpeed = 30;

               function typeLine() {
                   const line = lines[lineIndex];
                   if (charIndex < line.length) {
                       typed.innerHTML += line.charAt(charIndex++);
                       setTimeout(typeLine, typeSpeed);
                   } else {
                       lineIndex++;
                       charIndex = 0;
                       if (lineIndex < lines.length) {
                           typed.innerHTML += '<br>';
                           setTimeout(typeLine, typeSpeed);
                       } else {
                           setTimeout(() => {
                               typingDone = true;
                               hideLoaderIfReady();
                           }, 1500);
                       }
                   }
               }
               typeLine();
           } else {
               // Subsequent visits: skip loader immediately
               loadingScreen.style.display = 'none';
               loadingScreen.classList.add('hidden');
               document.body.classList.remove('landing-loading');
               videoLoaded = true;
               typingDone  = true;
               hideLoaderIfReady();
           }
       }
   }
   // ===== Loading Screen Logic End =====

    // ===== Hamburger Menu Toggle (All Pages) =====
    const menuToggle = document.querySelector('.landing-menu-toggle');
    const landingNav = document.getElementById('landing-navigation');
    if (menuToggle && landingNav) {
      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        const nextDisplay = isExpanded ? 'none' : 'block';
        landingNav.style.display = nextDisplay;
        landingNav.setAttribute('aria-hidden', String(isExpanded));
      });
    }
    // ===== Hamburger Menu Toggle End =====





    // --- Mobile/Tablet Menu Toggle Logic (for main nav) ---
    const mainMmenuToggles = document.querySelectorAll('#navbar .mobile-menu-toggle, .sticky-navbar .mobile-menu-toggle');
    const mainHamburgerBreakpoint = 1024;
    if (mainMmenuToggles.length > 0) {
        mainMmenuToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                // This toggle logic should work regardless of page type (landing or other)
                const targetMenuId = toggle.getAttribute('aria-controls');
                const targetMenu = document.getElementById(targetMenuId);
                if (targetMenu) {
                    const isOpen = targetMenu.classList.toggle('is-open');
                    toggle.setAttribute('aria-expanded', isOpen);
                    // Simple text change for toggle button (replace with SVG swap if needed)
                    toggle.innerHTML = isOpen ? '×' : '☰';
                    if (!isOpen) { targetMenu.querySelectorAll('.nav-item.submenu-open').forEach(item => item.classList.remove('submenu-open')); }
                }
            });
        });
     }

    // --- Mobile/Tablet Submenu Toggle Logic (for main nav) ---
    const mainSubmenuTriggers = document.querySelectorAll('.sticky-navbar .mobile-nav-menu .nav-item > span');
     if (mainSubmenuTriggers.length > 0) {
        mainSubmenuTriggers.forEach(trigger => {
            const parentItem = trigger.closest('.nav-item');
            const submenu = parentItem.querySelector('.mega-menu');
            if (submenu) {
                trigger.addEventListener('click', (event) => {
                    if (window.innerWidth < mainHamburgerBreakpoint) {
                        event.preventDefault();
                        const currentMenu = trigger.closest('.mobile-nav-menu');
                        if (currentMenu) { currentMenu.querySelectorAll('.nav-item.submenu-open').forEach(openItem => { if (openItem !== parentItem) { openItem.classList.remove('submenu-open'); } }); }
                        parentItem.classList.toggle('submenu-open');
                    }
                });
            }
        });
     }


    // --- Resize Handler for Desktop State Cleanup (for main nav) ---
    let mainResizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(mainResizeTimeout);
        mainResizeTimeout = setTimeout(() => {
            if (window.innerWidth >= mainHamburgerBreakpoint) {
                document.querySelectorAll('.sticky-navbar .mobile-nav-menu.is-open').forEach(openMenu => {
                    openMenu.classList.remove('is-open');
                    const toggle = openMenu.closest('nav')?.querySelector('.mobile-menu-toggle');
                    if(toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.innerHTML = '☰'; }
                    openMenu.querySelectorAll('.nav-item.submenu-open').forEach(item => item.classList.remove('submenu-open'));
                });
            }
            // Recalculate sticky nav visibility on resize
            // (Removed stickyNavbar/nonStickyNavbar reference and handleScroll call)
        }, 150);
     }, { passive: true });

    // ===== Original script.js Logic End =====

    /* ----- Background video fade‑in & loader sync (landing page) ----- */
    const vid = document.getElementById('landing-video');
    if (vid) {
        if (skipLoader) {
            /* Second+ visit – show poster immediately, don’t start opaque‑0 fade */
            vid.style.opacity = 1;
        } else {
            /* First visit – start with a fade from poster to video */
            vid.style.opacity = 0;
            vid.addEventListener('loadeddata', () => {
                vid.style.transition = 'opacity 400ms ease';
                requestAnimationFrame(() => vid.style.opacity = 1);
                videoLoaded = true;
                hideLoaderIfReady();
            });
        }
    } else {
        // No background video on this page – consider it “loaded” so loader can close
        videoLoaded = true;
        hideLoaderIfReady();
    }
  

}); // End DOMContentLoaded
