import { getState, saveState, resetState } from '../state.js';
import { speakChinese, hasTTS } from '../audio.js';
import { getWordState, getMasteryState } from '../mastery.js';
import { WORDS } from '../data/words.js';

const overlayContainer = () => document.getElementById('overlay-container');

export function clearOverlays() {
  overlayContainer().innerHTML = '';
}

export function renderResults(results, { onDone, onAgain }) {
  const pct = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;

  const mistakesHTML = results.mistakes.length > 0 ? `
    <div class="text-left mb-5">
      <h3 class="text-sm text-txt2 mb-2 font-semibold uppercase tracking-wider">Review these words</h3>
      ${results.mistakes.map(w => `
        <div class="flex items-center gap-3 p-2.5 rounded-xl bg-surface2 mb-1.5">
          <div class="text-xl font-semibold min-w-[50px]">${w.hanzi}</div>
          <div class="flex-1">
            <div class="text-sm text-txt2">${w.pinyin}</div>
            <div class="text-sm">${w.english}</div>
          </div>
          ${hasTTS() ? `<button class="w-9 h-9 rounded-full bg-[var(--surface)] shadow-card-sm flex items-center justify-center text-base active:bg-accent transition-colors" data-hanzi="${w.hanzi}">&#x1f50a;</button>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  const el = document.createElement('div');
  el.className = 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn';
  el.innerHTML = `
    <div class="card p-6 w-[calc(100%-32px)] max-w-[440px] max-h-[90dvh] overflow-y-auto animate-slideUp text-center">
      <div class="text-5xl font-extrabold text-accent mb-1">${pct}%</div>
      <div class="text-base text-txt2 mb-5">${results.correct} of ${results.total} correct</div>
      <div class="text-lg font-semibold text-gold mb-5">+${results.xpEarned || 0} XP</div>
      ${mistakesHTML}
      <div class="flex gap-3">
        <button class="flex-1 py-3.5 rounded-xl bg-surface2 text-txt font-semibold text-base min-h-[44px] active:scale-95 transition-transform" id="results-again">Again</button>
        <button class="flex-1 py-3.5 rounded-xl bg-accent text-white font-semibold text-base min-h-[44px] active:scale-95 transition-transform shadow-card" id="results-done">Done</button>
      </div>
    </div>
  `;

  overlayContainer().appendChild(el);

  el.querySelectorAll('[data-hanzi]').forEach(btn => {
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
  el.className = 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn';
  el.innerHTML = `
    <div class="card p-6 w-[calc(100%-32px)] max-w-[440px] max-h-[90dvh] overflow-y-auto animate-slideUp text-center">
      <button class="w-10 h-10 rounded-full bg-surface2 text-txt text-lg flex items-center justify-center ml-auto mb-3" id="wd-close">&times;</button>
      <div class="text-5xl font-bold mb-2">${word.hanzi}</div>
      <div class="text-lg text-txt2 mb-1">${word.pinyin}</div>
      <div class="text-lg text-txt mb-5">${word.english}</div>
      ${hasTTS() ? '<button class="w-11 h-11 rounded-full bg-surface2 text-txt flex items-center justify-center text-base mx-auto mb-4 active:bg-accent transition-colors shadow-card-sm" id="wd-audio">&#x1f50a;</button>' : ''}
      <div class="flex justify-center gap-6 mb-5">
        <div class="text-center">
          <div class="text-2xl font-bold text-accent">${mastery.streak}</div>
          <div class="text-xs text-txt2 uppercase tracking-wider">Streak</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-accent">${mastery.correct}</div>
          <div class="text-xs text-txt2 uppercase tracking-wider">Correct</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-accent">${lastPracticed}</div>
          <div class="text-xs text-txt2 uppercase tracking-wider">Last Practiced</div>
        </div>
      </div>
      <button class="w-full py-3.5 rounded-xl bg-accent text-white font-semibold min-h-[44px] active:scale-95 transition-transform shadow-card" id="wd-practice">Practice this word</button>
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
