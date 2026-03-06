import { getState, saveState, resetState } from '../state.js';
import { speakChinese, hasTTS } from '../audio.js';
import { getWordState, getMasteryState } from '../mastery.js';
import { THEMES } from '../data/themes.js';
import { WORDS } from '../data/words.js';
import { startSession } from '../session.js';

const overlayContainer = () => document.getElementById('overlay-container');

export function clearOverlays() {
  overlayContainer().innerHTML = '';
}

export function renderResults(results, { onDone, onAgain }) {
  const pct = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;

  const mistakesHTML = results.mistakes.length > 0 ? `
    <div class="results-mistakes">
      <h3>Review these words:</h3>
      ${results.mistakes.map(w => `
        <div class="mistake-item">
          <div class="mistake-hanzi">${w.hanzi}</div>
          <div class="mistake-info">
            <div class="mistake-pinyin">${w.pinyin}</div>
            <div class="mistake-english">${w.english}</div>
          </div>
          ${hasTTS() ? `<button class="audio-btn mistake-audio" data-hanzi="${w.hanzi}">&#x1f50a;</button>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  const el = document.createElement('div');
  el.className = 'overlay results-overlay';
  el.innerHTML = `
    <div class="overlay-content">
      <div class="results-score">${pct}%</div>
      <div class="results-label">${results.correct} of ${results.total} correct</div>
      <div class="results-xp">+${results.xpEarned || 0} XP</div>
      ${mistakesHTML}
      <div class="results-actions">
        <button class="btn-again" id="results-again">Again</button>
        <button class="btn-done" id="results-done">Done</button>
      </div>
    </div>
  `;

  overlayContainer().appendChild(el);

  el.querySelectorAll('.mistake-audio').forEach(btn => {
    btn.addEventListener('click', () => speakChinese(btn.dataset.hanzi));
  });

  el.querySelector('#results-done').addEventListener('click', () => {
    clearOverlays();
    if (onDone) onDone();
  });

  el.querySelector('#results-again').addEventListener('click', () => {
    clearOverlays();
    if (onAgain) onAgain();
  });
}

export function renderWordDetail(word, { onClose, onPractice }) {
  const mastery = getWordState(word.hanzi);
  const state = getMasteryState(mastery);

  const lastPracticed = mastery.lastCorrect
    ? new Date(mastery.lastCorrect).toLocaleDateString()
    : 'Never';

  const el = document.createElement('div');
  el.className = 'overlay';
  el.innerHTML = `
    <div class="overlay-content word-detail">
      <button class="overlay-close" id="wd-close">&times;</button>
      <div class="word-detail-hanzi">${word.hanzi}</div>
      <div class="word-detail-pinyin">${word.pinyin}</div>
      <div class="word-detail-english">${word.english}</div>
      ${hasTTS() ? '<button class="audio-btn" id="wd-audio" style="margin:0 auto 16px;">&#x1f50a;</button>' : ''}
      <div class="word-detail-stats">
        <div class="word-detail-stat">
          <div class="word-detail-stat-value">${mastery.streak}</div>
          <div class="word-detail-stat-label">Streak</div>
        </div>
        <div class="word-detail-stat">
          <div class="word-detail-stat-value">${mastery.correct}</div>
          <div class="word-detail-stat-label">Correct</div>
        </div>
        <div class="word-detail-stat">
          <div class="word-detail-stat-value">${lastPracticed}</div>
          <div class="word-detail-stat-label">Last Practiced</div>
        </div>
      </div>
      <button class="word-detail-practice-btn" id="wd-practice">Practice this word</button>
    </div>
  `;

  overlayContainer().appendChild(el);

  el.querySelector('#wd-close').addEventListener('click', () => {
    el.remove();
    if (onClose) onClose();
  });

  el.addEventListener('click', (e) => {
    if (e.target === el) {
      el.remove();
      if (onClose) onClose();
    }
  });

  const audioBtn = el.querySelector('#wd-audio');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => speakChinese(word.hanzi));
  }

  el.querySelector('#wd-practice').addEventListener('click', () => {
    el.remove();
    if (onPractice) onPractice(word);
  });
}

export function renderThemePicker({ onClose }) {
  const state = getState();

  const el = document.createElement('div');
  el.className = 'overlay';
  el.innerHTML = `
    <div class="overlay-content">
      <button class="overlay-close" id="tp-close">&times;</button>
      <h2 style="margin-bottom:16px;font-size:1.2rem;">Themes</h2>
      <div class="theme-picker">
        ${THEMES.map(t => {
          const unlocked = state.unlockedThemes.includes(t.id);
          const active = state.activeTheme === t.id;
          return `
            <button class="theme-option ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}" data-theme-id="${t.id}" ${!unlocked ? 'disabled' : ''}>
              <div class="theme-swatch" style="background:${t.accent}"></div>
              <div>
                <div class="theme-name">${t.name}</div>
                ${!unlocked && t.badge ? `<div class="theme-lock">Unlock: earn ${t.badge} badge</div>` : ''}
              </div>
            </button>
          `;
        }).join('')}
      </div>
      <button id="tp-reset" style="margin-top:24px;padding:12px;border-radius:12px;background:var(--surface2);color:var(--red);width:100%;font-size:0.9rem;min-height:44px;">Reset All Progress</button>
    </div>
  `;

  overlayContainer().appendChild(el);

  el.querySelector('#tp-close').addEventListener('click', () => {
    el.remove();
    if (onClose) onClose();
  });

  el.addEventListener('click', (e) => {
    if (e.target === el) {
      el.remove();
      if (onClose) onClose();
    }
  });

  el.querySelectorAll('.theme-option:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.themeId;
      document.documentElement.setAttribute('data-theme', id);
      state.activeTheme = id;
      saveState();
      el.remove();
      renderThemePicker({ onClose });
    });
  });

  el.querySelector('#tp-reset').addEventListener('click', () => {
    el.remove();
    renderResetConfirm({ onClose });
  });
}

function renderResetConfirm({ onClose }) {
  const el = document.createElement('div');
  el.className = 'overlay';
  el.innerHTML = `
    <div class="overlay-content reset-confirm">
      <h2 style="margin-bottom:12px;">Reset Progress?</h2>
      <p>This will delete all your progress, badges and streaks. This cannot be undone.</p>
      <div class="reset-confirm-actions">
        <button class="btn-reset-cancel" id="rc-cancel">Cancel</button>
        <button class="btn-reset-confirm" id="rc-confirm">Reset</button>
      </div>
    </div>
  `;

  overlayContainer().appendChild(el);

  el.querySelector('#rc-cancel').addEventListener('click', () => {
    el.remove();
    renderThemePicker({ onClose });
  });

  el.querySelector('#rc-confirm').addEventListener('click', () => {
    resetState();
    document.documentElement.setAttribute('data-theme', 'default');
    el.remove();
    if (onClose) onClose();
    window.location.reload();
  });
}
