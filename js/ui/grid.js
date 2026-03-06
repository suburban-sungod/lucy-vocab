import { WORDS } from '../data/words.js';
import { getWordState, getMasteryState, getMasterySummary } from '../mastery.js';
import { renderWordDetail } from './overlays.js';

export function renderGrid(container, { onPracticeWord }) {
  const summary = getMasterySummary();

  container.innerHTML = `
    <div class="grid-header">
      <div class="grid-title">Mastery Grid</div>
      <div class="grid-subtitle">${summary.mastered} mastered &middot; ${summary.learning + summary.fading + summary.needsReview} learning &middot; ${summary.unseen} new</div>
    </div>
    <div class="mastery-grid" id="mastery-grid"></div>
  `;

  const grid = container.querySelector('#mastery-grid');

  WORDS.forEach(word => {
    const mastery = getWordState(word.hanzi);
    const state = getMasteryState(mastery);

    const icons = {
      'mastered': '&#x2713;',
      'fading': '&#x23F0;',
      'needs-review': '!',
      'learning': '&#x2022;',
      'unseen': ''
    };

    const displayHanzi = word.hanzi.length > 2 ? word.hanzi.slice(0, 2) : word.hanzi;
    const displayEnglish = word.english.length > 10 ? word.english.slice(0, 9) + '...' : word.english;

    const tile = document.createElement('button');
    tile.className = `grid-tile ${state}`;
    tile.innerHTML = `
      ${state !== 'unseen' ? `<span class="grid-tile-icon">${icons[state]}</span>` : ''}
      <span class="grid-tile-hanzi">${displayHanzi}</span>
      <span class="grid-tile-english">${displayEnglish}</span>
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
