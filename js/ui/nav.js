import { getState } from '../state.js';

export function renderNav({ onNavigate, onThemePicker }) {
  renderTopBar({ onThemePicker });
  renderBottomNav({ onNavigate });
}

function renderTopBar({ onThemePicker }) {
  const bar = document.getElementById('top-bar');
  const state = getState();

  bar.innerHTML = `
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-1.5 text-sm text-txt2">
        <span class="text-base">&#x1F525;</span>
        <span class="font-bold text-txt">${state.dailyStreak}</span>
      </div>
      <button id="theme-btn" class="w-9 h-9 rounded-full bg-surface2 text-txt flex items-center justify-center text-base active:scale-95 transition-transform">&#x1F3A8;</button>
    </div>
  `;

  bar.querySelector('#theme-btn').addEventListener('click', () => {
    if (onThemePicker) onThemePicker();
  });
}

function renderBottomNav({ onNavigate }) {
  const nav = document.getElementById('bottom-nav');

  nav.innerHTML = `
    <div class="flex items-stretch justify-around bg-surface border-t border-surface2" style="padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));">
      <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 py-1 bg-transparent text-txt transition-colors" data-screen="home">
        <span class="text-xl leading-none">&#x1F3E0;</span>
        <span class="text-[0.65rem] font-semibold uppercase tracking-wide leading-none">Home</span>
      </button>
      <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 py-1 bg-transparent text-txt2 transition-colors" data-screen="grid">
        <span class="text-xl leading-none">&#x1F4CA;</span>
        <span class="text-[0.65rem] font-semibold uppercase tracking-wide leading-none">Mastery</span>
      </button>
      <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 py-1 bg-transparent text-txt2 transition-colors" data-screen="progress">
        <span class="text-[1.4rem] leading-none">&#x1F4C5;</span>
        <span class="text-[0.65rem] font-semibold uppercase tracking-wide leading-none">Progress</span>
      </button>
    </div>
  `;

  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.nav-btn').forEach(b => b.classList.replace('text-txt', 'text-txt2') || b.classList.add('text-txt2'));
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
