/* ══════════════════════════════════════════
   MAIN.JS — Upgraded Animation System
   Lenis + GSAP — Cohesive, Smooth, Bug-Free
   ══════════════════════════════════════════ */

// ── 1. Safe Initialization Check ──
const hasAnimations = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

if (hasAnimations) {
  // Signal to CSS that animations are active and initialized
  document.documentElement.classList.add('animations-enabled');
} else {
  document.documentElement.classList.remove('animations-enabled');
}

// ── 2. Initialize Lenis Smooth Scrolling (with safe fallback) ──
let lenis;
if (typeof window.Lenis !== 'undefined') {
  try {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      mouseMultiplier: 1.0,
      smoothTouch: false,
      infinite: false,
    });

    lenis.on('scroll', () => {
      if (window.ScrollTrigger) window.ScrollTrigger.update();
    });

    window.gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    window.gsap.ticker.lagSmoothing(0);
  } catch (error) {
    console.error("Lenis smooth scroll failed to initialize:", error);
  }
}

// ── 3. Upgraded GSAP Animations ──
if (hasAnimations) {
  try {
    window.gsap.registerPlugin(window.ScrollTrigger);

    const snapEase = "power4.out";
    const springEase = "back.out(1.4)";

    // ── Scroll Progress Bar ──
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
      }, { passive: true });
    }

    // ── Hero Section Entrance Animation ──
    const heroTl = window.gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } });

    // Fade in body and reveal hero elements in order
    heroTl.to("body", { opacity: 1, duration: 0.2 }) // ensure body is fully visible
          .to(".hero .reveal-inner", {
            y: "0%",
            stagger: 0.12,
            duration: 1.2,
            ease: "expo.out"
          }, 0.1)
          .to(".hero .fade-up", {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 1.0,
            ease: "back.out(1.2)"
          }, "-=0.8")
          .fromTo(".nav",
            { y: -40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
            "-=0.8"
          );

    // ── Generic Scroll Reveal (for elements with .animate-in class) ──
    // These are single blocks like about content, about visual, contact form, project cards, etc.
    window.gsap.utils.toArray(".animate-in").forEach((element) => {
      window.gsap.to(element, {
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out"
      });
    });

    // ── Section Headers Stagger Reveal ──
    window.gsap.utils.toArray(".section-header").forEach((header) => {
      const tag = header.querySelector('.section-header__tag');
      const title = header.querySelector('.section-header__title');
      const revealInner = header.querySelector('.reveal-inner');
      
      const headerTl = window.gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      if (tag) {
        headerTl.fromTo(tag, 
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
      }

      if (revealInner) {
        headerTl.to(revealInner, {
          y: "0%",
          duration: 0.8,
          ease: "power3.out"
        }, "-=0.4");
      } else if (title) {
        headerTl.fromTo(title,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.4"
        );
      }
    });

    // ── Parallax Effect for Project Images ──
    window.gsap.utils.toArray('.project-card__image-wrapper img').forEach(img => {
      window.gsap.to(img, {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: img.parentNode,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    // ── Bento Grid Stagger Reveal ──
    const bentoGrid = document.querySelector('.bento-grid');
    if (bentoGrid) {
      window.gsap.fromTo(bentoGrid.querySelectorAll('.bento-item'), 
        { y: 50, opacity: 0, scale: 0.96 },
        {
          scrollTrigger: {
            trigger: bentoGrid,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        }
      );
    }

    // ── Stats Reveal & Counters ──
    const statsSection = document.querySelector('.about__stats');
    if (statsSection) {
      const stats = statsSection.querySelectorAll('.about__stat');
      const counters = statsSection.querySelectorAll('.about__stat-number');
      
      const statsTl = window.gsap.timeline({
        scrollTrigger: {
          trigger: statsSection,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      statsTl.fromTo(stats,
        { y: 40, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: "back.out(1.2)" }
      );

      counters.forEach((counter) => {
        const target = parseInt(counter.dataset.count) || 0;
        const obj = { val: 0 };
        statsTl.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => { counter.textContent = Math.floor(obj.val); },
          onComplete: () => { counter.textContent = target; }
        }, 0.2); // Start count-up slightly after entrance animation begins
      });
    }

    // ── About Signature Line Animation ──
    const sigLine = document.querySelector('.about__signature-line');
    if (sigLine) {
      window.gsap.fromTo(sigLine,
        { scaleX: 0 },
        {
          scrollTrigger: {
            trigger: sigLine,
            start: "top 90%",
            toggleActions: "play none none reverse"
          },
          scaleX: 1,
          transformOrigin: "left center",
          duration: 0.8,
          ease: snapEase
        }
      );
    }

    // ── Contact CTA Cards Stagger ──
    const contactCtas = document.querySelector('.contact__ctas');
    if (contactCtas) {
      window.gsap.fromTo(contactCtas.querySelectorAll('.contact__cta-card'),
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: contactCtas,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out"
        }
      );
    }

    // ── Social Icons Pop-In ──
    const socialsContainer = document.querySelector('.contact__socials');
    if (socialsContainer) {
      window.gsap.fromTo(socialsContainer.querySelectorAll('.contact__social'),
        { scale: 0, opacity: 0 },
        {
          scrollTrigger: {
            trigger: socialsContainer,
            start: "top 90%",
            toggleActions: "play none none reverse"
          },
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.8)"
        }
      );
    }

    // ── 3D Tilt Effect on Project Image Cards ──
    if (window.matchMedia('(pointer: fine)').matches) {
      document.querySelectorAll('.project-card__image-wrapper').forEach(wrapper => {
        wrapper.addEventListener('mousemove', (e) => {
          const rect = wrapper.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          // Smooth tilt rotation
          window.gsap.to(wrapper, {
            rotateY: x * 10,  // increased tilt angle slightly for visibility
            rotateX: -y * 10,
            scale: 1.02,
            duration: 0.4,
            ease: "power2.out",
            transformPerspective: 1000,
            transformOrigin: "center center"
          });

          // Move the image inside in opposite direction for 3D parallax depth
          const img = wrapper.querySelector('img');
          if (img) {
            window.gsap.to(img, {
              x: x * 20,
              y: y * 20,
              duration: 0.4,
              ease: "power2.out"
            });
          }
        });

        wrapper.addEventListener('mouseleave', () => {
          window.gsap.to(wrapper, {
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.7,
            ease: "elastic.out(1.0, 0.5)"
          });

          const img = wrapper.querySelector('img');
          if (img) {
            window.gsap.to(img, {
              x: 0,
              y: 0,
              duration: 0.7,
              ease: "elastic.out(1.0, 0.5)"
            });
          }
        });
      });
    }

    // ── Interactive Cursor Glow on Hero ──
    const hero = document.querySelector('.hero');
    if (hero && window.matchMedia('(pointer: fine)').matches) {
      const glow = document.createElement('div');
      glow.style.cssText = `
        position: absolute; width: 450px; height: 450px; border-radius: 50%;
        background: radial-gradient(circle, rgba(232, 114, 58, 0.05) 0%, transparent 70%);
        pointer-events: none; z-index: 1;
        top: 0; left: 0; transform: translate(-50%, -50%);
      `;
      hero.appendChild(glow);

      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        window.gsap.to(glow, {
          left: (e.clientX - rect.left),
          top: (e.clientY - rect.top),
          duration: 0.5,
          ease: "power2.out"
        });
      });
    }

    // ── Magnetic Buttons (improved elastic effect) ──
    if (window.matchMedia('(pointer: fine)').matches) {
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          window.gsap.to(btn, {
            x: x * 0.22,
            y: y * 0.22,
            duration: 0.3,
            ease: "power2.out"
          });
        });
        btn.addEventListener('mouseleave', () => {
          window.gsap.to(btn, {
            x: 0, y: 0,
            duration: 0.6,
            ease: "elastic.out(1.1, 0.4)"
          });
        });
      });
    }

  } catch (gsapError) {
    console.error("GSAP execution error, disabling animations class:", gsapError);
    document.documentElement.classList.remove('animations-enabled');
  }
}

