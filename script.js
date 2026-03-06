/* =========================================================
   SORRIFÁCIL ODONTOLOGIA — script.js
   Funcionalidades:
   1. Navbar: muda ao rolar + menu mobile
   2. Carrossel de depoimentos com touch
   3. Reveal ao scroll (Intersection Observer)
   4. Lightbox da galeria
   5. Botão WhatsApp flutuante
   6. Smooth scroll com offset do header
========================================================= */


/* =========================================================
   1. NAVBAR — muda aparência ao rolar
========================================================= */
const header    = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

// Adiciona classe 'scrolled' quando rolar mais de 60px
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);

  // Botão WhatsApp flutuante aparece após 400px
  const waBtn = document.querySelector('.wa-float');
  if (waBtn) {
    if (window.scrollY > 400) {
      waBtn.style.opacity   = '1';
      waBtn.style.transform = 'scale(1)';
    } else {
      waBtn.style.opacity   = '0';
      waBtn.style.transform = 'scale(.8)';
    }
  }
}, { passive: true });

// Abre e fecha o menu mobile
hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  const spans  = hamburger.querySelectorAll('span');

  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Fecha menu ao clicar em link
nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  });
});


/* =========================================================
   2. CARROSSEL DE DEPOIMENTOS
========================================================= */
const track    = document.getElementById('depTrack');
const cards    = track ? Array.from(track.querySelectorAll('.dep-card')) : [];
const prevBtn  = document.getElementById('depPrev');
const nextBtn  = document.getElementById('depNext');
const dotsWrap = document.getElementById('depDots');

let current  = 0;
let autoPlay;

// Cria os dots
if (dotsWrap && cards.length) {
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dep-dot';
    dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsWrap.appendChild(dot);
  });
}

// Atualiza dots
function updateDots() {
  if (!dotsWrap) return;
  dotsWrap.querySelectorAll('.dep-dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });
}

// Calcula quantos cards aparecem (1 no mobile, 2 no desktop)
const visible = () => window.innerWidth <= 768 ? 1 : 2;

// Navega para um índice específico
function goTo(index) {
  if (!track || !cards.length) return;
  const total   = cards.length;
  current       = ((index % total) + total) % total;
  const maxIdx  = total - visible();
  const safeIdx = Math.min(current, maxIdx);
  const w       = cards[0].offsetWidth + 24; // largura + gap
  track.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
  track.style.transform  = `translateX(-${safeIdx * w}px)`;
  updateDots();
}

// Botões prev/next
if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

// Auto-play a cada 5s
function startAuto() { autoPlay = setInterval(() => goTo(current + 1), 5000); }
function resetAuto()  { clearInterval(autoPlay); startAuto(); }

// Suporte a swipe (touch)
let touchStart = 0;
if (track) {
  track.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goTo(current + 1) : goTo(current - 1); resetAuto(); }
  });
}

// Inicia
if (cards.length) { updateDots(); startAuto(); }
window.addEventListener('resize', () => goTo(current));


/* =========================================================
   3. REVEAL AO SCROLL — elementos entram com animação
========================================================= */
const revealEls = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));


/* =========================================================
   4. LIGHTBOX DA GALERIA
========================================================= */
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

// Abre o lightbox com a imagem clicada
function openLightbox(el) {
  if (!lightbox || !lightboxImg) return;
  const img = el.querySelector('img');
  if (!img) return;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden'; // trava o scroll
}

// Fecha o lightbox
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

// Fecha com ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});


/* =========================================================
   5. SMOOTH SCROLL com offset do header fixo
========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id     = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 16;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});


/* =========================================================
   6. LINK ATIVO NA NAVBAR ao rolar
========================================================= */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link:not(.nav__cta)');

function updateActiveNav() {
  const pos = window.scrollY + header.offsetHeight + 80;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const bot = top + sec.offsetHeight;
    const id  = sec.getAttribute('id');
    if (pos >= top && pos < bot) {
      navLinks.forEach(l => l.style.color = '');
      const active = document.querySelector(`.nav__link[href="#${id}"]`);
      if (active && !active.classList.contains('nav__cta')) {
        active.style.color = header.classList.contains('scrolled') ? 'var(--teal)' : '#5ff0de';
      }
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });


/* =========================================================
   7. INICIALIZAÇÃO
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Estado inicial
  if (window.scrollY > 60)  header.classList.add('scrolled');
  updateActiveNav();
  console.log('🦷 SorriFácil — Script carregado!');
});
