import { registerMode } from './mode-registry.js';
import { WORDS } from '../data/words.js';
import { updateWordMastery } from '../mastery.js';

registerMode('pairs', {
  name: 'Pairs',

  setup(container, { questionCount = 10, onComplete, onAnswer }) {
    let slotsUsed = 0;
    const results = [];

    function renderBoard() {
      if (slotsUsed >= questionCount) {
        onComplete(results);
        return;
      }

      const boardWords = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 4);
      const tiles = [];

      boardWords.forEach(w => {
        tiles.push({ type: 'cn', text: w.hanzi, word: w });
        tiles.push({ type: 'en', text: w.english, word: w });
      });

      tiles.sort(() => Math.random() - 0.5);

      let selected = null;
      let matchedCount = 0;

      container.innerHTML = `
        <div class="flex gap-1.5 justify-center py-3">
          ${Array.from({ length: questionCount }, (_, i) => {
            let cls = 'bg-surface2';
            if (i < slotsUsed) cls = results[i] ? 'bg-green' : 'bg-red';
            else if (i === slotsUsed) cls = 'bg-accent animate-pulse';
            return `<div class="w-2.5 h-2.5 rounded-full ${cls}"></div>`;
          }).join('')}
        </div>
        <div class="grid grid-cols-4 gap-2.5 py-3 max-w-[400px] mx-auto w-full" id="pairs-board">
          ${tiles.map((t, i) => `<button class="pairs-tile min-h-[64px] p-2.5 rounded-xl bg-[var(--surface)] shadow-card-sm text-txt text-sm font-medium text-center flex items-center justify-center border border-[var(--border)] transition-all break-words" data-index="${i}" data-hanzi="${t.word.hanzi}" data-type="${t.type}">${t.text}</button>`).join('')}
        </div>
      `;

      const board = container.querySelector('#pairs-board');

      board.addEventListener('click', (e) => {
        const tile = e.target.closest('.pairs-tile');
        if (!tile || tile.classList.contains('pairs-tile-matched')) return;

        if (selected === null) {
          selected = tile;
          tile.style.borderColor = 'var(--accent)';
          tile.style.background = 'var(--accent-soft)';
        } else if (tile === selected) {
          tile.style.borderColor = '';
          tile.style.background = '';
          selected = null;
        } else {
          const h1 = selected.dataset.hanzi;
          const h2 = tile.dataset.hanzi;
          const t1 = selected.dataset.type;
          const t2 = tile.dataset.type;

          if (h1 === h2 && t1 !== t2) {
            selected.style.borderColor = '';
            selected.style.background = '';
            selected.classList.add('pairs-tile-matched');
            tile.classList.add('pairs-tile-matched');
            matchedCount++;
            slotsUsed++;
            results.push(true);

            updateWordMastery(h1, true);
            if (onAnswer) {
              const word = WORDS.find(w => w.hanzi === h1);
              onAnswer(true, word);
            }

            selected = null;

            if (matchedCount >= 4) {
              setTimeout(() => renderBoard(), 400);
            }
          } else {
            selected.style.borderColor = 'var(--red)';
            selected.classList.add('animate-shake');
            tile.style.borderColor = 'var(--red)';
            tile.classList.add('animate-shake');
            slotsUsed++;
            results.push(false);

            if (onAnswer) {
              const word = WORDS.find(w => w.hanzi === h1);
              onAnswer(false, word);
            }

            const prevSelected = selected;
            setTimeout(() => {
              prevSelected.style.borderColor = '';
              prevSelected.style.background = '';
              prevSelected.classList.remove('animate-shake');
              tile.style.borderColor = '';
              tile.classList.remove('animate-shake');
            }, 400);

            selected = null;
          }
        }
      });
    }

    renderBoard();
  },

  cleanup() {}
});
