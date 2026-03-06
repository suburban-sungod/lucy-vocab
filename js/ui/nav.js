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
    <div style="display:flex;justify-content:center;gap:4px;padding:10px 16px;padding-bottom:calc(10px + env(safe-area-inset-bottom, 0px));background:var(--surface);border-radius:20px;margin:8px 16px;position:fixed;bottom:8px;left:50%;transform:translateX(-50%);max-width:448px;width:calc(100% - 32px);z-index:30;">
      <button class="nav-btn active" data-screen="home" style="flex:1;min-height:44px;border-radius:16px;background:transparent;color:var(--text);border:none;font-size:0.8rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;">
        <span style="font-size:1.2rem;">&#x1F3E0;</span>
        <span>Home</span>
      </button>
      <button class="nav-btn" data-screen="grid" style="flex:1;min-height:44px;border-radius:16px;background:transparent;color:var(--text2);border:none;font-size:0.8rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;">
        <span style="font-size:1.2rem;">&#x1F4CA;</span>
        <span>Mastery</span>
      </button>
      <button class="nav-btn" data-screen="progress" style="flex:1;min-height:44px;border-radius:16px;background:transparent;color:var(--text2);border:none;font-size:0.8rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;">
        <span style="font-size:1.2rem;">&#x1F4C5;</span>
        <span>Progress</span>
      </button>
    </div>
  `;

  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.nav-btn').forEach(b => {
        b.style.color = 'var(--text2)';
        b.classList.remove('active');
      });
      btn.style.color = 'var(--text)';
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
