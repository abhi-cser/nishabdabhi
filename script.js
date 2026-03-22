// ============================================================
// CURSOR-REACTIVE MUSICAL PARTICLE CANVAS
// ============================================================
(function () {
  const canvas = document.getElementById('musicCanvas');
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  let mouse = { x: W / 2, y: H / 2 };
  let targetMouse = { x: W / 2, y: H / 2 };

  canvas.width = W;
  canvas.height = H;

  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  });

  window.addEventListener('mousemove', (e) => {
    targetMouse.x = e.clientX;
    targetMouse.y = e.clientY;
  });

  // Musical symbols
  const SYMBOLS = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♮', '♯', '𝅗𝅥', '𝆕'];
  const GOLD = 'rgba(201,168,76,';

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = initial ? Math.random() * W : Math.random() * W;
      this.y = initial ? Math.random() * H : Math.random() * H + H;
      this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      this.size = 10 + Math.random() * 14;
      this.baseAlpha = 0.04 + Math.random() * 0.1;
      this.alpha = this.baseAlpha;
      this.speed = 0.08 + Math.random() * 0.18;
      this.drift = (Math.random() - 0.5) * 0.15;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.005;
      this.parallax = 0.01 + Math.random() * 0.04; // how much they react to mouse
      this.ox = this.x; // origin x
      this.oy = this.y;
    }

    update(mx, my) {
      // Gentle upward drift
      this.oy -= this.speed;
      this.ox += this.drift;
      this.rotation += this.rotationSpeed;

      // Mouse parallax: particles shift slightly toward / away from cursor
      const dx = mx - W / 2;
      const dy = my - H / 2;
      this.x = this.ox + dx * this.parallax;
      this.y = this.oy + dy * this.parallax;

      // Mouse proximity glow
      const distX = mx - this.x;
      const distY = my - this.y;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const glow = Math.max(0, 1 - dist / 220);
      this.alpha = this.baseAlpha + glow * 0.35;

      // Reset when drifted off top
      if (this.oy < -60) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = Math.min(this.alpha, 0.65);
      ctx.fillStyle = GOLD + this.alpha + ')';
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.symbol, 0, 0);
      ctx.restore();
    }
  }

  // Spawn particles
  const PARTICLE_COUNT = 40;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  // Additional burst particles on click
  const bursts = [];

  window.addEventListener('click', (e) => {
    for (let i = 0; i < 6; i++) {
      bursts.push({
        x: e.clientX,
        y: e.clientY,
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        size: 14 + Math.random() * 10,
        alpha: 0.7,
        vx: (Math.random() - 0.5) * 3,
        vy: -1 - Math.random() * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.06,
        life: 1,
      });
    }
  });

  function animateBursts() {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.03; // gentle gravity
      b.alpha *= 0.93;
      b.life -= 0.015;
      b.rotation += b.rotSpeed;
      if (b.life <= 0 || b.alpha < 0.01) {
        bursts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rotation);
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = GOLD + b.alpha + ')';
      ctx.font = `${b.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.symbol, 0, 0);
      ctx.restore();
    }
  }

  function loop() {
    // Smooth mouse lerp
    mouse.x += (targetMouse.x - mouse.x) * 0.06;
    mouse.y += (targetMouse.y - mouse.y) * 0.06;

    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.update(mouse.x, mouse.y);
      p.draw(ctx);
    });

    animateBursts();

    requestAnimationFrame(loop);
  }

  loop();
})();

// ============================================================
// NAVIGATION — scrolled state
// ============================================================
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// ============================================================
// REVEAL ON SCROLL (Intersection Observer)
// ============================================================
const revealEls = document.querySelectorAll(
  '.about-card, .release-card, .connect-card, .connect-right-col, .about-text, .about-aside, .section-heading, .section-label, .connect-sub, .connect-card-backloggers'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentNode?.children || []);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.min(idx * 70, 250));
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.07, rootMargin: '0px 0px -30px 0px' }
);

revealEls.forEach(el => observer.observe(el));

// ============================================================
// FOOTER YEAR
// ============================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ============================================================
// SMOOTH ANCHOR OFFSET
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
