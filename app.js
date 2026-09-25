/* GLITCH — site behaviour. Zero dependencies on purpose: easier for future automated edits to stay reliable. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
if (isTouch) document.body.classList.add('no-fancy-cursor');

/* ---------------------------------------------------------------- products */

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  try {
    const res = await fetch('products.json', { cache: 'no-store' });
    const products = await res.json();
    if (!Array.isArray(products) || !products.length) {
      grid.innerHTML = '<p class="grid-empty">New designs are on the way.</p>';
      return;
    }
    grid.innerHTML = products.map(renderCard).join('');
    if (!isTouch) grid.querySelectorAll('.card').forEach(attachTilt);
    grid.querySelectorAll('.reveal, .card').forEach((el) => revealObserver.observe(el));
  } catch (e) {
    grid.innerHTML = '<p class="grid-empty">The product list could not be loaded.</p>';
  }
}

function renderCard(p) {
  const price = p.priceMin === p.priceMax
    ? `€${p.priceMin.toFixed(2)}`
    : `€${p.priceMin.toFixed(2)}–${p.priceMax.toFixed(2)}`;
  return `
    <article class="card reveal">
      <div class="thumb"><img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy" /></div>
      <div class="body">
        <span class="kind">${escapeHtml(p.kind)}</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.blurb)}</p>
        <div class="row">
          <span class="price">${price}</span>
          <a class="link" data-magnetic href="https://www.etsy.com/shop/Dataybytes" target="_blank" rel="noopener">View on Etsy →</a>
        </div>
      </div>
    </article>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ------------------------------------------------------------ scroll reveal */

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* -------------------------------------------------------------- 3D tilt */

function attachTilt(el) {
  let raf = 0;
  el.addEventListener('pointermove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateY(-3px)`;
    });
  });
  el.addEventListener('pointerleave', () => {
    el.style.transform = '';
  });
}
if (!isTouch) document.querySelectorAll('[data-tilt]').forEach(attachTilt);

/* -------------------------------------------------------- magnetic buttons */

if (!isTouch) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(x * 0.28).toFixed(1)}px, ${(y * 0.35).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

/* ------------------------------------------------------------ custom cursor */

if (!isTouch) {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let dx = -50, dy = -50, rx = -50, ry = -50;
  window.addEventListener('pointermove', (e) => {
    dx = e.clientX;
    dy = e.clientY;
  });
  const tick = () => {
    rx += (dx - rx) * 0.18;
    ry += (dy - ry) * 0.18;
    dot.style.transform = `translate(${dx}px, ${dy}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  document.querySelectorAll('a, button, [data-tilt], .card').forEach((el) => {
    el.addEventListener('pointerenter', () => ring.classList.add('active'));
    el.addEventListener('pointerleave', () => ring.classList.remove('active'));
  });
}

/* ------------------------------------------------------------- headline glitch */

const heroTitle = document.getElementById('hero-title');
if (heroTitle && !reduceMotion) {
  const burst = () => {
    heroTitle.classList.add('burst');
    setTimeout(() => heroTitle.classList.remove('burst'), 350);
    setTimeout(burst, 2600 + Math.random() * 3200);
  };
  setTimeout(burst, 1400);
}

/* ------------------------------------------------------------- grain canvas */

(function grain() {
  const canvas = document.getElementById('grain');
  const ctx = canvas.getContext('2d', { alpha: true });
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const draw = () => {
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.random() * 255;
      imgData.data[i] = v;
      imgData.data[i + 1] = v;
      imgData.data[i + 2] = v;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  };
  draw();
  if (!reduceMotion) setInterval(draw, 90);
})();

/* --------------------------------------------------------------- hero canvas */

(function heroFx() {
  const canvas = document.getElementById('hero-fx');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();

  const blobs = [
    { x: 0.18, y: 0.15, r: 0.34, hue: 'accent', vx: 0.00011, vy: 0.00007, t: 0 },
    { x: 0.82, y: 0.1, r: 0.28, hue: 'accent2', vx: -0.00009, vy: 0.00013, t: 100 },
    { x: 0.55, y: 0.75, r: 0.3, hue: 'accent', vx: 0.00007, vy: -0.00010, t: 200 },
  ];
  const colors = {
    accent: [124, 92, 255],
    accent2: [55, 230, 196],
  };

  let mx = 0.5, my = 0.3;
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.parentElement.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width;
    my = (e.clientY - r.top) / r.height;
  });

  const frame = (now) => {
    ctx.clearRect(0, 0, w, h);
    for (const b of blobs) {
      b.t = now;
      const bx = (b.x + Math.sin(now * b.vy) * 0.06 + (mx - 0.5) * 0.03) * w;
      const by = (b.y + Math.cos(now * b.vx) * 0.06 + (my - 0.5) * 0.03) * h;
      const radius = b.r * Math.max(w, h);
      const [r, g, bl] = colors[b.hue];
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
      grad.addColorStop(0, `rgba(${r},${g},${bl},0.28)`);
      grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();

/* ------------------------------------------------------------------ nav */

document.querySelectorAll('nav a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const go = () => target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(go);
    else go();
  });
});

/* ----------------------------------------------------------------- boot */

document.getElementById('year').textContent = new Date().getFullYear();
loadProducts();

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 350);
});