// ── 4. UI Interactions (Independent of GSAP/Lenis loading state) ──

// Sticky Navigation
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  }, { passive: true });
}

// Mobile Hamburger Navigation
const hamburger = document.getElementById('nav-hamburger');
const navLinks = document.getElementById('nav-links');
const navOverlay = document.getElementById('nav-overlay');

if (hamburger && navLinks && navOverlay) {
  const toggleMenu = () => {
    hamburger.classList.toggle('is-active');
    navLinks.classList.toggle('is-active');
    navOverlay.classList.toggle('is-active');
    if (navLinks.classList.contains('is-active')) {
      if (lenis) lenis.stop();
    } else {
      if (lenis) lenis.start();
    }
  };

  hamburger.addEventListener('click', toggleMenu);
  navOverlay.addEventListener('click', toggleMenu);

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-active');
      navLinks.classList.remove('is-active');
      navOverlay.classList.remove('is-active');
      if (lenis) lenis.start();
    });
  });
}

// Project Details Accordion Toggle
document.querySelectorAll('.project-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = document.getElementById(btn.dataset.project);
    if (card) {
      card.classList.toggle('is-expanded');
    }
    // Safely refresh GSAP ScrollTrigger after transition completes
    setTimeout(() => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, 550);
  });
});

// Marquee Hover Pause/Resume
const marqueeTrack = document.querySelector('.marquee__track');
const marquee = document.querySelector('.marquee');
if (marquee && marqueeTrack) {
  marquee.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marquee.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

// Contact Form submission
const form = document.getElementById('contactForm');
const status = document.getElementById('form-status');
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdavzblp';

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const type = document.getElementById('contact-type').value;
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !type || !message) {
      status.className = 'contact__form-status error';
      status.textContent = 'Please fill in all fields.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.className = 'contact__form-status error';
      status.textContent = 'Please enter a valid email address.';
      return;
    }

    const btn = document.getElementById('contact-submit');
    btn.disabled = true;
    btn.innerHTML = '<span>Sending...</span>';
    status.className = '';
    status.textContent = '';

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (response.ok) {
        status.className = 'contact__form-status success';
        status.textContent = '✓ Message sent! I\'ll get back to you shortly.';
        form.reset();
        
        // Stagger/pop in form status message
        if (window.gsap) {
          window.gsap.from(status, { scale: 0.9, opacity: 0, duration: 0.5, ease: "back.out(1.5)" });
        }
      } else {
        const data = await response.json();
        throw new Error(data?.errors?.[0]?.message || 'Submission failed');
      }
    } catch (err) {
      status.className = 'contact__form-status error';
      status.textContent = '✗ Something went wrong. Please email me directly.';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>Send Message</span><i class="ph ph-paper-plane-tilt"></i>';
    }
  });
}
