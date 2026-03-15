import { registerMode } from './mode-registry.js';
import { speakChinese, hasTTS } from '../audio.js';
import { getWordState, updateWordMastery } from '../mastery.js';

registerMode('flashcard', {
  name: 'Flashcard Review',

  setup(container, { words, onComplete }) {
    let currentIndex = 0;

    function renderCard() {
      if (currentIndex >= words.length) {
        onComplete();
        return;
      }

      const word = words[currentIndex];
      const mastery = getWordState(word.hanzi);

      container.innerHTML = `
        <div class="flashcard-container w-full max-w-[300px] mx-auto">
          <div class="flashcard relative w-full aspect-[3/4] cursor-pointer" id="flashcard">
            <div class="flashcard-face absolute inset-0 rounded-2xl bg-surface flex flex-col items-center justify-center p-6 gap-3">
              <div class="text-5xl font-bold leading-tight text-center">${word.hanzi}</div>
              ${hasTTS() ? '<button class="w-11 h-11 rounded-full bg-surface2 text-txt flex items-center justify-center text-lg active:bg-accent transition-colors" id="fc-audio">&#x1f50a;</button>' : ''}
            </div>
            <div class="flashcard-face flashcard-back absolute inset-0 rounded-2xl bg-surface flex flex-col items-center justify-center p-6 gap-3">
              <div class="text-xl text-txt2">${word.pinyin}</div>
              <div class="text-lg text-txt">${word.english}</div>
            </div>
          </div>
          <div class="flex gap-1.5 justify-center mt-2">
            ${[0, 1, 2].map(i => `<div class="w-2.5 h-2.5 rounded-full ${i < mastery.streak ? 'bg-green' : 'bg-surface2'}"></div>`).join('')}
          </div>
          <div class="flex gap-4 justify-center mt-5" id="fc-actions" style="visibility: hidden;">
            <button class="min-w-[44px] min-h-[44px] px-6 py-3 rounded-3xl bg-red text-white font-semibold active:scale-95 transition-transform" id="fc-need">Need practice</button>
            <button class="min-w-[44px] min-h-[44px] px-6 py-3 rounded-3xl bg-green text-black font-semibold active:scale-95 transition-transform" id="fc-got">Got it!</button>
          </div>
        </div>
      `;

      const card = container.querySelector('#flashcard');
      const actions = container.querySelector('#fc-actions');

      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        if (card.classList.contains('flipped')) {
          actions.style.visibility = 'visible';
        }
      });

      const audioBtn = container.querySelector('#fc-audio');
      if (audioBtn) {
        audioBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          speakChinese(word.hanzi);
        });
      }

      container.querySelector('#fc-got').addEventListener('click', () => {
        updateWordMastery(word.hanzi, true);
        currentIndex++;
        renderCard();
      });

      container.querySelector('#fc-need').addEventListener('click', () => {
        updateWordMastery(word.hanzi, false);
        currentIndex++;
        renderCard();
      });
    }

    renderCard();
  },

  cleanup() {}
});
