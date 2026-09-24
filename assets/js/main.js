/* ==========================================================================
   SILENT BEATS - MAIN INTERACTIVE JAVASCRIPT
   Handles: Theme, RTL, Mobile Drawer, 3-Channel Audio Visualizer,
            DJ Battle Mixer, Package Calculator, Gallery Lightbox, Form Validation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* --------------------------------------------------------------------------
     1. THEME TOGGLE (Dark / Light Mode)
     -------------------------------------------------------------------------- */
  const currentTheme = localStorage.getItem('silentbeats_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const themeToggles = document.querySelectorAll('.theme-toggle');
  
  function updateThemeIcons(theme) {
    themeToggles.forEach(btn => {
      btn.innerHTML = theme === 'dark' 
        ? '<i data-lucide="sun"></i>' 
        : '<i data-lucide="moon"></i>';
    });
    if (window.lucide) window.lucide.createIcons();
  }

  updateThemeIcons(currentTheme);

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('silentbeats_theme', newTheme);
      updateThemeIcons(newTheme);
    });
  });

  /* --------------------------------------------------------------------------
     2. RTL TOGGLE (Left-to-Right / Right-to-Left)
     -------------------------------------------------------------------------- */
  const savedDir = localStorage.getItem('silentbeats_dir') || 'ltr';
  document.documentElement.setAttribute('dir', savedDir);

  const rtlToggles = document.querySelectorAll('.rtl-toggle');
  rtlToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      // Temporarily freeze transitions to eliminate hamburger menu / drawer flashing
      document.documentElement.classList.add('no-transition');
      const allDrawers = document.querySelectorAll('.mobile-drawer, .dash-sidebar');
      allDrawers.forEach(d => { d.style.transition = 'none'; });

      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', newDir);
      localStorage.setItem('silentbeats_dir', newDir);

      // Restore transitions smoothly on next animation frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('no-transition');
          allDrawers.forEach(d => { d.style.transition = ''; });
        });
      });
    });
  });

  /* --------------------------------------------------------------------------
     3. MOBILE DRAWER (<= 1024px)
     -------------------------------------------------------------------------- */
  const hamburgerBtns = document.querySelectorAll('.hamburger-btn');
  const drawerOverlay = document.querySelector('.mobile-drawer-overlay');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerCloseBtns = document.querySelectorAll('.drawer-close-btn');
  const drawerLinks = document.querySelectorAll('.drawer-nav-link');

  function openDrawer() {
    if (drawerOverlay && drawer) {
      drawerOverlay.classList.add('active');
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (drawerOverlay && drawer) {
      drawerOverlay.classList.remove('active');
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  hamburgerBtns.forEach(btn => btn.addEventListener('click', openDrawer));
  drawerCloseBtns.forEach(btn => btn.addEventListener('click', closeDrawer));
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  /* --------------------------------------------------------------------------
     4. 3-CHANNEL LIVE SILENT DISCO AUDIO VISUALIZER
     -------------------------------------------------------------------------- */
  const visualizerCanvas = document.getElementById('visualizerCanvas');
  const channelPills = document.querySelectorAll('.channel-pill');
  const currentTrackName = document.getElementById('currentTrackName');
  const currentChannelBpm = document.getElementById('currentChannelBpm');

  const channelTracks = {
    '1': { name: 'Channel 1: Electric Dreams (EDM & Festival Bangers)', bpm: '128 BPM', color: '#3b82f6' },
    '2': { name: 'Channel 2: 90s Throwback & Hip-Hop Gold', bpm: '95 BPM', color: '#ef4444' },
    '3': { name: 'Channel 3: Top 40 & Global Pop Hits', bpm: '122 BPM', color: '#10b981' }
  };

  let activeChannel = '1';

  if (channelPills.length > 0) {
    channelPills.forEach(pill => {
      pill.addEventListener('click', () => {
        channelPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeChannel = pill.getAttribute('data-channel');
        
        if (currentTrackName && channelTracks[activeChannel]) {
          currentTrackName.textContent = channelTracks[activeChannel].name;
        }
        if (currentChannelBpm && channelTracks[activeChannel]) {
          currentChannelBpm.textContent = channelTracks[activeChannel].bpm;
        }
      });
    });
  }

  if (visualizerCanvas) {
    const ctx = visualizerCanvas.getContext('2d');
    let animationFrameId;

    function resizeCanvas() {
      visualizerCanvas.width = visualizerCanvas.offsetWidth;
      visualizerCanvas.height = visualizerCanvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let phase = 0;
    function renderVisualizer() {
      ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
      const width = visualizerCanvas.width;
      const height = visualizerCanvas.height;
      const barCount = 36;
      const barWidth = width / barCount - 4;

      const activeColor = channelTracks[activeChannel] ? channelTracks[activeChannel].color : '#8b5cf6';

      for (let i = 0; i < barCount; i++) {
        const freq = Math.sin(phase + i * 0.2) * 0.5 + 0.5;
        const noise = Math.random() * 0.2;
        const barHeight = (freq * 0.75 + noise * 0.25) * (height - 20) + 10;
        const x = i * (barWidth + 4) + 2;
        const y = height - barHeight;

        // Gradient Bar
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
        gradient.addColorStop(1, activeColor);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      }

      phase += activeChannel === '1' ? 0.08 : (activeChannel === '2' ? 0.05 : 0.07);
      animationFrameId = requestAnimationFrame(renderVisualizer);
    }
    renderVisualizer();
  }

  /* --------------------------------------------------------------------------
     5. HOME 2: INTERACTIVE DJ BATTLE MIXER
     -------------------------------------------------------------------------- */
  const crossfader = document.getElementById('djCrossfader');
  const deckAIndicator = document.getElementById('deckAIndicator');
  const deckBIndicator = document.getElementById('deckBIndicator');
  const sfxButtons = document.querySelectorAll('.sfx-btn');

  if (crossfader) {
    crossfader.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      const deckAOpacity = 1 - (val / 100);
      const deckBOpacity = val / 100;
      if (deckAIndicator) deckAIndicator.style.opacity = Math.max(0.2, deckAOpacity);
      if (deckBIndicator) deckBIndicator.style.opacity = Math.max(0.2, deckBOpacity);
    });
  }

  if (sfxButtons.length > 0) {
    sfxButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.add('active');
        showToast(`Sound FX Triggered: ${btn.textContent.trim()} 🔊`);
        setTimeout(() => btn.classList.remove('active'), 500);
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. DYNAMIC PACKAGE COST CALCULATOR (Packages & Booking)
     -------------------------------------------------------------------------- */
  const headsetSlider = document.getElementById('headsetCountSlider');
  const headsetCountDisplay = document.getElementById('headsetCountDisplay');
  const estimatedPriceDisplay = document.getElementById('estimatedPriceDisplay');
  const addonCheckboxes = document.querySelectorAll('.addon-calc-check');

  function calculatePackageTotal() {
    if (!headsetSlider) return;
    const count = parseInt(headsetSlider.value, 10);
    if (headsetCountDisplay) headsetCountDisplay.textContent = `${count} Headsets`;

    // Tiered calculation: base price $6.50 per headset up to 50, $5.50 for 50-200, $4.50 for 200+
    let unitPrice = 6.5;
    if (count > 50) unitPrice = 5.5;
    if (count > 200) unitPrice = 4.5;
    if (count > 500) unitPrice = 3.75;

    let subtotal = count * unitPrice + 75; // base transmitter pack

    addonCheckboxes.forEach(chk => {
      if (chk.checked) {
        subtotal += parseFloat(chk.getAttribute('data-price') || 0);
      }
    });

    if (estimatedPriceDisplay) {
      estimatedPriceDisplay.textContent = `$${Math.round(subtotal)}`;
    }
  }

  if (headsetSlider) {
    headsetSlider.addEventListener('input', calculatePackageTotal);
    addonCheckboxes.forEach(chk => chk.addEventListener('change', calculatePackageTotal));
    calculatePackageTotal();
  }

  /* --------------------------------------------------------------------------
     7. FILTERABLE GALLERY & LIGHTBOX MODAL
     -------------------------------------------------------------------------- */
  const galleryTabs = document.querySelectorAll('.gallery-tab-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.querySelector('.lightbox-modal');
  const lightboxImg = document.querySelector('.lightbox-content img');
  const lightboxClose = document.querySelector('.lightbox-close');

  if (galleryTabs.length > 0) {
    galleryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        galleryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.getAttribute('data-filter');

        galleryItems.forEach(item => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  if (galleryItems.length > 0 && lightboxModal && lightboxImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
          lightboxImg.src = img.src;
          lightboxModal.classList.add('active');
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.remove('active');
      });
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  /* --------------------------------------------------------------------------
     8. FAQ ACCORDION
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });

  /* --------------------------------------------------------------------------
     9. FORM VALIDATION (Step 12)
     -------------------------------------------------------------------------- */
  const validatedForms = document.querySelectorAll('form[data-validate="true"]');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validatedForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate inputs
      const requiredInputs = form.querySelectorAll('[required]');
      requiredInputs.forEach(input => {
        const errorMsg = input.parentElement.querySelector('.form-error-msg');
        let fieldValid = true;

        if (input.type === 'email') {
          if (!emailRegex.test(input.value.trim())) {
            fieldValid = false;
          }
        } else if (input.type === 'password') {
          if (input.value.length < 8) {
            fieldValid = false;
          }
        } else if (input.type === 'checkbox') {
          if (!input.checked) {
            fieldValid = false;
          }
        } else {
          if (!input.value.trim()) {
            fieldValid = false;
          }
        }

        // Confirm Password Match Check
        if (input.id === 'confirmPassword' || input.name === 'confirmPassword') {
          const passInput = form.querySelector('#password, [name="password"]');
          if (passInput && passInput.value !== input.value) {
            fieldValid = false;
          }
        }

        if (!fieldValid) {
          isValid = false;
          input.classList.add('is-invalid');
          input.classList.remove('is-valid');
          if (errorMsg) errorMsg.classList.add('visible');
        } else {
          input.classList.remove('is-invalid');
          input.classList.add('is-valid');
          if (errorMsg) errorMsg.classList.remove('visible');
        }
      });

      if (isValid) {
        const customSuccessMsg = form.getAttribute('data-success-msg') || 'Form submitted successfully! 🎉';
        showToast(customSuccessMsg);
        
        // Handle Auth Redirect simulation
        if (form.id === 'loginForm') {
          setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } else if (form.id === 'registerForm') {
          setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } else {
          form.reset();
          requiredInputs.forEach(input => input.classList.remove('is-valid'));
        }
      }
    });

    // Real-time error removal on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        const errorMsg = input.parentElement.querySelector('.form-error-msg');
        if (errorMsg) errorMsg.classList.remove('visible');
      });
    });
  });

  /* --------------------------------------------------------------------------
     10. GLOBAL TOAST ALERT FUNCTION
     -------------------------------------------------------------------------- */
  function showToast(message) {
    let toast = document.querySelector('.toast-alert');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-alert';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i data-lucide="sparkles" style="color: var(--primary);"></i> <span>${message}</span>`;
    if (window.lucide) window.lucide.createIcons();
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  window.showToast = showToast;

  /* --------------------------------------------------------------------------
     11. BACK TO TOP CONTROLLER (ALL DEVICES)
     -------------------------------------------------------------------------- */
  let backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTopBtn';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.setAttribute('title', 'Back to top');
    backToTopBtn.innerHTML = '<i data-lucide="arrow-up"></i>';
    document.body.appendChild(backToTopBtn);
    if (window.lucide) window.lucide.createIcons();
  }

  function toggleBackToTop() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Footer inline back to top buttons
  document.querySelectorAll('.footer-back-to-top, [data-action="back-to-top"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
});
