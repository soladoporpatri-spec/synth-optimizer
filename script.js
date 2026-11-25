// --- Synth Optimizer 2.0 ---
// Skills: review-animations, performance-engineer, fixing-accessibility, baseline-ui

// --- Global Config ---
const WHATS_NUMBER = "5562994488816";
const DISCORD_LINK = "https://discord.gg/G9Kv8VXPEC";

// --- State & Performance ---
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 768px)").matches;
const isLowEnd = (navigator.deviceMemory && navigator.deviceMemory < 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
// Celular: sem WebGL, usa só o fundo em CSS (brilhos + grade).
// "Reduzir movimento" NÃO desliga o 3D: a cena fica estática (sem giro, flutuação ou ventoinhas).
const liteMode = isMobile;
let is3DEnabled = !liteMode;
if (liteMode) document.body.classList.add('bg-lite');

// --- Idioma da página (pt-BR, en, es): mensagens do WhatsApp e rótulos gerados por JS ---
const LANG = (document.documentElement.lang || 'pt-BR').slice(0, 2).toLowerCase();
const I18N = {
  pt: {
    generic: 'Olá! Quero saber mais sobre a otimização.',
    plan: (plan, price) => `Olá! Quero otimizar meu PC com o plano ${plan}${price}.`,
    labels: ["ESTABILIDADE + FPS", "INPUT LAG ZERADO", "SISTEMA RESPONSIVO", "MENOS DELAY", "1% LOW CRAVADO", "JOGO LISO"],
    zoom: (n) => `Ampliar resultado do cliente ${n}`,
    alt: (n) => `Print de resultado de otimização de PC gamer: cliente ${n}`
  },
  en: {
    generic: "Hi! I'd like to know more about the optimization.",
    plan: (plan, price) => `Hi! I want to optimize my PC with the ${plan} plan${price}.`,
    labels: ["STABILITY + FPS", "ZERO INPUT LAG", "RESPONSIVE SYSTEM", "LESS DELAY", "1% LOW LOCKED", "SMOOTH GAMEPLAY"],
    zoom: (n) => `Enlarge result from customer ${n}`,
    alt: (n) => `Gaming PC optimization result screenshot: customer ${n}`
  },
  es: {
    generic: '¡Hola! Quiero saber más sobre la optimización.',
    plan: (plan, price) => `¡Hola! Quiero optimizar mi PC con el plan ${plan}${price}.`,
    labels: ["ESTABILIDAD + FPS", "INPUT LAG CERO", "SISTEMA RESPONSIVO", "MENOS DELAY", "1% LOW CLAVADO", "JUEGO FLUIDO"],
    zoom: (n) => `Ampliar resultado del cliente ${n}`,
    alt: (n) => `Captura de resultado de optimización de PC gamer: cliente ${n}`
  }
};
const T = I18N[LANG] || I18N.pt;

// Raiz do site: '' na página em português e '../' em /en/ e /es/.
// Assim os caminhos funcionam tanto no site publicado quanto abrindo os arquivos direto no navegador.
const ROOT = document.documentElement.getAttribute('data-root') || '';

// Lembra o idioma escolhido no seletor (a página raiz respeita essa escolha na próxima visita)
document.querySelectorAll('.lang-switch a').forEach((a) => {
  a.addEventListener('click', () => {
    try { localStorage.setItem('synth_lang', a.getAttribute('hreflang')); } catch (e) { /* ignora */ }
  });
});
// Abrindo os arquivos direto (file://), links como "/en/" não existem: converte para caminhos relativos.
if (location.protocol === 'file:') {
  document.querySelectorAll('a[href^="/"]').forEach((a) => {
    const raw = a.getAttribute('href');
    if (raw.startsWith('//')) return;
    const parts = raw.split('#');
    let rel = parts[0].replace(/^\//, '');
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    a.setAttribute('href', ROOT + rel + (parts[1] ? '#' + parts[1] : ''));
  });
}

// --- Window Functions (for HTML onclick attributes) ---
window.openWhats = (plan = '', price = '') => {
  if (window.trackEvent) window.trackEvent('whatsapp_click', { plan: plan || 'geral', price: price || '' });
  const p = price ? ` (${price})` : "";
  const msg = plan ? T.plan(plan, p) : T.generic;
  window.open(`https://wa.me/${WHATS_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
};

window.openDiscord = () => {
  if (window.trackEvent) window.trackEvent('discord_click');
  window.open(DISCORD_LINK, "_blank", "noopener");
};

window.scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

// --- DOM Elements ---
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderStatus = document.getElementById('loader-status');

// --- Loader ---
let loadProgress = 0;
const loaderInterval = setInterval(() => {
  loadProgress += Math.random() * 34;
  if (loadProgress >= 100) loadProgress = 100;
  if (loaderBar) loaderBar.style.width = `${loadProgress}%`;
  
  if (loadProgress > 40 && loadProgress < 70 && loaderStatus) loaderStatus.innerText = (window.__synthLoader && window.__synthLoader.tune) || "TUNING SYSTEM...";
  if (loadProgress > 70 && loaderStatus) loaderStatus.innerText = (window.__synthLoader && window.__synthLoader.ready) || "SYSTEM READY";
  
  if (loadProgress === 100) {
    clearInterval(loaderInterval);
    setTimeout(() => {
      document.body.classList.remove('loading');
      if (loader) loader.classList.add('hidden');
      initScrollAnimations();
      initRevealObserver();
    }, 120);
  }
}, 70);

// --- Mobile Menu ---
const btnMenu = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (btnMenu && mobileMenu) {
  btnMenu.addEventListener('click', () => {
    const isActive = mobileMenu.classList.toggle('active');
    btnMenu.setAttribute('aria-expanded', isActive);
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      btnMenu.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- Navbar Scroll (performance-engineer: IntersectionObserver instead of scroll listener) ---
const navbar = document.querySelector('.navbar');
const heroSection = document.querySelector('.hero');

if (navbar && heroSection) {
  const navObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        navbar.classList.remove('scrolled');
      } else {
        navbar.classList.add('scrolled');
      }
    },
    { threshold: 0.1, rootMargin: '-60px 0px 0px 0px' }
  );
  navObserver.observe(heroSection);
}

// --- Scroll Reveal (review-animations: IntersectionObserver, not scroll events) ---
function initRevealObserver() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );
  
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// --- FAQ Accordion (fixing-accessibility: keyboard support) ---
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    toggleFaq(btn);
  });
  
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFaq(btn);
    }
  });
});

function toggleFaq(btn) {
  const parent = btn.parentElement;
  const answer = parent.querySelector('.faq-a');
  const isOpen = parent.classList.contains('active');
  
  // Close others
  document.querySelectorAll('.faq-item').forEach(item => {
    if (item !== parent) {
      item.classList.remove('active');
      const a = item.querySelector('.faq-a');
      if (a) a.style.maxHeight = null;
      const q = item.querySelector('.faq-q');
      if (q) q.setAttribute('aria-expanded', 'false');
    }
  });

  // Toggle current
  if (isOpen) {
    parent.classList.remove('active');
    answer.style.maxHeight = null;
    btn.setAttribute('aria-expanded', 'false');
  } else {
    parent.classList.add('active');
    answer.style.maxHeight = answer.scrollHeight + "px";
    btn.setAttribute('aria-expanded', 'true');
  }
}

// --- Wall of Results ---
const wallContainer = document.getElementById('wall-of-results');
if (wallContainer) {
  const fragments = [];
  const labels = T.labels;
  
  // Dimensões das miniaturas (evita salto de layout / CLS)
  const RESULT_DIMS = {1:[640,521],2:[640,385],3:[640,689],4:[640,414],5:[640,681],6:[640,241],7:[640,164],8:[640,203],9:[640,224],10:[640,286],11:[640,248],12:[640,138],13:[640,129],14:[640,147],15:[640,228],16:[640,181]};

  for (let i = 1; i <= 12; i++) {
    const randomLabel = labels[Math.floor(Math.random() * labels.length)];
    const [imgW, imgH] = RESULT_DIMS[i] || [640, 480];
    const html = `
      <div class="result-card reveal" role="button" tabindex="0" aria-label="${T.zoom(i)}" onclick="openLightbox('${ROOT}imagens/Cliente${i}.webp')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openLightbox('${ROOT}imagens/Cliente${i}.webp')}">
        <div class="result-img-wrapper">
           <img src="${ROOT}imagens/Cliente${i}-thumb.webp" width="${imgW}" height="${imgH}" alt="${T.alt(i)}" loading="lazy" decoding="async" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src='${ROOT}imagens/Cliente${i}.jpeg';}else{this.parentElement.parentElement.style.display='none'}">
        </div>
        <div class="result-hud">${randomLabel}</div>
      </div>
    `;
    fragments.push(html);
  }
  wallContainer.innerHTML = fragments.join('');
}

// --- Lightbox (fixing-accessibility: Escape key, backdrop click, focus trap) ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

window.openLightbox = (src) => {
  if (!lightbox || !lightboxImg) return;
  // Se o WebP não existir no servidor, usa o JPEG original
  lightboxImg.onerror = () => { lightboxImg.onerror = null; lightboxImg.src = src.replace('.webp', '.jpeg'); };
  lightboxImg.src = src;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  
  // Focus the close button
  const closeBtn = lightbox.querySelector('.lightbox-close');
  if (closeBtn) closeBtn.focus();
};

window.closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (lightbox && lightbox.classList.contains('active')) {
      window.closeLightbox();
    }
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      if (btnMenu) btnMenu.setAttribute('aria-expanded', 'false');
    }
  }
});

// Close lightbox on backdrop click
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      window.closeLightbox();
    }
  });
}


// --- GSAP Scroll Animations ---
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  // Counter animation
  const counter = document.getElementById('counter-clients');
  if (counter) {
    ScrollTrigger.create({
      trigger: counter,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          innerHTML: 1200,
          duration: 2.5,
          ease: "power2.out",
          snap: { innerHTML: 1 },
          onUpdate: function() {
            counter.innerHTML = Math.round(this.targets()[0].innerHTML) + "+";
          }
        });
      }
    });
  }

  // Pipeline Progress
  const pipeProgress = document.getElementById('pipe-progress');
  const pipeTrack = document.querySelector('.pipeline-track');
  if (pipeProgress && pipeTrack) {
    gsap.to(pipeProgress, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: ".pipeline-container",
        start: "top center",
        end: "bottom center",
        scrub: 0.8
      }
    });

    document.querySelectorAll('.pipe-step').forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 60%",
        onEnter: () => step.classList.add('active'),
        onLeaveBack: () => step.classList.remove('active')
      });
    });
  }
  
  // Tilt Cards (Desktop only, gated behind hover media query check)
  if (!isMobile && !prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = ((y - centerY) / centerY) * -4;
        const tiltY = ((x - centerX) / centerX) * 4;
        
        gsap.to(card, {
          rotationX: tiltX,
          rotationY: tiltY,
          transformPerspective: 800,
          ease: "power1.out",
          duration: 0.4
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          ease: "power2.out",
          duration: 0.6
        });
      });
    });
  }
  
  // Section reveal animations with stagger
  if (!prefersReducedMotion) {
    // Hero content entrance
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.fromTo(heroContent.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power2.out", delay: 0.3 }
      );
    }
    
    // Bento cards stagger
    gsap.utils.toArray('.bento-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true
          }
        }
      );
    });
    
    // Plan cards stagger
    gsap.utils.toArray('.plan-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          delay: i * 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true
          }
        }
      );
    });
    
    // Trust cards stagger
    gsap.utils.toArray('.trust-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true
          }
        }
      );
    });
    
    // CTA entrance
    const ctaTitle = document.querySelector('.cta-title');
    if (ctaTitle) {
      gsap.fromTo(ctaTitle,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1, scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaTitle,
            start: "top 85%",
            once: true
          }
        }
      );
    }
  }
}


// --- Three.js Scene (Synth Wave & Abstract Hardware) ---
function initBackground3D() {
  if (typeof THREE === 'undefined') {
    console.error("Three.js not loaded. Check internet or CDN blockers.");
    // Sem mensagem de erro para o visitante: cai no fundo em CSS
    document.body.classList.add('bg-lite');
  } else {
    const canvas = document.getElementById('webgl-canvas');
  
  if (canvas) {
    let renderer, scene, camera;
    try {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x05040a, 0.04);

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 15);

      renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: !isMobile,
        powerPreference: "high-performance" 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowEnd ? 1 : 1.5));
    } catch (e) {
      console.error("Three.js Init Error:", e);
      // Fallback silencioso: fundo em CSS
      document.body.classList.add('bg-lite');
    }

    if (renderer) {

    // --- Synth Wave (Particle Line) ---
    const waveParams = {
      count: isLowEnd ? 120 : 200, // menos partículas em PCs fracos
      amplitude: 2.0,
      frequency: 0.5,
      speed: 0.02
    };
    
    const waveGeometry = new THREE.BufferGeometry();
    const wavePositions = new Float32Array(waveParams.count * 3);
    for (let i = 0; i < waveParams.count; i++) {
      wavePositions[i*3] = (i / waveParams.count) * 40 - 20;
      wavePositions[i*3+1] = 0;
      wavePositions[i*3+2] = (Math.random() - 0.5) * 5;
    }
    waveGeometry.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    
    const waveMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        amplitude: { value: waveParams.amplitude },
        frequency: { value: waveParams.frequency },
        colorMain: { value: new THREE.Color(0x8b5cf6) },
        colorSec: { value: new THREE.Color(0x06b6d4) },
        uFade: { value: 1 }
      },
      vertexShader: `
        uniform float time;
        uniform float amplitude;
        uniform float frequency;
        varying vec3 vPos;
        
        void main() {
          vec3 pos = position;
          float n = sin(pos.x * frequency + time) * cos(pos.z * frequency + time * 0.5);
          pos.y += n * amplitude;
          vPos = pos;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (15.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uFade;
        uniform vec3 colorMain;
        uniform vec3 colorSec;
        varying vec3 vPos;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = (0.5 - dist) * 2.0;
          vec3 col = mix(colorSec, colorMain, (vPos.y + 2.0) / 4.0);
          gl_FragColor = vec4(col, alpha * 0.8 * uFade);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const wavePoints = new THREE.Points(waveGeometry, waveMaterial);
    scene.add(wavePoints);

    // --- 3D Hardware (CPU, RAM, GPU) ---
    // Mesmo estilo wireframe, com formas mais legíveis (contorno claro sobre preenchimento escuro)
    // e brilho roxo/ciano atrás de cada peça, nas cores do fundo novo.
    const hwGroup = new THREE.Group();
    const edgeMatCyan = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 });
    const edgeMatPurple = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.8 });
    const solidMat = new THREE.MeshBasicMaterial({ color: 0x0b0a18 });
    const accentPurple = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.9 });
    const accentCyan = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.9 });
    const dotsMat = new THREE.PointsMaterial({ color: 0x67e8f9, size: 0.05, transparent: true, opacity: 0.8 });
    const glows = [];

    // Caixa escura com contorno
    function wireBox(w, h, d, edgeMat, x = 0, y = 0, z = 0) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), solidMat);
      m.position.set(x, y, z);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), edgeMat));
      return m;
    }
    // Conjunto de segmentos [x1,y1,z1,x2,y2,z2]
    function segs(list, mat) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(list.flat(), 3));
      return new THREE.LineSegments(g, mat);
    }
    // Brilho difuso atrás da peça
    function makeGlow(colorHex, scale) {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.3)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c), color: colorHex, transparent: true,
        opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      sprite.scale.set(scale, scale, 1);
      sprite.position.z = -0.6;
      glows.push(sprite);
      return sprite;
    }

    // 1. CPU: substrato, IHS em degrau, contatos ao redor, entalhe e gravação
    const cpuGroup = new THREE.Group();
    cpuGroup.add(wireBox(2.3, 0.08, 2.3, edgeMatPurple));
    cpuGroup.add(wireBox(1.55, 0.14, 1.55, edgeMatCyan, 0, 0.11, 0));
    cpuGroup.add(wireBox(1.3, 0.05, 1.3, edgeMatPurple, 0, 0.215, 0));
    const cpuDots = [];
    for (let ix = -5; ix <= 5; ix++) {
      for (let iz = -5; iz <= 5; iz++) {
        if (Math.abs(ix) <= 3 && Math.abs(iz) <= 3) continue; // área coberta pelo IHS
        cpuDots.push(ix * 0.2, 0.05, iz * 0.2);
      }
    }
    const cpuPins = new THREE.BufferGeometry();
    cpuPins.setAttribute('position', new THREE.Float32BufferAttribute(cpuDots, 3));
    cpuGroup.add(new THREE.Points(cpuPins, dotsMat));
    cpuGroup.add(segs([
      [-0.45, 0.245, -0.25, 0.45, 0.245, -0.25],
      [-0.45, 0.245, 0.0, 0.2, 0.245, 0.0],
      [-0.45, 0.245, 0.25, 0.45, 0.245, 0.25],
      [-1.1, 0.05, -1.1, -0.8, 0.05, -1.1],
      [-0.8, 0.05, -1.1, -1.1, 0.05, -0.8],
      [-1.1, 0.05, -0.8, -1.1, 0.05, -1.1]
    ], edgeMatCyan));
    cpuGroup.add(makeGlow(0x8b5cf6, 7));
    cpuGroup.position.set(7.5, 4, -5);
    cpuGroup.rotation.set(0.95, -0.45, 0.2);
    cpuGroup.userData = { floatOffset: 0, baseRotY: -0.45 };

    // 2. RAM: PCB, dissipador dos dois lados, barra de luz, aletas e conector com entalhe
    const ramGroup = new THREE.Group();
    ramGroup.add(wireBox(3.7, 1.0, 0.06, edgeMatCyan));
    ramGroup.add(wireBox(3.4, 0.62, 0.05, edgeMatPurple, 0, 0.1, 0.06));
    ramGroup.add(wireBox(3.4, 0.62, 0.05, edgeMatPurple, 0, 0.1, -0.06));
    const ramLed = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.07, 0.16), accentPurple);
    ramLed.position.set(0, 0.46, 0);
    ramGroup.add(ramLed);
    ramGroup.add(segs([
      [-1.5, -0.05, 0.09, 1.5, -0.05, 0.09],
      [-1.5, 0.1, 0.09, 1.5, 0.1, 0.09],
      [-1.5, 0.25, 0.09, 1.5, 0.25, 0.09]
    ], edgeMatCyan));
    const ramContacts = [];
    for (let i = 0; i < 30; i++) {
      const x = -1.75 + i * 0.12;
      if (Math.abs(x - 0.35) < 0.07) continue; // entalhe do slot
      ramContacts.push([x, -0.5, 0.035, x, -0.36, 0.035]);
    }
    ramGroup.add(segs(ramContacts, edgeMatPurple));
    ramGroup.add(makeGlow(0x06b6d4, 8));
    ramGroup.position.set(-10.5, -4.4, -3);
    ramGroup.rotation.set(0.25, -0.55, -0.3);
    ramGroup.userData = { floatOffset: 2, baseRotY: -0.55 };

    // 3. GPU: carcaça chanfrada, backplate, 3 ventoinhas com pás, PCIe, conector de energia e LED
    const gpuGroup = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(-3.1, -0.85);
    shape.lineTo(3.1, -0.85);
    shape.lineTo(3.1, 0.5);
    shape.lineTo(2.75, 0.85);
    shape.lineTo(-2.75, 0.85);
    shape.lineTo(-3.1, 0.5);
    shape.closePath();
    const shroudGeo = new THREE.ExtrudeGeometry(shape, { depth: 1.3, bevelEnabled: false });
    shroudGeo.translate(0, 0, -0.65);
    const shroud = new THREE.Mesh(shroudGeo, solidMat);
    shroud.add(new THREE.LineSegments(new THREE.EdgesGeometry(shroudGeo, 20), edgeMatPurple));
    gpuGroup.add(shroud);
    gpuGroup.add(wireBox(5.9, 1.45, 0.08, edgeMatCyan, 0, 0, -0.74));

    function makeFan() {
      const fan = new THREE.Group();
      fan.name = 'fan';
      fan.add(new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.025, 6, 40), accentCyan));
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16), solidMat);
      hub.rotation.x = Math.PI / 2;
      hub.add(new THREE.LineSegments(new THREE.EdgesGeometry(hub.geometry), edgeMatPurple));
      fan.add(hub);
      for (let b = 0; b < 9; b++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.012), solidMat);
        blade.add(new THREE.LineSegments(new THREE.EdgesGeometry(blade.geometry), edgeMatCyan));
        blade.position.x = 0.42;
        blade.rotation.x = 0.5; // inclinação da pá
        const holder = new THREE.Group();
        holder.rotation.z = (b / 9) * Math.PI * 2;
        holder.add(blade);
        fan.add(holder);
      }
      return fan;
    }
    for (let i = -1; i <= 1; i++) {
      const fan = makeFan();
      fan.position.set(i * 2.0, 0, 0.68);
      gpuGroup.add(fan);
    }
    const pcieFingers = [];
    for (let i = 0; i < 22; i++) {
      if (i === 15) continue; // entalhe do slot
      const x = -2.8 + i * 0.1;
      pcieFingers.push([x, -1.02, -0.2, x, -0.85, -0.2]);
    }
    gpuGroup.add(segs(pcieFingers, edgeMatCyan));
    gpuGroup.add(wireBox(0.8, 0.16, 0.3, edgeMatCyan, 2.2, 0.93, -0.3));
    const gpuLed = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.05, 0.05), accentPurple);
    gpuLed.position.set(0, 0.8, 0.66);
    gpuGroup.add(gpuLed);
    gpuGroup.add(makeGlow(0x8b5cf6, 11));
    gpuGroup.position.set(9.5, 1, -8);
    gpuGroup.rotation.set(0.3, -0.5, 0.05);
    gpuGroup.userData = { floatOffset: 4, baseRotY: -0.5 };

    hwGroup.add(cpuGroup, ramGroup, gpuGroup);
    scene.add(hwGroup);

    // Posições mais próximas do centro; ajustam à proporção da tela
    const hwBaseX = new Map([[cpuGroup, 7.5], [ramGroup, -10.5], [gpuGroup, 9.5]]);
    function placeHardware() {
      const spread = Math.max(0.8, Math.min(1.15, window.innerWidth / window.innerHeight / 1.78));
      hwBaseX.forEach((x, g) => { g.position.x = x * spread; });
    }
    placeHardware();

    // --- Mouse Parallax ---
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    if (!isMobile) {
      document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.001;
        mouseY = (event.clientY - windowHalfY) * 0.001;
      }, { passive: true });
    }

    // --- Render Loop ---
    const clock = new THREE.Clock();
    let isPageVisible = true;
    
    // Pause rendering when tab is hidden (performance-engineer)
    document.addEventListener('visibilitychange', () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        clock.getDelta(); // Reset delta to avoid jump
        animate();
      }
    });

    // Intensidade do fundo por seção (alterada pelo scroll) e limite de quadros
    const hwFade = { v: 1, wave: 1 };
    let lastFrame = 0;
    const frameInterval = isLowEnd ? 1000 / 30 : 1000 / 50;

    function animate(now = 0) {
      if (!isPageVisible) return;
      requestAnimationFrame(animate);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;

      edgeMatCyan.opacity = 0.8 * hwFade.v;
      edgeMatPurple.opacity = 0.8 * hwFade.v;
      accentPurple.opacity = 0.9 * hwFade.v;
      accentCyan.opacity = 0.9 * hwFade.v;
      dotsMat.opacity = 0.8 * hwFade.v;
      glows.forEach((g) => { g.material.opacity = 0.4 * hwFade.v; });
      waveMaterial.uniforms.uFade.value = hwFade.wave;
      
      const elapsedTime = clock.getElapsedTime();

      // Mouse Parallax (smooth interpolation)
      if (!isMobile) {
        const targetX = mouseX * 1.5;
        const targetY = mouseY * 1.5;
        camera.position.x += (targetX - camera.position.x) * 0.03;
        camera.position.y += (-targetY - camera.position.y) * 0.03;
        camera.lookAt(scene.position);
      }

      // Wave
      waveMaterial.uniforms.time.value = (prefersReducedMotion ? 0 : elapsedTime) * waveParams.speed * 50;
      waveMaterial.uniforms.amplitude.value = waveParams.amplitude;

      // Hardware Floating & Spinning
      hwGroup.children.forEach(child => {
        child.rotation.y = child.userData.baseRotY + (prefersReducedMotion ? 0 : Math.sin(elapsedTime * 0.35 + child.userData.floatOffset) * 0.35); // balanço suave (mantém a peça legível)
        if (!prefersReducedMotion) child.position.y += Math.sin(elapsedTime * 2 + child.userData.floatOffset) * 0.002; // flutuação lenta
        
        // If this is the GPU, spin its fans
        if (child === gpuGroup) {
          child.children.forEach(c => {
            if (c.name === 'fan') {
              if (!prefersReducedMotion) c.rotation.z += 0.04; // Smooth fan speed
            }
          });
        }
      });

      renderer.render(scene, camera);
    }

    animate();

    // --- ScrollTrigger for 3D Storytelling ---
    if (typeof ScrollTrigger !== 'undefined') {
      
      // Continuous Parallax Tracking for all hardware across the entire page
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 2.5, // Increased scrub for much smoother, lazier inertia
        onUpdate: (self) => {
          const p = self.progress; // 0 to 1 across the whole page

          // Synth Wave flattens out slightly as you scroll down
          waveParams.amplitude = 2.0 - (p * 0.5);
          
          // CPU drifts downwards and slightly rotates
          cpuGroup.position.y = 4 - (p * 6);
          cpuGroup.rotation.z = 0.2 + (p * 0.8);
          
          // RAM drifts upwards and slowly spins
          ramGroup.position.y = -4.4 + (p * 5.5);
          ramGroup.rotation.z = -0.3 + (p * 1.0);
          
          // GPU moves forward (Z) and slightly drifts down
          gpuGroup.position.y = 1 - (p * 2); 
          gpuGroup.position.z = -8 + (p * 5); // Approaches the camera
          gpuGroup.rotation.x = 0.3 - (p * 0.4);
        }
      });

      // Elite Plan Color Shift (Keep this localized)
      ScrollTrigger.create({
        trigger: ".card-elite",
        start: "top center",
        onEnter: () => {
          gsap.to(waveParams, { speed: 0.05, duration: 1.2, ease: "power2.out" });
          gsap.to(waveMaterial.uniforms.colorMain.value, { r: 0.02, g: 0.71, b: 0.83, duration: 1.2 });
        },
        onLeaveBack: () => {
          gsap.to(waveParams, { speed: 0.02, duration: 1.2, ease: "power2.out" });
          gsap.to(waveMaterial.uniforms.colorMain.value, { r: 0.54, g: 0.36, b: 0.96, duration: 1.2 });
        }
      });

      // Hero em destaque; nas demais seções o fundo recua para não competir com o conteúdo
      const fadeStops = [
        ['.hero', 1, 1],
        ['#problema', 0.6, 0.7],
        ['#planos', 0.4, 0.55],
        ['#processo', 0.35, 0.5],
        ['#resultados', 0.28, 0.45],
        ['#faq', 0.2, 0.4],
        ['.final-cta', 0.35, 0.6],
        ['.footer', 0.12, 0.3]
      ];
      fadeStops.forEach(([sel, hw, wave]) => {
        const el = document.querySelector(sel);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          end: 'bottom 70%',
          onToggle: (self) => {
            if (self.isActive) gsap.to(hwFade, { v: hw, wave, duration: 0.9, ease: 'power2.out', overwrite: true });
          }
        });
      });
    }

    // Handle Resize (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        placeHardware();
      }, 150);
    }, { passive: true });
    }
  }
}
}

