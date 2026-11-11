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
  initMotionReveal();
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
  document.querySelectorAll('.enquiry-form').forEach(form => {
    const typeButtons = form.querySelectorAll('.type-tab-btn');
    const typeInput = form.querySelector('input[name="enquiry_type"]');
    const employerFields = form.querySelectorAll('.field-employer');
    const candidateFields = form.querySelectorAll('.field-candidate');
    const statusMsg = form.querySelector('.form-status-message');

    const setType = (type) => {
      const isCandidate = type === 'candidate';
      if (typeInput) typeInput.value = type;

      typeButtons.forEach(button => {
        const active = button.dataset.type === type;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      employerFields.forEach(group => {
        group.style.display = isCandidate ? 'none' : '';
        group.querySelectorAll('[data-req="true"]').forEach(field => {
          field.required = !isCandidate;
        });
      });
      candidateFields.forEach(group => {
        group.style.display = isCandidate ? '' : 'none';
        group.querySelectorAll('input, select, textarea').forEach(field => {
          field.required = isCandidate && field.tagName === 'SELECT';
        });
      });
    };

    if (typeButtons.length) {
      typeButtons.forEach(button => {
        button.addEventListener('click', () => setType(button.dataset.type || 'employer'));
      });
      setType(typeInput?.value || 'employer');
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const isEmployer = data.enquiry_type === 'employer';
      const name = data.name || '';
      const subject = encodeURIComponent(
        isEmployer
          ? `Employer hiring enquiry - ${data.company_name || name}`
          : `Candidate career enquiry - ${name}`
      );
      const details = [
        'Hello Collab Create Recruitment team,',
        '',
        `Enquiry type: ${isEmployer ? 'Employer (hiring)' : 'Candidate (seeking employment)'}`,
        `Name: ${name}`,
        `Email: ${data.email || ''}`,
        data.phone ? `Phone: ${data.phone}` : '',
        isEmployer
          ? `Company: ${data.company_name || ''}\nRoles needed: ${data.roles_needed || ''}\nSector: ${data.sector || ''}`
          : `Target sector: ${data.candidate_sector || ''}\nExperience: ${data.experience_summary || ''}`,
        '',
        `Message: ${data.message || ''}`
      ].filter(Boolean).join('\n');
      const mailto = `mailto:info@collabcreaterecruitment.com?subject=${subject}&body=${encodeURIComponent(details)}`;

      if (statusMsg) {
        statusMsg.replaceChildren();
        statusMsg.className = 'form-status-message success';
        statusMsg.style.display = 'block';
        const heading = document.createElement('strong');
        heading.textContent = 'Your enquiry is ready to send.';
        const explanation = document.createElement('p');
        explanation.textContent = 'Choose the button below to open your email app with the enquiry details filled in. The enquiry is sent only after you send that email.';
        const link = document.createElement('a');
        link.href = mailto;
        link.className = 'btn btn-secondary';
        link.textContent = 'Open email to send enquiry';
        link.style.marginTop = '10px';
        statusMsg.append(heading, explanation, link);
        statusMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
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

/**
 * Reveal important sections as they enter the viewport.
 * The page remains fully visible when motion is reduced or observers are unavailable.
 */
function initMotionReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.section-header, .portal-card, .sector-card, .step-card, .timeline-item, .value-card, .contact-info-panel, .contact-form-panel'
  );
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  targets.forEach((target, index) => {
    target.classList.add('motion-reveal');
    target.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
    observer.observe(target);
  });
}
