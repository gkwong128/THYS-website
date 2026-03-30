/* ============================================================
   LOADER  ·  Loading screen · Learn-page animation · Video fade
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const isLearnPage   = document.body.classList.contains('learn-page-body');
  const isLandingPage = document.body.classList.contains('landing-page-body');

  // ── Learn page: immediate overlay fade + infinite word animation ── //
  if (isLearnPage) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      requestAnimationFrame(() => {
        document.body.classList.remove('landing-loading');
        loadingScreen.classList.add('hidden');
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 600);
      });
    }

    const prefixEl = document.getElementById('loading-prefix');
    const wordEl   = document.getElementById('loading-word');
    if (prefixEl && wordEl) {
      const wordsSequence = [
        { word: 'a dreamer',      delay: 600  },
        { word: 'a leader',       delay: 560  },
        { word: 'a storyteller',  delay: 520  },
        { word: 'a lover',        delay: 470  },
        { word: 'a rebel',        delay: 420  },
        { word: 'a collaborator', delay: 360  },
        { word: 'a daughter',     delay: 300  },
        { word: 'a mentor',       delay: 250  },
        { word: 'a woman',        delay: 210  },
        { word: 'a mother',       delay: 180  },
        { word: 'a sister',       delay: 150  },
        { word: 'a creator',      delay: 130  },
        { word: 'a doer',         delay: 110  },
        { word: 'a trend setter', delay: 95   },
        { word: 'a fashionista',  delay: 80   },
        { word: 'a care taker',   delay: 70   },
        { word: 'a visionary',    delay: 60   },
        { word: 'a trailblazer',  delay: 55   },
        { word: 'a healer',       delay: 50   },
        { word: 'a protector',    delay: 50   },
        { word: 'a listener',     delay: 50   },
        { word: 'a multitasker',  delay: 50   },
        { word: 'a fighter',      delay: 50   },
        { word: 'a nurturer',     delay: 50   },
        { word: 'a strategist',   delay: 50   },
        { word: 'an explorer',    delay: 50   },
        { word: 'a provider',     delay: 50   },
        { word: 'a student',      delay: 50   },
        { word: 'human',          delay: 1500 },
      ];
      const pause = ms => new Promise(res => setTimeout(res, ms));
      (async function animateLearn() {
        for (const { word, delay: ms } of wordsSequence) {
          wordEl.textContent = word;
          await pause(ms);
        }
        await pause(1500);
        animateLearn(); // loop forever
      })();
    }
    return; // learn page needs no further loader logic
  }

  // ── Landing page only beyond this point ── //
  if (!isLandingPage) return;

  let videoLoaded = false;
  let typingDone  = false;

  function hideLoaderIfReady() {
    const screen = document.getElementById('loading-screen');
    if (videoLoaded && typingDone && screen) {
      screen.classList.add('hidden');
      document.body.classList.remove('landing-loading');
      setTimeout(() => { screen.style.display = 'none'; }, 600);
    }
  }

  // ── Typing animation (first visit per session) ── //
  const loadingScreen = document.getElementById('loading-screen');
  const loadingText   = document.getElementById('loading-text');

  if (loadingScreen && loadingText) {
    const sessionKey = 'landingPageShown';
    if (!sessionStorage.getItem(sessionKey)) {
      // First visit: run typing animation
      sessionStorage.setItem(sessionKey, 'true');
      loadingScreen.style.opacity = '1';
      loadingScreen.style.display = 'flex';
      loadingScreen.classList.remove('hidden');

      const lines = ['unlimited heights', 'unlimited transformation', 'unlimited you'];
      loadingText.innerHTML = '<span id="typed"></span>';
      const typed = document.getElementById('typed');
      let lineIndex = 0, charIndex = 0;

      function typeLine() {
        const line = lines[lineIndex];
        if (charIndex < line.length) {
          typed.innerHTML += line.charAt(charIndex++);
          setTimeout(typeLine, 30);
        } else {
          lineIndex++;
          charIndex = 0;
          if (lineIndex < lines.length) {
            typed.innerHTML += '<br>';
            setTimeout(typeLine, 30);
          } else {
            setTimeout(() => { typingDone = true; hideLoaderIfReady(); }, 1500);
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
    }
  }

  // ── Background video fade-in ── //
  const vid = document.getElementById('landing-video');
  if (vid) {
    vid.style.opacity = 0;
    vid.addEventListener('loadeddata', () => {
      vid.style.transition = 'opacity 400ms ease';
      requestAnimationFrame(() => { vid.style.opacity = 1; });
      videoLoaded = true;
      hideLoaderIfReady();
    });
  } else {
    // No video on this page — mark as loaded so loader can close
    videoLoaded = true;
    hideLoaderIfReady();
  }

});
