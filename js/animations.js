import { SADIE_SRC } from '../assets/sadie.js';

export function spawnCoins(count = 8) {
  for (let i = 0; i < count; i++) {
    const coin = document.createElement('div');
    coin.style.cssText = `
      position: fixed;
      width: 16px; height: 16px;
      background: var(--gold);
      border-radius: 50%;
      z-index: 200;
      pointer-events: none;
      left: ${50 + (Math.random() - 0.5) * 30}%;
      top: 50%;
    `;

    document.body.appendChild(coin);

    const angle = (Math.random() - 0.5) * Math.PI;
    const velocity = 200 + Math.random() * 200;
    const vx = Math.cos(angle) * velocity;
    let vy = -velocity * 0.8;
    let x = 0, y = 0;
    let opacity = 1;
    const start = performance.now();

    function animate(time) {
      const dt = (time - start) / 1000;
      if (dt > 1) {
        coin.remove();
        return;
      }
      x = vx * dt;
      vy += 800 * dt;
      y = vy * dt;
      opacity = 1 - dt;
      coin.style.transform = `translate(${x}px, ${y}px)`;
      coin.style.opacity = opacity;
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }
}

export function spawnConfetti(count = 30) {
  const colors = [
    'var(--accent)', 'var(--gold)', 'var(--green)',
    'var(--accent2)', '#ff8800', '#00bcd4'
  ];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    const size = 6 + Math.random() * 6;
    piece.style.cssText = `
      position: fixed;
      width: ${size}px; height: ${size * 1.5}px;
      background: ${colors[i % colors.length]};
      z-index: 200;
      pointer-events: none;
      left: ${Math.random() * 100}%;
      top: -10px;
      border-radius: 2px;
    `;

    document.body.appendChild(piece);

    const vx = (Math.random() - 0.5) * 200;
    const vy = 150 + Math.random() * 300;
    const rot = Math.random() * 720;
    const start = performance.now();

    function animate(time) {
      const dt = (time - start) / 1000;
      if (dt > 2) {
        piece.remove();
        return;
      }
      const x = vx * dt;
      const y = vy * dt;
      const r = rot * dt;
      piece.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
      piece.style.opacity = Math.max(0, 1 - dt / 2);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }
}

export function showSadie() {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fadeIn';
  overlay.innerHTML = `
    <div class="bg-surface rounded-2xl p-6 w-[calc(100%-32px)] max-w-[440px] animate-slideUp text-center">
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
  toast.className = 'fixed flex items-center gap-2.5 bg-surface border-2 border-gold rounded-2xl px-5 py-3 z-[200] shadow-xl animate-slideUp';
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
  popup.style.cssText = 'top: 40%; left: 50%; transform: translate(-50%, -50%); text-shadow: 0 2px 8px rgba(0,0,0,0.5);';
  popup.textContent = text;

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1600);
}

export function showReward(amount, title, subtitle) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fadeIn';
  overlay.innerHTML = `
    <div class="bg-gradient-to-br from-surface to-surface2 rounded-2xl p-6 w-[calc(100%-32px)] max-w-[440px] animate-slideUp text-center border-2 border-gold">
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
