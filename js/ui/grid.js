import { WORDS } from '../data/words.js';
import { getWordState, getMasteryState, getMasterySummary } from '../mastery.js';
import { renderWordDetail } from './overlays.js';

const STATE_BORDER = {
  'mastered': 'border-green',
  'fading': 'border-gold',
  'needs-review': 'border-red',
  'learning': 'border-accent',
  'unseen': 'border-[var(--border)]'
};

const STATE_BADGE_BG = {
  'mastered': 'bg-green text-white',
  'fading': 'bg-gold text-white',
  'needs-review': 'bg-red text-white',
  'learning': 'bg-accent text-white',
};

const STATE_ICONS = {
  'mastered': '&#x2713;',
  'fading': '&#x23F0;',
  'needs-review': '!',
  'learning': '&#x2022;',
};

export function renderGrid(container, { onPracticeWord }) {
  const summary = getMasterySummary();

  container.innerHTML = `
    <div class="text-center py-3 pb-4">
      <div class="text-xl font-bold">Mastery Grid</div>
      <div class="text-sm text-txt2 mt-1">${summary.mastered} mastered &middot; ${summary.learning + summary.fading + summary.needsReview} learning &middot; ${summary.unseen} new</div>
    </div>
    <div class="grid grid-cols-5 gap-2.5 pb-6" id="mastery-grid"></div>
  `;

  const grid = container.querySelector('#mastery-grid');

  WORDS.forEach(word => {
    const mastery = getWordState(word.hanzi);
    const state = getMasteryState(mastery);

    const displayHanzi = word.hanzi.length > 2 ? word.hanzi.slice(0, 2) : word.hanzi;
    const displayEnglish = word.english.length > 10 ? word.english.slice(0, 9) + '...' : word.english;

    const tile = document.createElement('button');
    tile.className = `relative aspect-square rounded-xl bg-[var(--surface)] shadow-card-sm flex flex-col items-center justify-center p-1 border-2 ${STATE_BORDER[state]} active:scale-95 transition-transform`;

    const badge = state !== 'unseen'
      ? `<span class="absolute top-1 right-1 text-[0.5rem] w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none ${STATE_BADGE_BG[state]}">${STATE_ICONS[state]}</span>`
      : '';

    tile.innerHTML = `
      ${badge}
      <span class="text-lg font-bold leading-tight text-center">${displayHanzi}</span>
      <span class="text-[0.55rem] text-txt2 text-center overflow-hidden text-ellipsis whitespace-nowrap max-w-full">${displayEnglish}</span>
    `;

    tile.addEventListener('click', () => {
      renderWordDetail(word, {
        onClose: () => renderGrid(container, { onPracticeWord }),
        onPractice: (w) => {
          if (onPracticeWord) onPracticeWord(w);
        }
      });
    });

    grid.appendChild(tile);
  });
}
