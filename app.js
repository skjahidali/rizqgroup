/**
 * RIZQ ONE — Standalone App Logic
 * 
 * 
 * 
 * 
 * Handles: scroll reveal, 3D tilt cards, mobile menu, service rendering,
 * audience toggle, form submission to Supabase, scroll-to-top.
 */

// --- Config ---
const SUPABASE_URL = 'https://vpicgenwfsaxsxnvojjj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaWNnZW53ZnNheHN4bnZvampqIiwicm9sISI6ImFub24iLCJpYXQiOjE3ODc4NjgxMTMsImV4cCI6MjEwMzQ0NDExM30.UNUuNvVc5CWLMu0bCTVNn1X3nWl6PvUqLufimjajJgg';

// --- Data ---
const B2B_SERVICES = [
  { icon: 'briefcase', title: 'Business Consulting', desc: 'Strategic guidance to streamline operations, improve margins, and plan sustainable growth.' },
  { icon: 'rocket', title: 'Startup & MSME Support', desc: 'Registration, compliance, funding readiness and operational setup for new ventures.' },
  { icon: 'monitor', title: 'IT Consulting', desc: 'Technology stack advisory, digital transformation roadmaps and IT infrastructure planning.' },
  { icon: 'globe', title: 'Website & Software Development', desc: 'Custom websites, web apps and software built to your exact business requirements.' },
  { icon: 'shopping', title: 'App Development', desc: 'Mobile applications for iOS and Android with modern, responsive user experiences.' },
  { icon: 'megaphone', title: 'Digital Marketing', desc: 'SEO, social media, paid campaigns and content strategy that drives measurable results.' },
  { icon: 'globe', title: 'Import & Export', desc: 'Documentation, trade compliance and market access support for cross-border commerce.' },
  { icon: 'headset', title: 'Business Support', desc: 'Ongoing operational, administrative and back-office support to keep you running.' },
];

const B2C_SERVICES = [
  { icon: 'cap', title: 'Skill Development', desc: 'Hands-on training to build job-ready skills in technology, business and trade.' },
  { icon: 'trophy', title: 'Professional Training', desc: 'Industry-aligned programs that sharpen expertise and accelerate careers.' },
  { icon: 'compass', title: 'Career Guidance', desc: 'Personalized direction to help you choose the right path and grow with purpose.' },
  { icon: 'book', title: 'Education & Training', desc: 'Structured learning across business, technology and entrepreneurship topics.' },
  { icon: 'laptop', title: 'Technology Support', desc: 'Practical help with tools, platforms and digital skills for everyday work.' },
  { icon: 'bulb', title: 'Business / Entrepreneurship Guidance', desc: 'Turn your idea into a real venture with step-by-step startup mentoring.' },
];

const B2B_LINKS = [
  'Business Consulting', 'Startup & MSME Support', 'IT Consulting',
  'Website & Software Development', 'App Development', 'Digital Marketing',
  'Import & Export', 'Business Support',
];

const B2C_LINKS = [
  'Skill Development', 'Professional Training', 'Career Guidance',
  'Education & Training', 'Technology Support', 'Business / Entrepreneurship Guidance',
];

const REGIONS = [
  { name: 'India', tag: 'Headquarters', desc: 'Primary operations, business consulting, technology delivery and training programs.', gradient: 'linear-gradient(135deg, #34d399, #0d9488)' },
  { name: 'Bangladesh', tag: 'Regional Presence', desc: 'Business support and trade facilitation for cross-border opportunities.', gradient: 'linear-gradient(135deg, #2dd4bf, #0d9488)' },
  { name: 'Europe', tag: 'Trade Network', desc: 'Import-export coordination and market access across European markets.', gradient: 'linear-gradient(135deg, #7a8a9d, #3e4a5a)' },
  { name: 'Dubai', tag: 'Trade Network', desc: 'Gulf trade corridor support for businesses expanding into the UAE and beyond.', gradient: 'linear-gradient(135deg, #fbbf24, #d97706)' },
];

// --- SVG icons ---
const ICONS = {
  briefcase: '<path d="M3 21h18M3 7l9-4 9 4M5 21V11M19 21V11M9 21v-6h6v6"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.16 5-1 5-1"/><path d="M12 15v5s3.03-.55 4-2c1.16-1.62 1-5 1-5"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  shopping: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  megaphone: '<path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  headset: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  cap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  laptop: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="21" x2="22" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/>',
  bulb: '<line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A3.64 3.64 0 0 1 8.91 14"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
};

