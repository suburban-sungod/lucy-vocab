import { getState } from '../state.js';

export function renderNav({ onNavigate }) {
  renderTopBar();
  renderBottomNav({ onNavigate });
}

function renderTopBar() {
  const bar = document.getElementById('top-bar');
  const state = getState();

  bar.innerHTML = `
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-1.5 text-sm text-txt2">
        <span class="text-base">&#x1F525;</span>
        <span class="font-bold text-txt">${state.dailyStreak}</span>
      </div>
      <div class="flex items-center gap-1.5 text-sm font-bold text-gold">
        <span>${state.xp}</span>
        <span class="text-xs font-semibold">XP</span>
      </div>
    </div>
  `;
}

function renderBottomNav({ onNavigate }) {
  const nav = document.getElementById('bottom-nav');

  nav.innerHTML = `
    <div class="flex items-stretch justify-around bg-[var(--surface)] border-t border-[var(--border)]" style="padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));">
      <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 py-1 bg-transparent text-txt transition-colors" data-screen="home">
        <span class="text-xl leading-none">&#x1F3E0;</span>
        <span class="text-[0.6rem] font-semibold uppercase tracking-wide leading-none">Home</span>
      </button>
      <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 py-1 bg-transparent text-txt2 transition-colors" data-screen="grid">
        <span class="text-xl leading-none">&#x1F4CA;</span>
        <span class="text-[0.6rem] font-semibold uppercase tracking-wide leading-none">Mastery</span>
      </button>
      <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 py-1 bg-transparent text-txt2 transition-colors" data-screen="progress">
        <span class="text-xl leading-none">&#x1F4C5;</span>
        <span class="text-[0.6rem] font-semibold uppercase tracking-wide leading-none">Progress</span>
      </button>
      <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 py-1 bg-transparent text-txt2 transition-colors" data-screen="shop">
        <span class="text-xl leading-none">&#x1F6CD;&#xFE0F;</span>
        <span class="text-[0.6rem] font-semibold uppercase tracking-wide leading-none">Shop</span>
      </button>
    </div>
  `;

  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('text-txt');
        b.classList.add('text-txt2');
      });
      btn.classList.remove('text-txt2');
      btn.classList.add('text-txt');
      if (onNavigate) onNavigate(btn.dataset.screen);
    });
  });
}

export function hideNav() {
  document.getElementById('bottom-nav').style.display = 'none';
  document.getElementById('top-bar').style.display = 'none';
}

export function showNav() {
  document.getElementById('bottom-nav').style.display = '';
  document.getElementById('top-bar').style.display = '';
}
