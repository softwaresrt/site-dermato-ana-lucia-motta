/* Dra. Ana Lúcia Motta — Dermatologia Clínica e Estética */
(() => {
'use strict';
const WA = '552196657080';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const waUrl = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Minimalist Preloader
const loader = $('#loader');
const finishLoading = () => loader?.classList.add('done');
if (document.readyState === 'complete') setTimeout(finishLoading, reducedMotion ? 0 : 500);
else window.addEventListener('load', () => setTimeout(finishLoading, reducedMotion ? 0 : 500), {once:true});
setTimeout(finishLoading, 1800);

$('#year').textContent = String(new Date().getFullYear());
$$('[data-wa]').forEach(a => a.href = waUrl(a.dataset.wa));

// Navigation & Scroll progress
const header = $('#header');
const progress = $('#scroll-progress');
const menuToggle = $('#menu-toggle');
const mobileMenu = $('#mobile-menu');

menuToggle.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('no-scroll', open);
  const spans = $$('span', menuToggle);
  spans[0].style.transform = open ? 'translateY(3.5px) rotate(45deg)' : '';
  spans[1].style.transform = open ? 'translateY(-3.5px) rotate(-45deg)' : '';
});

$$('a', mobileMenu).forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
  $$('span', menuToggle).forEach(s => s.style.transform = '');
}));

let scrollQueued = false;
const scrollState = () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 30);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  scrollQueued = false;
};
window.addEventListener('scroll', () => {
  if (!scrollQueued) {
    requestAnimationFrame(scrollState);
    scrollQueued = true;
  }
}, {passive: true});
scrollState();

// Reveal animations
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }), {threshold: .07, rootMargin: '0px 0px -25px 0px'});
  $$('.reveal').forEach(el => observer.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('visible'));
}
if (reducedMotion) $$('.reveal').forEach(el => el.classList.add('visible'));

// Portrait parallax subtle effect
const heroMedia = $('#hero-media');
if (!reducedMotion && matchMedia('(pointer:fine)').matches && heroMedia) {
  heroMedia.addEventListener('pointermove', e => {
    const r = heroMedia.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - .5;
    const ny = (e.clientY - r.top) / r.height - .5;
    const arc = $('.arc-one', heroMedia);
    const seal = $('.floating-seal', heroMedia);
    if (arc) arc.style.translate = `${nx * 13}px ${ny * 10}px`;
    if (seal) seal.style.translate = `${-nx * 11}px ${-ny * 9}px`;
  });
}

