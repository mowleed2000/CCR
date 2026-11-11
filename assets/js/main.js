/**
 * Collab Create Recruitment (CCR)
 * Core Client-Side Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initStickyHeader();
  initHeroVideo();
  initTabs();
  initAccordions();
  initEnquiryForms();
  initCurrentYear();
});

/**
 * Mobile Navigation Drawer Toggle & Accessibility
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const closeBtn = document.getElementById('nav-close');
  const drawer = document.getElementById('mobile-nav');
  const backdrop = document.getElementById('nav-backdrop');

  if (!toggleBtn || !drawer) return;

  function openMenu() {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // Close when clicking internal navigation links inside drawer
  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });
}

/**
 * Sticky Header shadow and subtle background shift on scroll
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Hero Video Controller (Play/Pause, Visibility Observer, Reduced Motion)
 */
function initHeroVideo() {
  const video = document.getElementById('hero-video');
  const toggleBtn = document.getElementById('video-toggle-btn');
  if (!video) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userPaused = false;

  if (prefersReducedMotion) {
    video.pause();
    userPaused = true;
    if (toggleBtn) {
      updateToggleButton(true);
    }
    return;
  }

  function updateToggleButton(isPaused) {
    if (!toggleBtn) return;
    const icon = toggleBtn.querySelector('.video-icon');
    const label = toggleBtn.querySelector('.video-label');
    if (isPaused) {
      if (icon) icon.innerHTML = '&#9658;'; // Play symbol
      if (label) label.textContent = 'Play Video';
      toggleBtn.setAttribute('aria-label', 'Play hero video');
    } else {
      if (icon) icon.innerHTML = '&#10074;&#10074;'; // Pause symbol
      if (label) label.textContent = 'Pause';
      toggleBtn.setAttribute('aria-label', 'Pause hero video');
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play().then(() => {
          userPaused = false;
          updateToggleButton(false);
        }).catch(err => {
          console.warn('Playback error:', err);
        });
      } else {
        video.pause();
        userPaused = true;
        updateToggleButton(true);
      }
    });
  }

  // Intersection Observer to conserve resources when video scrolls off-screen
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && !video.paused) {
          video.pause();
        } else if (entry.isIntersecting && !userPaused && video.paused) {
          video.play().catch(() => {});
        }
      });
    }, { threshold: 0.2 });

    observer.observe(video);
  }
}

/**
 * Tab Navigation (How it works pathways, sector views)
 */
function initTabs() {
  const tabContainers = document.querySelectorAll('[data-tabs-container]');
  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn, .type-tab-btn');
    const panes = container.querySelectorAll('.tab-pane');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        if (!targetId) return;

        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        panes.forEach(pane => {
          if (pane.id === targetId) {
            pane.classList.add('active');
            pane.removeAttribute('hidden');
          } else {
            pane.classList.remove('active');
            pane.setAttribute('hidden', 'true');
          }
        });
      });
    });
  });
}

/**
 * Accordion (FAQ sections)
 */
function initAccordions() {
  const accordions = document.querySelectorAll('.faq-item');
  accordions.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Optional: close other open accordions in the same list
      const parent = item.closest('.faq-list');
      if (parent) {
        parent.querySelectorAll('.faq-item.open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('open');
            const btn = openItem.querySelector('.faq-question');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      if (isOpen) {
        item.classList.remove('open');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * Enquiry Form Handling (Employer / Candidate dual mode & submission)
 */
function initEnquiryForms() {
  const forms = document.querySelectorAll('.enquiry-form');

  forms.forEach(form => {
    const typeButtons = form.querySelectorAll('.type-tab-btn');
    const typeInput = form.querySelector('input[name="enquiry_type"]');
    const employerFields = form.querySelectorAll('.field-employer');
    const candidateFields = form.querySelectorAll('.field-candidate');
    const statusMsg = form.querySelector('.form-status-message');

    // Tab switcher between Employer and Candidate inside form
    if (typeButtons.length > 0) {
      typeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const selectedType = btn.getAttribute('data-type');

          typeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          if (typeInput) typeInput.value = selectedType;

          if (selectedType === 'candidate') {
            employerFields.forEach(el => el.style.display = 'none');
            candidateFields.forEach(el => el.style.display = 'block');
            
            // Adjust required attributes
            employerFields.forEach(el => {
              const req = el.querySelectorAll('input, select, textarea');
              req.forEach(r => r.removeAttribute('required'));
            });
            candidateFields.forEach(el => {
              const req = el.querySelectorAll('[data-req="true"]');
              req.forEach(r => r.setAttribute('required', 'required'));
            });
          } else {
            // Employer mode
            employerFields.forEach(el => el.style.display = 'block');
            candidateFields.forEach(el => el.style.display = 'none');

            employerFields.forEach(el => {
              const req = el.querySelectorAll('[data-req="true"]');
              req.forEach(r => r.setAttribute('required', 'required'));
            });
            candidateFields.forEach(el => {
              const req = el.querySelectorAll('input, select, textarea');
              req.forEach(r => r.removeAttribute('required'));
            });
          }
        });
      });
    }

    // Submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Simple validation check
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const isEmployer = (data.enquiry_type || 'employer') === 'employer';
      const name = data.name || 'Valued Partner';
      const email = data.email || 'info@collabcreaterecruitment.com';

      // Build fallback mailto URL
      const subject = encodeURIComponent(
        isEmployer 
          ? `Employer Hiring Enquiry - ${data.company_name || name}`
          : `Candidate Career Enquiry - ${name}`
      );

      const bodyText = encodeURIComponent(
        `Hello Collab Create Recruitment team,\n\n` +
        `Enquiry Type: ${isEmployer ? 'Employer (Hiring)' : 'Candidate (Seeking Employment)'}\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${data.phone || 'N/A'}\n` +
        (isEmployer ? `Company: ${data.company_name || 'N/A'}\nRoles Needed: ${data.roles_needed || 'N/A'}\n` : `Target Sector: ${data.candidate_sector || 'N/A'}\nExperience: ${data.experience_summary || 'N/A'}\n`) +
        `Message:\n${data.message || 'N/A'}\n\n` +
        `Sent via Collab Create Recruitment Website`
      );

      const mailtoUrl = `mailto:info@collabcreaterecruitment.com?subject=${subject}&body=${bodyText}`;

      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.className = 'form-status-message success';
        statusMsg.innerHTML = `
          <strong>Thank you, ${name}!</strong><br>
          Your enquiry has been formatted. Our team will review your requirements and respond promptly at <em>${email}</em>.<br><br>
          <a href="${mailtoUrl}" class="btn btn-secondary" style="margin-top: 10px; display: inline-flex;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Send directly via your email client
          </a>
        `;
        statusMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form fields
      form.reset();
    });
  });
}

/**
 * Automatically update current year in footer
 */
function initCurrentYear() {
  const yearElements = document.querySelectorAll('.current-year');
  const year = new Date().getFullYear();
  yearElements.forEach(el => {
    el.textContent = year;
  });
}
