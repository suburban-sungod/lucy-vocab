import { getState } from '../state.js';

export function renderNav({ onNavigate, onThemePicker }) {
  renderTopBar({ onThemePicker });
  renderBottomNav({ onNavigate });
}

function renderTopBar({ onThemePicker }) {
  const bar = document.getElementById('top-bar');
  const state = getState();

  bar.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;">
      <div style="display:flex;align-items:center;gap:6px;font-size:0.9rem;">
        <span>&#x1F525;</span>
        <span style="font-weight:700;">${state.dailyStreak}</span>
      </div>
      <button id="theme-btn" style="width:36px;height:36px;border-radius:50%;background:var(--surface2);color:var(--text);font-size:1rem;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;">&#x1F3A8;</button>
    </div>
  `;

  bar.querySelector('#theme-btn').addEventListener('click', () => {
    if (onThemePicker) onThemePicker();
  });
}

function renderBottomNav({ onNavigate }) {
  const nav = document.getElementById('bottom-nav');

  nav.innerHTML = `
    <div class="bottom-nav-bar">
      <button class="nav-btn active" data-screen="home">
        <span class="nav-icon">&#x1F3E0;</span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-btn" data-screen="grid">
        <span class="nav-icon">&#x1F4CA;</span>
        <span class="nav-label">Mastery</span>
      </button>
      <button class="nav-btn" data-screen="progress">
        <span class="nav-icon">&#x1F4C5;</span>
        <span class="nav-label">Progress</span>
      </button>
    </div>
  `;

  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
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
