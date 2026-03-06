import { registerMode } from './mode-registry.js';
import { WORDS } from '../data/words.js';
import { updateWordMastery } from '../mastery.js';

registerMode('pairs', {
  name: 'Pairs',

  setup(container, { questionCount = 10, onComplete, onAnswer }) {
    let slotsUsed = 0;
    let boardNum = 0;
    const results = [];

    function renderBoard() {
      if (slotsUsed >= questionCount) {
        onComplete(results);
        return;
      }

      boardNum++;
      const boardWords = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 4);
      const tiles = [];

      boardWords.forEach(w => {
        tiles.push({ type: 'cn', text: w.hanzi, word: w });
        tiles.push({ type: 'en', text: w.english, word: w });
      });

      tiles.sort(() => Math.random() - 0.5);

      let selected = null;
      let matchedCount = 0;
      const startTime = Date.now();

      container.innerHTML = `
        <div class="progress-dots">
          ${Array.from({ length: questionCount }, (_, i) => {
            let cls = '';
            if (i < slotsUsed) cls = results[i] ? 'correct' : 'wrong';
            else if (i === slotsUsed) cls = 'active';
            return `<div class="progress-dot ${cls}"></div>`;
          }).join('')}
        </div>
        <div class="pairs-board" id="pairs-board">
          ${tiles.map((t, i) => `<button class="pairs-tile" data-index="${i}" data-hanzi="${t.word.hanzi}" data-type="${t.type}">${t.text}</button>`).join('')}
        </div>
      `;

      const board = container.querySelector('#pairs-board');
      const tileEls = board.querySelectorAll('.pairs-tile');

      board.addEventListener('click', (e) => {
        const tile = e.target.closest('.pairs-tile');
        if (!tile || tile.classList.contains('matched')) return;

        if (selected === null) {
          selected = tile;
          tile.classList.add('selected');
        } else if (tile === selected) {
          tile.classList.remove('selected');
          selected = null;
        } else {
          const h1 = selected.dataset.hanzi;
          const h2 = tile.dataset.hanzi;
          const t1 = selected.dataset.type;
          const t2 = tile.dataset.type;

          if (h1 === h2 && t1 !== t2) {
            // Correct match
            selected.classList.remove('selected');
            selected.classList.add('matched');
            tile.classList.add('matched');
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
              const elapsed = (Date.now() - startTime) / 1000;
              setTimeout(() => renderBoard(), 400);
            }
          } else {
            // Wrong match
            selected.classList.remove('selected');
            selected.classList.add('wrong');
            tile.classList.add('wrong');
            slotsUsed++;
            results.push(false);

            if (onAnswer) {
              const word = WORDS.find(w => w.hanzi === h1);
              onAnswer(false, word);
            }

            setTimeout(() => {
              selected?.classList.remove('wrong');
              tile.classList.remove('wrong');
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