function svg(name, size = 24) {
  const path = ICONS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

// --- Render service cards ---
function renderServices() {
  const b2bGrid = document.getElementById('b2b-grid');
  const b2cGrid = document.getElementById('b2c-grid');

  b2bGrid.innerHTML = B2B_SERVICES.map((s, i) => `
    <div class="service-card b2b reveal" data-tilt style="transition-delay:${(i % 4) * 60}ms">
      <div class="service-card-glow" style="background:rgba(52,211,153,0.15)"></div>
      <span class="service-card-icon">${svg(s.icon)}</span>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join('');

  b2cGrid.innerHTML = B2C_SERVICES.map((s, i) => `
    <div class="service-card b2c reveal" data-tilt style="transition-delay:${(i % 3) * 60}ms">
      <div class="service-card-glow" style="background:rgba(251,191,36,0.15)"></div>
      <span class="service-card-icon">${svg(s.icon)}</span>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join('');
}

// --- Render overview lists ---
function renderOverview() {
  document.getElementById('overview-b2b').innerHTML =
    B2B_LINKS.map(s => `<li>${s}</li>`).join('');
  document.getElementById('overview-b2c').innerHTML =
    B2C_LINKS.map(s => `<li>${s}</li>`).join('');
}

// --- Render regions ---
function renderRegions() {
  document.getElementById('regions-grid').innerHTML = REGIONS.map((r, i) => `
    <div class="region-card reveal" data-tilt style="transition-delay:${i * 70}ms">
      <div class="region-glow" style="background:rgba(52,211,153,0.15)"></div>
      <span class="region-icon" style="background:${r.gradient}">${svg('pin')}</span>
      <h3>${r.name}</h3>
      <span class="region-tag">${r.tag}</span>
      <p>${r.desc}</p>
    </div>
  `).join('');
}

// --- 3D Tilt effect ---
function initTilt() {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reducedMotion) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const max = el.classList.contains('about-card') ? 14 : 8;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * max;
      const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * max;
      el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
  });
}

// --- Scroll reveal ---
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach((el) => observer.observe(el));
}

// --- Mobile menu ---
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const menuClose = document.getElementById('menu-close');
  const menu = document.getElementById('mobile-menu');
  const links = menu.querySelectorAll('a');

  menuBtn.addEventListener('click', () => {
    menu.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });

  const closeMenu = () => {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  menuClose.addEventListener('click', closeMenu);

  links.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });
}

// --- Floating logo scrolled state ---
function initScrollState() {
  const logo = document.getElementById('floating-logo');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      logo.classList.add('scrolled');
    } else {
      logo.classList.remove('scrolled');
    }
  }, { passive: true });
}

// --- Scroll to top ---
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- Audience toggle + form ---
function initForm() {
  const toggle = document.getElementById('audience-toggle');
  const serviceSelect = document.getElementById('service-select');
  const form = document.getElementById('enquiry-form');
  const formCard = document.getElementById('form-card');
  const successDiv = document.getElementById('form-success');
  const errorDiv = document.getElementById('form-error');
  const submitBtn = document.getElementById('form-submit');
  const resetBtn = document.getElementById('success-reset');

  let audience = 'business';

  const businessServices = [...B2B_LINKS, 'Other'];
  const individualServices = [...B2C_LINKS, 'Other'];

  function updateServices() {
    const services = audience === 'business' ? businessServices : individualServices;
    serviceSelect.innerHTML = '<option value="">Select a service</option>' +
      services.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  toggle.querySelectorAll('.audience-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      toggle.querySelectorAll('.audience-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audience = btn.dataset.audience;
      updateServices();
    });
  });

  updateServices();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();
    const service = formData.get('service');
    const message = formData.get('message').trim();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Sending...';
    errorDiv.style.display = 'none';

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          audience,
          service: service || null,
          message,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Request failed (${response.status})`);
      }

      // Success
      form.style.display = 'none';
      successDiv.style.display = 'flex';
      form.reset();

      setTimeout(() => {
        form.style.display = '';
        successDiv.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Enquiry <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
      }, 6000);
    } catch (err) {
      errorDiv.textContent = err.message || 'Something went wrong. Please try again.';
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Enquiry <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
    }
  });

  resetBtn.addEventListener('click', () => {
    form.style.display = '';
    successDiv.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Enquiry <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  });
}

// --- Year ---
function setYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}

// --- Init ---
function init() {
  renderServices();
  renderOverview();
  renderRegions();
  initTilt();
  initReveal();
  initMobileMenu();
  initScrollState();
  initScrollTop();
  initForm();
  setYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