// Subtle interactive background particles in the Hero
function initHeroBgParticles() {
  const canvas = $('#hero-bg-canvas');
  const hero = $('#inicio');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0, height = 0;
  let mouse = { x: -1000, y: -1000, active: false };
  const particleCount = window.innerWidth < 768 ? 36 : 64;
  const particles = [];

  const resize = () => {
    const r = hero.getBoundingClientRect();
    width = r.width;
    height = r.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
  };
  resize();
  window.addEventListener('resize', resize);

  // Colors: delicate champagne, soft warm rose, subtle pearl gold
  const tones = [
    'rgba(188, 136, 123, ',
    'rgba(169, 109, 89, ',
    'rgba(215, 173, 150, ',
    'rgba(195, 160, 140, '
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      baseRadius: Math.random() * 2 + 1,
      color: tones[Math.floor(Math.random() * tones.length)],
      alpha: Math.random() * 0.45 + 0.25,
      pulse: Math.random() * Math.PI * 2
    });
  }

  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  hero.addEventListener('pointerleave', () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  let heroVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      heroVisible = entries[0]?.isIntersecting ?? true;
    }).observe(hero);
  }

  function loop() {
    if (!heroVisible) {
      if (!reducedMotion) requestAnimationFrame(loop);
      return;
    }
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;

      // Wrap around edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Mouse gentle interaction
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 130;
        if (dist < maxDist && dist > 0) {
          const force = (maxDist - dist) / maxDist;
          p.x += (dx / dist) * force * 1.8;
          p.y += (dy / dist) * force * 1.8;
        }
      }

      // Draw subtle luminous particle
      const radius = p.baseRadius + Math.sin(p.pulse) * 0.6;
      const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.12;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.6, radius), 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${Math.max(0.1, currentAlpha)})`;
      ctx.fill();
    }

    // Connect very close particles subtly
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 75) {
          const lineAlpha = (1 - dist / 75) * 0.16;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(188, 136, 123, ${lineAlpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    if (!reducedMotion) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
try { initHeroBgParticles(); } catch (e) { console.warn('Partículas de fundo:', e); }

// Treatment Modal
const treatmentData = {
  pele: {
    eyebrow: 'DERMATOLOGIA CLÍNICA',
    title: 'Saúde da pele',
    paragraphs: [
      'A pele merece um olhar clínico atento, desde dúvidas do cotidiano até sinais que precisam de investigação.',
      'A avaliação dermatológica permite investigar sintomas, orientar hábitos e definir uma conduta individualizada.'
    ],
    topics: [
      'Avaliação de alterações e queixas da pele',
      'Orientação de prevenção e proteção solar',
      'Acompanhamento clínico conforme necessidade'
    ]
  },
  facial: {
    eyebrow: 'DERMATOLOGIA ESTÉTICA',
    title: 'Beleza com naturalidade',
    paragraphs: [
      'O cuidado estético começa com uma conversa sobre sua pele, seus desejos e as possibilidades adequadas ao seu caso.',
      'Procedimentos, técnicas, indicações, duração e recuperação são explicados pela médica após a avaliação.'
    ],
    topics: [
      'Avaliação de textura e qualidade da pele',
      'Conversa sobre linhas e mudanças naturais',
      'Expectativas e escolhas conscientes'
    ]
  },
  prevencao: {
    eyebrow: 'PREVENÇÃO',
    title: 'Olhar atento aos sinais',
    paragraphs: [
      'A detecção precoce de alterações cutâneas é uma parte importante da dermatologia. Algumas manchas ou sinais precisam de avaliação profissional.',
      'Uma consulta ajuda a esclarecer quais mudanças merecem acompanhamento e quais medidas preventivas são indicadas.'
    ],
    topics: [
      'Avaliação de sinais e pintas',
      'Prevenção do câncer de pele',
      'Orientações sobre sinais de alerta'
    ]
  },
  rotina: {
    eyebrow: 'ROTINA DE CUIDADOS',
    title: 'O cuidado em cada fase',
    paragraphs: [
      'Produtos e rotinas não precisam ser complexos para serem relevantes. O mais importante é a adequação às características individuais.',
      'Na consulta, são considerados histórico, objetivos, rotina e saúde da pele para orientar um plano de cuidados.'
    ],
    topics: [
      'Limpeza e hidratação compatíveis com a pele',
      'Fotoproteção',
      'Acompanhamento e ajustes ao longo do tempo'
    ]
  }
};

const backdrop = $('#modal-backdrop');
const modalTitle = $('#modal-title');
const modalBody = $('#modal-body');
const modalEyebrow = $('#modal-eyebrow');
const modalCta = $('#modal-cta');
let lastFocused = null;

function openModal({eyebrow, title, paragraphs = [], topics = [], privacy = false}) {
  lastFocused = document.activeElement;
  modalEyebrow.textContent = eyebrow;
  modalTitle.textContent = title;
  modalBody.replaceChildren();
  paragraphs.forEach(p => {
    const el = document.createElement('p');
    el.textContent = p;
    modalBody.appendChild(el);
  });
  if (topics.length) {
    const list = document.createElement('ul');
    topics.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      list.appendChild(li);
    });
    modalBody.appendChild(list);
  }
  modalCta.style.display = privacy ? 'none' : 'inline-flex';
  modalCta.href = waUrl(`Olá! Gostaria de agendar uma avaliação com a Dra. Ana Lúcia Motta. Tenho interesse em ${title.toLowerCase()}.`);
  backdrop.hidden = false;
  document.body.classList.add('no-scroll');
  $('#modal-close').focus();
}

function closeModal() {
  backdrop.hidden = true;
  document.body.classList.remove('no-scroll');
  lastFocused?.focus();
}

$$('.treatment-item').forEach(el => el.addEventListener('click', () => openModal(treatmentData[el.dataset.treatment])));

$$('.filter').forEach(b => b.addEventListener('click', () => {
  $$('.filter').forEach(x => x.classList.toggle('active', x === b));
  const tag = b.dataset.filter;
  $$('.treatment-item').forEach(el => el.classList.toggle('filtered-out', tag !== 'todos' && !el.dataset.category.split(' ').includes(tag)));
}));

$('#modal-close').addEventListener('click', closeModal);
backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !backdrop.hidden) closeModal();
  if (e.key === 'Tab' && !backdrop.hidden) {
    const items = $$('button,a,input,select,textarea', backdrop).filter(x => x.offsetParent !== null);
    const first = items[0], last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

$('#privacy-open').addEventListener('click', () => openModal({
  eyebrow: 'TRANSPARÊNCIA',
  title: 'Privacidade e ética',
  privacy: true,
  paragraphs: [
    'Este site é uma apresentação informativa dos serviços médicos. Não realiza diagnóstico remoto ou recomendação automática de tratamentos.',
    'As informações inseridas no formulário e no questionário não são enviadas nem armazenadas em servidores do site. Se você escolher continuar pelo WhatsApp, será direcionado ao serviço externo com uma mensagem preparada. Evite compartilhar dados médicos sensíveis antes de receber orientações adequadas.',
    'As fotografias de apresentação são ilustrações clínicas e institucionais. Não são exibidas fotos de antes e depois com promessas de resultados individuais.',
    'O uso de provedores externos, como o Instagram, o WhatsApp e as fontes do Google, está sujeito às políticas desses serviços.',
    'Informações profissionais: Dra. Ana Lúcia Motta · CRM-RJ 5291852-0 · RQE 28041.'
  ]
}));

// Real photographic comparison slider
const compareSlider = $('#compare-slider');
const compareStage = $('#compare-stage');
function setCompare(value) {
  const v = clamp(Number(value), 5, 95);
  const rightEl = $('#compare-right');
  const dividerEl = $('#compare-divider');
  if (rightEl) rightEl.style.clipPath = `inset(0 0 0 ${v}%)`;
  if (dividerEl) dividerEl.style.left = `${v}%`;
  if (compareSlider) compareSlider.value = String(v);
}
if (compareSlider && compareStage) {
  compareSlider.addEventListener('input', e => setCompare(e.target.value));
  setCompare(50);
  let comparing = false;
  const comparePointer = e => {
    const r = compareStage.getBoundingClientRect();
    setCompare(((e.clientX - r.left) / r.width) * 100);
  };
  compareStage.addEventListener('pointerdown', e => {
    comparing = true;
    compareStage.setPointerCapture(e.pointerId);
    comparePointer(e);
  });
  compareStage.addEventListener('pointermove', e => { if (comparing) comparePointer(e); });
  compareStage.addEventListener('pointerup', () => { comparing = false; });
  compareStage.addEventListener('pointercancel', () => { comparing = false; });
}

// Five-step educational pre-consultation quiz
const quizSteps = [
  {question: 'O que mais gostaria de conversar?', options: ['Saúde da minha pele', 'Cuidados estéticos', 'Prevenção de sinais', 'Rotina e produtos'], helper: 'Não existe resposta certa. Escolha o tema que faz sentido hoje.'},
  {question: 'Qual região merece atenção?', options: ['Rosto', 'Olhos ou lábios', 'Pescoço e colo', 'Pele em geral'], helper: 'A seleção apenas organiza sua conversa com a médica.'},
  {question: 'Como está sua rotina atual?', options: ['Tenho uma rotina definida', 'Quero simplificar meus cuidados', 'Ainda estou começando', 'Prefiro contar na consulta'], helper: 'Não é necessário informar produtos ou histórico clínico aqui.'},
  {question: 'Qual abordagem prefere discutir?', options: ['Cuidados cotidianos', 'Possibilidades estéticas', 'Prevenção e acompanhamento', 'Quero ouvir a orientação médica'], helper: 'A indicação de qualquer procedimento é feita somente em consulta.'},
  {question: 'Quando gostaria de agendar?', options: ['O quanto antes', 'Nas próximas semanas', 'Sem urgência', 'Quero tirar dúvidas primeiro'], helper: 'A equipe confirmará a disponibilidade real de agenda.'}
];
let quizStep = 0, answers = Array(5).fill(null), quizDone = false;
const quizContent = $('#quiz-content');
const quizNext = $('#quiz-next');
const quizBack = $('#quiz-back');

function renderQuiz() {
  if (!quizContent) return;
  const stepLabel = $('#quiz-step-label');
  const percentEl = $('#quiz-percent');
  const barEl = $('#quiz-bar');
  if (stepLabel) stepLabel.textContent = String(quizStep + 1).padStart(2, '0');
  if (percentEl) percentEl.textContent = Math.round(((quizStep + 1) / 5) * 100) + '%';
  if (barEl) barEl.style.width = (((quizStep + 1) / 5) * 100) + '%';
  if (quizBack) quizBack.disabled = quizStep === 0 && !quizDone;

  const orb = $('#quiz-orb');
  if (orb) orb.style.borderRadius = ['42% 58% 54% 46%', '52% 48% 44% 56%', '60% 40% 51% 49%', '37% 63% 48% 52%', '50% 50% 44% 56%'][quizStep];

  if (quizDone) {
    quizContent.innerHTML = `<span class="section-index">SEU RESUMO</span><h3 class="quiz-question">Um bom começo para<br/><em>sua consulta.</em></h3><p class="quiz-result">Esses são os temas que você escolheu para conversar:</p><div class="quiz-result"><ul>${answers.map((a, i) => `<li>${escapeHtml(quizSteps[i].options[a])}</li>`).join('')}</ul><strong>Importante:</strong> Isto não é diagnóstico nem prescrição. A avaliação e as indicações são definidas exclusivamente pela dermatologista.</div>`;
    quizNext.disabled = false;
    quizNext.innerHTML = 'Enviar resumo pelo WhatsApp <svg><use href="#i-diag"/></svg>';
    quizBack.textContent = '← Rever escolhas';
    return;
  }
  const step = quizSteps[quizStep];
  quizContent.innerHTML = `<h3 class="quiz-question">${step.question}</h3><div class="quiz-options">${step.options.map((o, i) => `<button class="quiz-option ${answers[quizStep] === i ? 'selected' : ''}" data-index="${i}" type="button">${escapeHtml(o)}</button>`).join('')}</div><p class="quiz-helper">${step.helper}</p>`;
  $$('.quiz-option', quizContent).forEach(b => b.addEventListener('click', () => {
    answers[quizStep] = Number(b.dataset.index);
    $$('.quiz-option', quizContent).forEach(x => x.classList.toggle('selected', x === b));
    quizNext.disabled = false;
  }));
  quizNext.disabled = answers[quizStep] === null;
  quizNext.innerHTML = `${quizStep === 4 ? 'Ver meu resumo' : 'Continuar'} <svg><use href="#i-arrow"/></svg>`;
  quizBack.textContent = '← Voltar';
}

function escapeHtml(x) {
  return String(x).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
}

if (quizNext && quizBack) {
  quizNext.addEventListener('click', () => {
    if (quizDone) {
      const summary = quizSteps.map((s, i) => `${i + 1}. ${s.question}\n${s.options[answers[i]]}`).join('\n\n');
      const msg = `Olá! Gostaria de agendar uma avaliação com a Dra. Ana Lúcia Motta. Organizei estes assuntos para conversar em consulta:\n\n${summary}\n\nEntendo que este resumo não representa diagnóstico nem indicação de tratamentos.`;
      window.open(waUrl(msg), '_blank', 'noopener,noreferrer');
      return;
    }
    if (answers[quizStep] === null) return;
    if (quizStep === 4) quizDone = true;
    else quizStep++;
    renderQuiz();
  });
  quizBack.addEventListener('click', () => {
    if (quizDone) quizDone = false;
    else quizStep = Math.max(0, quizStep - 1);
    renderQuiz();
  });
  renderQuiz();
}

// Contact Form
const contactForm = $('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#contact-name').value.trim();
    const interest = $('#contact-interest').value;
    const extra = $('#contact-message').value.trim();
    if (!name || !interest) {
      e.target.reportValidity();
      return;
    }
    let text = `Olá! Meu nome é ${name}. Gostaria de agendar uma avaliação com a Dra. Ana Lúcia Motta.\n\nAssunto: ${interest}.`;
    if (extra) text += `\nObservação: ${extra}`;
    text += '\n\nPodem me informar os horários disponíveis?';
    window.open(waUrl(text), '_blank', 'noopener,noreferrer');
  });
}
})();
