// Smooth scroll
function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  const offset = 72;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

// Burger menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && navLinks.classList.contains('open')) {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// Navbar shadow on scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.style.boxShadow = window.scrollY > 10
    ? '0 4px 24px rgba(13,37,80,0.13)'
    : '0 2px 12px rgba(13,37,80,0.07)';
}, { passive: true });

// Form submit
const ctaForm = document.getElementById('ctaForm');
const formMsg = document.getElementById('formMessage');
const nameInput = document.getElementById('nameInput');
const phoneInput = document.getElementById('phoneInput');
const serviceInput = document.getElementById('service');
const websiteInput = document.getElementById('websiteInput');
const formStartedAt = document.getElementById('formStartedAt');
const servicePicker = document.getElementById('servicePicker');
const serviceSearch = document.getElementById('serviceSearch');
const serviceDropdown = document.getElementById('serviceDropdown');
const serviceOptions = Array.from(document.querySelectorAll('.service-option'));
const serviceEmpty = document.getElementById('serviceEmpty');

if (formStartedAt) {
  formStartedAt.value = String(Date.now());
}

function normalizeSearch(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function openServiceDropdown() {
  servicePicker?.classList.add('open');
}

function closeServiceDropdown() {
  servicePicker?.classList.remove('open');
}

function filterServices(query) {
  const normalizedQuery = normalizeSearch(query);
  let visibleCount = 0;

  serviceOptions.forEach(option => {
    const text = normalizeSearch(option.textContent || '');
    const isVisible = !normalizedQuery || text.includes(normalizedQuery);
    option.classList.toggle('hidden', !isVisible);
    if (isVisible) visibleCount += 1;
  });

  serviceEmpty?.classList.toggle('visible', visibleCount === 0);
}

function setService(value) {
  if (serviceInput) serviceInput.value = value;
  if (serviceSearch) serviceSearch.value = value;
  servicePicker?.classList.remove('error');
}

if (servicePicker && serviceSearch && serviceDropdown && serviceInput) {
  serviceSearch.addEventListener('focus', () => {
    filterServices(serviceSearch.value);
    openServiceDropdown();
  });

  serviceSearch.addEventListener('input', () => {
    serviceInput.value = '';
    servicePicker.classList.remove('error');
    filterServices(serviceSearch.value);
    openServiceDropdown();
  });

  serviceOptions.forEach(option => {
    option.addEventListener('click', () => {
      setService(option.dataset.value || option.textContent.trim());
      closeServiceDropdown();
    });
  });

  document.addEventListener('click', (event) => {
    if (!servicePicker.contains(event.target)) {
      closeServiceDropdown();
    }
  });

  serviceSearch.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeServiceDropdown();
      serviceSearch.blur();
    }
  });
}

if (ctaForm && formMsg && nameInput && phoneInput && serviceInput) {
  ctaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const service = serviceInput.value.trim();

    let valid = true;
    [nameInput, phoneInput, serviceSearch].forEach(el => el?.classList.remove('error'));
    servicePicker?.classList.remove('error');

    if (!name) {
      nameInput.classList.add('error');
      valid = false;
    }

    if (!phone || phone.length < 7) {
      phoneInput.classList.add('error');
      valid = false;
    }

    const phoneDigits = phone.replace(/\D+/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      phoneInput.classList.add('error');
      valid = false;
    }

    if (!service) {
      serviceSearch?.classList.add('error');
      servicePicker?.classList.add('error');
      valid = false;
    }

    if (!valid) {
      showMessage('Пожалуйста, заполните все поля.', 'error');
      return;
    }

    const btn = ctaForm.querySelector('.btn-cta');
    btn.disabled = true;
    btn.textContent = 'Отправляем...';

    try {
      const res = await fetch('backend/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          service,
          website: websiteInput?.value || '',
          form_started_at: Number(formStartedAt?.value || 0)
        })
      });

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();

      if (data.success) {
        showMessage('Заявка принята! Мы свяжемся с вами в ближайшее время.', 'success');
        ctaForm.reset();
        serviceInput.value = '';
        if (serviceSearch) serviceSearch.value = '';
        if (formStartedAt) formStartedAt.value = String(Date.now());
      } else {
        showMessage(data.message || 'Произошла ошибка. Попробуйте ещё раз.', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Ошибка соединения с сервером. Попробуйте позже.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Записаться';
    }
  });
}

function showMessage(text, type) {
  if (!formMsg) return;

  formMsg.textContent = text;
  formMsg.className = 'form-message ' + type;
  setTimeout(() => {
    formMsg.textContent = '';
    formMsg.className = 'form-message';
  }, 6000);
}

// Fade-in on scroll
const fadeEls = document.querySelectorAll(
  '.service-card, .content-block'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeUp .5s ease both';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

function selectService(serviceName) {
  setService(serviceName);

  document.querySelector('#cta')?.scrollIntoView({
    behavior: 'smooth'
  });
}
