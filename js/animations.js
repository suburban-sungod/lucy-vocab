import { SADIE_SRC } from '../assets/sadie.js';

export function spawnCoins(count = 8) {
  for (let i = 0; i < count; i++) {
    const coin = document.createElement('div');
    coin.style.cssText = `
      position: fixed; width: 16px; height: 16px;
      background: var(--gold); border-radius: 50%;
      z-index: 200; pointer-events: none;
      left: ${50 + (Math.random() - 0.5) * 30}%; top: 50%;
    `;
    document.body.appendChild(coin);

    const angle = (Math.random() - 0.5) * Math.PI;
    const velocity = 200 + Math.random() * 200;
    const vx = Math.cos(angle) * velocity;
    let vy = -velocity * 0.8;
    const start = performance.now();

    function animate(time) {
      const dt = (time - start) / 1000;
      if (dt > 1) { coin.remove(); return; }
      const x = vx * dt;
      vy += 800 * dt;
      const y = vy * dt;
      coin.style.transform = `translate(${x}px, ${y}px)`;
      coin.style.opacity = 1 - dt;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
}

export function spawnConfetti(count = 30) {
  const colors = ['var(--accent)', 'var(--gold)', 'var(--green)', 'var(--accent2)', '#ff8800', '#00bcd4'];
  spawnParticles(count, colors, { shape: 'rect' });
}

export function spawnCelebration(effectId) {
  switch (effectId) {
    case 'stars': spawnStars(); break;
    case 'hearts': spawnHearts(); break;
    case 'sparkle': spawnSparkle(); break;
    case 'rainbow': spawnRainbow(); break;
    default: spawnConfetti(); break;
  }
}

function spawnStars() {
  const colors = ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff', '#fef3c7'];
  for (let i = 0; i < 20; i++) {
    const star = document.createElement('div');
    star.textContent = '\u2605';
    star.style.cssText = `
      position: fixed; font-size: ${12 + Math.random() * 16}px;
      color: ${colors[i % colors.length]}; z-index: 200; pointer-events: none;
      left: ${Math.random() * 100}%; top: -10px;
    `;
    document.body.appendChild(star);
    animateParticle(star);
  }
}

function spawnHearts() {
  const colors = ['#ec4899', '#f472b6', '#fb7185', '#fda4af', '#f43f5e'];
  for (let i = 0; i < 20; i++) {
    const heart = document.createElement('div');
    heart.textContent = '\u2665';
    heart.style.cssText = `
      position: fixed; font-size: ${14 + Math.random() * 14}px;
      color: ${colors[i % colors.length]}; z-index: 200; pointer-events: none;
      left: ${Math.random() * 100}%; top: -10px;
    `;
    document.body.appendChild(heart);
    animateParticle(heart);
  }
}

function spawnSparkle() {
  const colors = ['#fbbf24', '#ffffff', '#6366f1', '#34d399', '#f472b6'];
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    const size = 4 + Math.random() * 6;
    dot.style.cssText = `
      position: fixed; width: ${size}px; height: ${size}px;
      background: ${colors[i % colors.length]}; border-radius: 50%;
      z-index: 200; pointer-events: none;
      left: ${Math.random() * 100}%; top: ${Math.random() * 60 + 10}%;
      box-shadow: 0 0 ${size * 2}px ${colors[i % colors.length]};
    `;
    document.body.appendChild(dot);

    const start = performance.now();
    const duration = 800 + Math.random() * 600;
    function animate(time) {
      const dt = (time - start) / duration;
      if (dt > 1) { dot.remove(); return; }
      dot.style.transform = `scale(${1 - dt})`;
      dot.style.opacity = 1 - dt;
      requestAnimationFrame(animate);
    }
    setTimeout(() => requestAnimationFrame(animate), Math.random() * 400);
  }
}

function spawnRainbow() {
  const rainbow = ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  spawnParticles(35, rainbow, { shape: 'rect' });
}

function spawnParticles(count, colors, { shape = 'rect' } = {}) {
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    const size = 6 + Math.random() * 6;
    piece.style.cssText = `
      position: fixed;
      width: ${size}px; height: ${shape === 'rect' ? size * 1.5 : size}px;
      background: ${colors[i % colors.length]};
      z-index: 200; pointer-events: none;
      left: ${Math.random() * 100}%; top: -10px;
      border-radius: ${shape === 'circle' ? '50%' : '2px'};
    `;
    document.body.appendChild(piece);
    animateParticle(piece);
  }
}

function animateParticle(el) {
  const vx = (Math.random() - 0.5) * 200;
  const vy = 150 + Math.random() * 300;
  const rot = Math.random() * 720;
  const start = performance.now();

  function animate(time) {
    const dt = (time - start) / 1000;
    if (dt > 2) { el.remove(); return; }
    el.style.transform = `translate(${vx * dt}px, ${vy * dt}px) rotate(${rot * dt}deg)`;
    el.style.opacity = Math.max(0, 1 - dt / 2);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

export function showSadie() {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn';
  overlay.innerHTML = `
    <div class="card p-6 w-[calc(100%-32px)] max-w-[440px] animate-slideUp text-center">
      <img src="${SADIE_SRC}" alt="Sadie" class="w-[200px] h-[200px] rounded-full object-cover mx-auto mb-3 border-4 border-gold animate-pop">
      <div class="text-xl font-bold text-gold">WOOF! Great job!</div>
    </div>
  `;
  document.getElementById('overlay-container').appendChild(overlay);
  overlay.addEventListener('click', () => overlay.remove());
  setTimeout(() => overlay.remove(), 3000);
}

export function showBadgeToast(badge) {
  const toast = document.createElement('div');
  toast.className = 'fixed flex items-center gap-2.5 bg-[var(--surface)] border-2 border-gold rounded-2xl px-5 py-3 z-[200] shadow-card-lg animate-slideUp';
  toast.style.cssText = `top: calc(20px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%);`;
  toast.innerHTML = `
    <span class="text-3xl">${badge.emoji}</span>
    <span class="font-semibold">${badge.name} unlocked!</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function showXPPopup(text) {
  const popup = document.createElement('div');
  popup.className = 'fixed z-[150] pointer-events-none text-2xl font-extrabold text-gold animate-pop';
  popup.style.cssText = 'top: 40%; left: 50%; transform: translate(-50%, -50%); text-shadow: 0 2px 8px rgba(0,0,0,0.3);';
  popup.textContent = text;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1600);
}

export function showReward(amount, title, subtitle) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn';
  overlay.innerHTML = `
    <div class="card p-6 w-[calc(100%-32px)] max-w-[440px] animate-slideUp text-center ring-2 ring-gold">
      <div class="text-xl font-bold mb-1">${title}</div>
      <div class="text-5xl font-extrabold text-gold my-4">${amount}</div>
      <div class="text-sm text-txt2 mb-1">${subtitle}</div>
      <div class="text-xs text-txt2 mb-4">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
      <button class="px-8 py-3 rounded-xl bg-gold text-black font-semibold min-h-[44px] active:scale-95 transition-transform" id="reward-dismiss">Awesome!</button>
    </div>
  `;
  document.getElementById('overlay-container').appendChild(overlay);
  overlay.querySelector('#reward-dismiss').addEventListener('click', () => overlay.remove());
}
