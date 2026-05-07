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
}

// Accordion
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.closest('.accordion-item');
    if (!item) return;

    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));

    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

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

if (ctaForm && formMsg && nameInput && phoneInput && serviceInput) {
  ctaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const service = serviceInput.value.trim();

    let valid = true;
    [nameInput, phoneInput, serviceInput].forEach(el => el.classList.remove('error'));

    if (!name) {
      nameInput.classList.add('error');
      valid = false;
    }

    if (!phone || phone.length < 7) {
      phoneInput.classList.add('error');
      valid = false;
    }

    if (!service) {
      serviceInput.classList.add('error');
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
        body: JSON.stringify({ name, phone, service })
      });

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();

      if (data.success) {
        showMessage('Заявка принята! Мы свяжемся с вами в ближайшее время.', 'success');
        ctaForm.reset();
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
  '.service-card, .content-block, .hero-photo-card'
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
  const select = document.getElementById('service');
  if (select) select.value = serviceName;

  document.querySelector('#cta')?.scrollIntoView({
    behavior: 'smooth'
  });
}
