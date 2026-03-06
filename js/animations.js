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
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="overlay-content sadie-popup">
      <img src="${SADIE_SRC}" alt="Sadie">
      <div class="sadie-popup-text">WOOF! Great job!</div>
    </div>
  `;

  document.getElementById('overlay-container').appendChild(overlay);

  overlay.addEventListener('click', () => overlay.remove());
  setTimeout(() => overlay.remove(), 3000);
}

export function showBadgeToast(badge) {
  const toast = document.createElement('div');
  toast.className = 'badge-toast';
  toast.innerHTML = `
    <span class="badge-toast-emoji">${badge.emoji}</span>
    <span class="badge-toast-text">${badge.name} unlocked!</span>
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function showXPPopup(text) {
  const popup = document.createElement('div');
  popup.className = 'xp-popup';
  popup.textContent = text;

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1600);
}

export function showReward(amount, title, subtitle) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay reward-receipt';
  overlay.innerHTML = `
    <div class="overlay-content">
      <div class="reward-title">${title}</div>
      <div class="reward-amount">${amount}</div>
      <div class="reward-subtitle">${subtitle}</div>
      <div class="reward-timestamp">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
      <button class="reward-dismiss" id="reward-dismiss">Awesome!</button>
    </div>
  `;

  document.getElementById('overlay-container').appendChild(overlay);
  overlay.querySelector('#reward-dismiss').addEventListener('click', () => overlay.remove());
}
