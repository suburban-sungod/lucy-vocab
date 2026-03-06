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
        <div class="flashcard-container">
          <div class="flashcard" id="flashcard">
            <div class="flashcard-face flashcard-front">
              <div class="flashcard-hanzi">${word.hanzi}</div>
              ${hasTTS() ? '<button class="audio-btn" id="fc-audio">&#x1f50a;</button>' : ''}
            </div>
            <div class="flashcard-face flashcard-back">
              <div class="flashcard-pinyin">${word.pinyin}</div>
              <div class="flashcard-english">${word.english}</div>
            </div>
          </div>
          <div class="mastery-dots">
            ${[0, 1, 2].map(i => `<div class="mastery-dot ${i < mastery.streak ? 'filled' : ''}"></div>`).join('')}
          </div>
          <div class="card-actions" id="fc-actions" style="visibility: hidden;">
            <button class="btn-need-practice" id="fc-need">Need practice</button>
            <button class="btn-got-it" id="fc-got">Got it!</button>
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