// Three.js (~600 KB) só é baixado depois que a página terminou de carregar, e nunca no modo leve.
// Assim ele não atrasa o conteúdo principal (LCP) nem a resposta aos cliques (INP).
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

if (is3DEnabled) {
  const startBackground = () =>
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
      .then(initBackground3D)
      .catch(() => document.body.classList.add('bg-lite'));
  const whenIdle = () => ('requestIdleCallback' in window
    ? requestIdleCallback(startBackground, { timeout: 2500 })
    : setTimeout(startBackground, 800));
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}

// Auto-expand cards on mobile carousel scroll
const plansGrid = document.querySelector('.plans-grid');
const planCards = document.querySelectorAll('.plan-card');

function updateActiveCard() {
  if (window.innerWidth > 1024) {
    // On desktop, remove all active classes (CSS hover handles it)
    planCards.forEach(c => c.classList.remove('active'));
    return;
  }
  
  let closestCard = null;
  let minDistance = Infinity;
  // Calculate the horizontal center of the scroll container
  const gridRect = plansGrid.getBoundingClientRect();
  const gridCenter = gridRect.left + gridRect.width / 2;

  planCards.forEach(card => {
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    const distance = Math.abs(gridCenter - cardCenter);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestCard = card;
    }
  });

  if (closestCard) {
    planCards.forEach(c => {
      if (c !== closestCard) c.classList.remove('active');
    });
    closestCard.classList.add('active');
  }
}

if (plansGrid) {
  plansGrid.addEventListener('scroll', updateActiveCard);
  window.addEventListener('resize', updateActiveCard);
  // Trigger once on load
  setTimeout(updateActiveCard, 100);
}

// Fallback click/touch for cards just in case
planCards.forEach(card => {
  card.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') return;
    if (window.innerWidth <= 1024) {
      // Scroll to the card so it snaps and auto-expands
      this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
});
